import { useNavigate, useParams } from "react-router-dom";
import { FormularioExoplaneta } from "@/components/exoplanetas/FormularioExoplaneta";
import { Alerta } from "@/components/ui/Alerta";
import { EnlaceBoton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useFetch } from "@/hooks/useFetch";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { actualizar, obtener } from "@/services/exoplanetaService";
import type { CambiosExoplaneta } from "@/types";

export default function EditarExoplaneta() {
  const { id = "" } = useParams();
  const { esAutor } = useAuth();
  const notificar = useNotification();
  const navegar = useNavigate();
  const { datos: exoplaneta, cargando, error } = useFetch((signal) => obtener(id, signal), [id]);
  useTituloPagina(exoplaneta ? `editar ${exoplaneta.nombre}` : "editar exoplaneta");

  if (cargando) return <Cargando texto="cargando el exoplaneta" />;

  if (error || !exoplaneta) {
    return (
      <Alerta variante="error">
        <p>{error ?? "exoplaneta no encontrado."}</p>
        <EnlaceBoton to={RUTAS.INICIO}>volver al catálogo</EnlaceBoton>
      </Alerta>
    );
  }

  // lo compruebo antes para no dejar rellenar un formulario que se va a rechazar
  if (!esAutor(exoplaneta.creadoPor)) {
    return (
      <Alerta variante="error">
        <p>{MENSAJES.SIN_PERMISO}</p>
        <EnlaceBoton to={RUTAS.DETALLE(exoplaneta._id)}>volver al exoplaneta</EnlaceBoton>
      </Alerta>
    );
  }

  const enviar = async (cambios: CambiosExoplaneta) => {
    await actualizar(exoplaneta._id, cambios);
    notificar(MENSAJES.GUARDADO);
    navegar(RUTAS.DETALLE(exoplaneta._id));
  };

  return (
    <section>
      <h1 className="font-serif text-titulo text-tinta">editar {exoplaneta.nombre}</h1>
      <div className="mt-16">
        <FormularioExoplaneta
          inicial={exoplaneta}
          textoEnviar="guardar cambios"
          textoEnviando="guardando"
          rutaCancelar={RUTAS.DETALLE(exoplaneta._id)}
          onEnviar={enviar}
        />
      </div>
    </section>
  );
}
