import dns from "node:dns";
import mongoose, { Types } from "mongoose";
import { ENV } from "../config/env";
import { connectDB } from "../config/db";
import { Exoplanet } from "../models/exoplanet-model";
import { User } from "../models/user-model";
import { Image } from "../models/image-model";
import { Observation } from "../models/observation-model";
import { OBSERVACIONES_EJEMPLO } from "./datos-iniciales";

// IMPORTANTE: users, exoplanets y sources contienen datos reales. Este script
// solo añade datos a images y observations. La única escritura permitida en
// exoplanets es la migración del campo antiguo imagen a imagenPrincipal.

// El seed se ejecuta siempre en local, donde algunos DNS de router no
// resuelven los registros SRV de mongodb+srv (igual que en server.ts)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Forma cruda del exoplaneta tal como está en MongoDB. Incluye imagen, que ya
// no existe en el esquema pero puede seguir en documentos sin migrar.
interface ExoplanetaCrudo {
  _id: Types.ObjectId;
  nombre: string;
  imagen?: unknown;
}

async function seed(): Promise<void> {
  try {
    // 1. Conexión con la misma configuración que la API
    await connectDB(ENV.MONGODB_URI);

    // 2. Limpieza. observations se vacía entera, pero images NO: las imágenes
    // migradas son la única copia de las URL originales, porque la migración
    // borra el campo imagen del exoplaneta. Si se borraran, una segunda
    // ejecución del seed ya no podría recrearlas y los exoplanetas quedarían
    // apuntando a imágenes inexistentes. Por eso solo se borran las imágenes
    // que ningún exoplaneta referencia en imagenPrincipal.
    const { deletedCount: observacionesBorradas } = await Observation.deleteMany({});
    const imagenesEnUso = await Exoplanet.distinct("imagenPrincipal", { imagenPrincipal: { $ne: null } });
    const { deletedCount: imagenesBorradas } = await Image.deleteMany({ _id: { $nin: imagenesEnUso } });

    // 3. Datos existentes de los que depende el seed. Se leen con .lean()
    // porque db.ts activa strictQuery y el esquema es estricto: un documento
    // de Mongoose oculta los campos que no están en el esquema, y imagen ya
    // no lo está. lean() devuelve el documento crudo de MongoDB, con imagen.
    const exoplanetas = await Exoplanet.find().sort({ nombre: 1 }).lean<ExoplanetaCrudo[]>();
    const usuarios = await User.find().sort({ createdAt: 1 }).lean();

    // 4. Sin exoplanetas o sin usuarios no hay a quién asociar imágenes ni observaciones
    if (exoplanetas.length === 0 || usuarios.length === 0) {
      throw new Error(
        `El seed necesita exoplanetas y usuarios existentes (encontrados: ${exoplanetas.length} exoplanetas, ${usuarios.length} usuarios). Créalos antes de ejecutarlo.`
      );
    }

    // 5. Migración de imagen (URL en el exoplaneta) a un documento Image.
    // El filtro se hace en JS y no en la consulta: con strictQuery, Mongoose
    // eliminaría del filtro { imagen: ... } por no estar en el esquema.
    const pendientes = exoplanetas.filter(
      (exo) => typeof exo.imagen === "string" && exo.imagen.trim() !== ""
    );

    let imagenesMigradas = 0;
    if (pendientes.length > 0) {
      // La autoría de las imágenes migradas no bloquea el seed: si aún no hay
      // administrador se usa el primer usuario y se avisa
      let responsable = usuarios.find((u) => u.rol === "admin");
      if (!responsable) {
        responsable = usuarios[0];
        console.warn(
          `Aviso: no hay ningún usuario con rol admin. Las imágenes migradas figurarán como subidas por "${responsable.nombre}" (${responsable.email}).`
        );
      }

      for (const exo of pendientes) {
        const imagen = await Image.create({
          titulo: `Imagen de ${exo.nombre}`,
          origen: "enlace",
          url: exo.imagen as string,
          exoplaneta: exo._id,
          subidaPor: responsable._id,
          creditoAutor: "NASA / Archivo original",
          publicada: true,
        });

        // strict: false es imprescindible: con el esquema estricto Mongoose
        // descartaría $unset de imagen sin dar error y el campo seguiría ahí.
        // $set y $unset van en la misma operación para que sea atómica: si
        // fallara, la imagen quedaría sin referenciar y la próxima ejecución
        // la borraría y repetiría la migración de este exoplaneta.
        await Exoplanet.updateOne(
          { _id: exo._id },
          { $set: { imagenPrincipal: imagen._id }, $unset: { imagen: 1 } },
          { strict: false }
        );
        imagenesMigradas++;
      }
    }

    // 6. Observaciones repartidas de forma cíclica entre exoplanetas y usuarios.
    // insertMany valida cada documento con el esquema antes de guardarlo.
    const observaciones = await Observation.insertMany(
      OBSERVACIONES_EJEMPLO.map((obs, i) => ({
        ...obs,
        exoplaneta: exoplanetas[i % exoplanetas.length]._id,
        autor: usuarios[i % usuarios.length]._id,
      }))
    );

    // 7. Resumen
    console.log("Seed completado:");
    console.log(`  - Observaciones borradas: ${observacionesBorradas}`);
    console.log(`  - Imágenes sin referenciar borradas: ${imagenesBorradas}`);
    console.log(`  - Imágenes migradas: ${imagenesMigradas}`);
    console.log(`  - Observaciones creadas: ${observaciones.length}`);
  } catch (err) {
    console.error("Error en el seed:", err);
    // exitCode en lugar de process.exit(1): exit() terminaría el proceso al
    // instante y el finally no llegaría a cerrar la conexión
    process.exitCode = 1;
  } finally {
    // 8. Sin cerrar la conexión el proceso de Node se quedaría abierto
    await mongoose.connection.close();
  }
}

seed();
