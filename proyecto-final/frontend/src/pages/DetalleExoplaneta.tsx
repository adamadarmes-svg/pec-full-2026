import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Desplegable } from "@/components/comun/Desplegable";
import { AccionEliminar } from "@/components/exoplanetas/AccionEliminar";
import { GaleriaImagenes } from "@/components/imagenes/GaleriaImagenes";
import { SubirImagen } from "@/components/imagenes/SubirImagen";
import { FormularioObservacion } from "@/components/observaciones/FormularioObservacion";
import { ListaObservaciones } from "@/components/observaciones/ListaObservaciones";
import { Alerta } from "@/components/ui/Alerta";
import { EnlaceBoton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EsquemaSistema } from "@/components/ui/EsquemaSistema";
import { ETIQUETAS_METODO_DESCUBRIMIENTO, ETIQUETAS_TIPO_PLANETA } from "@/const/catalogo";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useFichaExoplaneta } from "@/hooks/useFichaExoplaneta";
import { useImagenes } from "@/hooks/useImagenes";
import { useObservaciones } from "@/hooks/useObservaciones";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { mensajeDeError } from "@/services/api";
import { estaPoblado, type Exoplaneta, idDe } from "@/types";
import { formatearFecha, formatearNumero } from "@/utils/formato";
import type { EstadoRedireccion } from "@/utils/navegacion";

const SIN_DATO = "sin dato";

function cifra(valor: number | undefined, unidad: string): ReactNode {
  if (valor === undefined) return <span className="text-tinta-apagada">{SIN_DATO}</span>;
  return (
    <>
      {formatearNumero(valor)} <span className="text-apoyo text-tinta-tenue">{unidad}</span>
    </>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-apoyo text-tinta-tenue">{etiqueta}</dt>
      <dd className="m-0 mt-2 text-destacado text-tinta">{children}</dd>
    </div>
  );
}

function FuenteBibliografica({ fuente }: { fuente: Exoplaneta["fuentePrincipal"] }) {
  // sin fuente no hay nada que mostrar
  if (!estaPoblado(fuente)) {
    return <p className="m-0 text-tinta-tenue">sin fuente bibliográfica.</p>;
  }
  const { titulo, autores, publicacion, anio, doi, url } = fuente;
  return (
    <div className="grid max-w-[62ch] gap-y-2">
      <p className="m-0 text-destacado text-tinta">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="underline decoration-linea-fuerte underline-offset-[0.3em] hover:decoration-tinta">
            {titulo}
          </a>
        ) : (
          titulo
        )}
      </p>
      <p className="m-0 text-tinta-tenue">{autores}</p>
      {(publicacion || anio) && <p className="m-0 text-tinta-tenue">{[publicacion, anio].filter(Boolean).join(", ")}</p>}
      {doi && (
        <p className="m-0">
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noreferrer"
            className="text-acento-fuerte underline decoration-acento underline-offset-[0.3em]"
          >
            doi:{doi}
          </a>
        </p>
      )}
    </div>
  );
}

// sin sesión pongo un enlace a entrar que vuelve aquí
function InvitacionEntrar({ texto, estado }: { texto: string; estado: EstadoRedireccion }) {
  return (
    <p className="m-0 text-tinta-tenue">
      <Link to={RUTAS.LOGIN} state={estado} className="text-tinta underline decoration-linea-fuerte underline-offset-[0.3em] hover:decoration-tinta">
        entra
      </Link>{" "}
      {texto}
    </p>
  );
}

export default function DetalleExoplaneta() {
  const { id = "" } = useParams();
  const { esAutor, esAdmin, estaAutenticado } = useAuth();
  const notificar = useNotification();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  // dejé la lógica en hooks para que la página solo pinte
  const ficha = useFichaExoplaneta(id);
  const { exoplaneta } = ficha;
  const idPrincipal = idDe(exoplaneta?.imagenPrincipal ?? undefined);
  const imagenes = useImagenes(id, idPrincipal);
  const observaciones = useObservaciones(id);
  useTituloPagina(exoplaneta?.nombre ?? "exoplaneta");

  // solo tapo la página al cargar la primera vez para no perder la ficha al recargar
  if (ficha.cargando && !exoplaneta) return <Cargando texto="cargando el exoplaneta" />;

  if (ficha.error || !exoplaneta) {
    return (
      <Alerta variante="error">
        <p>{ficha.error ?? "exoplaneta no encontrado."}</p>
        <EnlaceBoton to={RUTAS.INICIO}>volver al catálogo</EnlaceBoton>
      </Alerta>
    );
  }

  const {
    _id,
    nombre,
    estrellaAnfitriona,
    tipoEspectral,
    tipoPlaneta,
    masa,
    radio,
    periodoOrbital,
    temperaturaEquilibrio,
    distancia,
    metodoDescubrimiento,
    anioDescubrimiento,
    zonaHabitable,
    confirmado,
    descripcion,
    fuentePrincipal,
    creadoPor,
    createdAt,
  } = exoplaneta;

  const volverAqui: EstadoRedireccion = { desde: ubicacion.pathname };
  // el autor del exoplaneta puede elegir la principal y moderar sus observaciones
  const esAutorDelRegistro = esAutor(creadoPor);

  // estas acciones nunca lanzan para que el botón recupere su estado
  const conAviso = async (accion: () => Promise<void>, exito: string): Promise<void> => {
    try {
      await accion();
      notificar(exito);
    } catch (error) {
      notificar(mensajeDeError(error), "error");
    }
  };

  // en los formularios solo aviso del éxito porque el error ya sale junto al campo
  const enviarConAviso = async (accion: () => Promise<void>, exito: string): Promise<void> => {
    await accion();
    notificar(exito);
  };

  const eliminarRegistro = async () => {
    try {
      await ficha.eliminarExoplaneta();
      notificar(MENSAJES.ELIMINADO);
      navegar(RUTAS.INICIO, { replace: true });
    } catch (error) {
      notificar(mensajeDeError(error), "error");
    }
  };

  return (
    <article>
      <EnlaceBoton to={RUTAS.INICIO}>volver al catálogo</EnlaceBoton>

      <header className="mt-10">
        <h1 className="font-serif text-monumental text-tinta">{nombre}</h1>
        <p className="mt-6 text-destacado text-tinta-tenue">
          {ETIQUETAS_TIPO_PLANETA[tipoPlaneta]} en órbita de {estrellaAnfitriona}
        </p>
      </header>

      {/* el esquema va primero porque es el dato, la galería solo ilustra */}
      <div className="mt-16 md:mt-20">
        <EsquemaSistema
          estrella={estrellaAnfitriona}
          planeta={nombre}
          radio={radio}
          temperatura={temperaturaEquilibrio}
          periodo={periodoOrbital}
          zonaHabitable={zonaHabitable}
          tamano="grande"
          nombreEnEtiqueta={false}
        />
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-x-10 gap-y-10 md:mt-20 md:grid-cols-3 lg:grid-cols-4">
        <Dato etiqueta="radio">{cifra(radio, "radios terrestres")}</Dato>
        <Dato etiqueta="masa">{cifra(masa, "masas terrestres")}</Dato>
        <Dato etiqueta="temperatura de equilibrio">{cifra(temperaturaEquilibrio, "kelvin")}</Dato>
        <Dato etiqueta="periodo orbital">{cifra(periodoOrbital, "días")}</Dato>
        <Dato etiqueta="distancia">{cifra(distancia, "años luz")}</Dato>
        <Dato etiqueta="tipo espectral de la estrella">
          {tipoEspectral ?? <span className="text-tinta-apagada">{SIN_DATO}</span>}
        </Dato>
        <Dato etiqueta="método de descubrimiento">
          {metodoDescubrimiento ? ETIQUETAS_METODO_DESCUBRIMIENTO[metodoDescubrimiento] : <span className="text-tinta-apagada">{SIN_DATO}</span>}
        </Dato>
        <Dato etiqueta="año de descubrimiento">
          {anioDescubrimiento ?? <span className="text-tinta-apagada">{SIN_DATO}</span>}
        </Dato>
        <Dato etiqueta="zona habitable">
          {zonaHabitable ? <span className="text-habitable">sí</span> : "no"}
        </Dato>
        <Dato etiqueta="estado">{confirmado ? "confirmado" : "candidato"}</Dato>
      </dl>

      {descripcion && <p className="mt-16 max-w-[62ch] text-destacado text-tinta-tenue">{descripcion}</p>}

      {/* la autoría va con los datos del exoplaneta y antes de lo que aportan otros */}
      <footer className="mt-12 grid gap-y-6">
        <p className="m-0 text-apoyo text-tinta-tenue">
          {estaPoblado(creadoPor)
            ? `registrado por ${creadoPor.nombre}${creadoPor.institucion ? `, ${creadoPor.institucion}` : ""}, el ${formatearFecha(createdAt)}`
            : `registrado el ${formatearFecha(createdAt)}`}
        </p>
        {esAutorDelRegistro && (
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
            <EnlaceBoton to={RUTAS.EDITAR(_id)}>editar</EnlaceBoton>
            <AccionEliminar onConfirmar={eliminarRegistro} />
          </div>
        )}
      </footer>

      {/* si no hay imágenes este hueco se oculta solo */}
      <div className="mt-seccion grid gap-y-16 empty:hidden">
        <GaleriaImagenes
          imagenes={imagenes.publicadas}
          pendientes={imagenes.pendientes}
          idPrincipal={idPrincipal}
          puedeElegirPrincipal={esAutorDelRegistro}
          puedeDespublicar={esAdmin}
          puedePublicar={esAdmin}
          puedeEliminar={(imagen) => esAutor(imagen.subidaPor)}
          onMarcarPrincipal={(imagenId) => conAviso(() => ficha.marcarPrincipal(imagenId), MENSAJES.PRINCIPAL_ACTUALIZADA)}
          onDespublicar={(imagenId) =>
            // recargo la ficha porque el backend quita la principal al despublicar
            conAviso(async () => {
              await imagenes.despublicar(imagenId);
              ficha.recargar();
            }, MENSAJES.IMAGEN_DESPUBLICADA)
          }
          onPublicar={(imagenId) => conAviso(() => imagenes.publicarImagen(imagenId), MENSAJES.IMAGEN_PUBLICADA)}
          onEliminar={(imagenId) =>
            conAviso(async () => {
              await imagenes.quitar(imagenId);
              if (imagenId === idPrincipal) ficha.recargar();
            }, MENSAJES.IMAGEN_ELIMINADA)
          }
        />
      </div>

      <div className="mt-16">
        {estaAutenticado ? (
          <Desplegable etiqueta="añadir una imagen">
            {(cerrar) => (
              <SubirImagen
                exoplanetaId={_id}
                onEnviar={async (datos) => {
                  await enviarConAviso(() => imagenes.subir(datos), MENSAJES.IMAGEN_PENDIENTE);
                  cerrar();
                }}
              />
            )}
          </Desplegable>
        ) : (
          <InvitacionEntrar texto="para añadir una imagen." estado={volverAqui} />
        )}
      </div>

      <section aria-labelledby="titulo-fuente" className="mt-seccion">
        <h2 id="titulo-fuente" className="font-serif text-nombre text-tinta">
          fuente bibliográfica
        </h2>
        <div className="mt-8">
          <FuenteBibliografica fuente={fuentePrincipal} />
        </div>
      </section>

      <section aria-labelledby="titulo-observaciones" className="mt-seccion">
        <h2 id="titulo-observaciones" className="font-serif text-nombre text-tinta">
          observaciones
        </h2>
        <div className="mt-8 grid gap-y-16">
          {observaciones.error ? (
            <Alerta variante="error">{observaciones.error}</Alerta>
          ) : observaciones.cargando && observaciones.observaciones.length === 0 ? (
            <Cargando texto="cargando observaciones" />
          ) : observaciones.observaciones.length === 0 ? (
            // sin observaciones invito a escribir la primera o a entrar
            estaAutenticado ? (
              <p className="m-0 text-tinta-tenue">aún no hay observaciones. escribe la primera.</p>
            ) : (
              <InvitacionEntrar texto="para escribir la primera observación." estado={volverAqui} />
            )
          ) : (
            <ListaObservaciones
              observaciones={observaciones.observaciones}
              puedeEliminar={(observacion) => esAutor(observacion.autor) || esAutorDelRegistro}
              puedeModerar={esAdmin}
              onEliminar={(observacionId) =>
                conAviso(() => observaciones.quitar(observacionId), MENSAJES.OBSERVACION_ELIMINADA)
              }
              onCambiarVisibilidad={(observacionId, visible) =>
                conAviso(
                  () => observaciones.cambiarVisibilidad(observacionId, visible),
                  visible ? MENSAJES.OBSERVACION_VISIBLE : MENSAJES.OBSERVACION_OCULTA
                )
              }
            />
          )}

          {estaAutenticado ? (
            <Desplegable etiqueta="escribir una observación">
              {(cerrar) => (
                <FormularioObservacion
                  onEnviar={async (datos) => {
                    await enviarConAviso(() => observaciones.escribir(datos), MENSAJES.OBSERVACION_PUBLICADA);
                    cerrar();
                  }}
                />
              )}
            </Desplegable>
          ) : (
            observaciones.observaciones.length > 0 && <InvitacionEntrar texto="para escribir una observación." estado={volverAqui} />
          )}
        </div>
      </section>

    </article>
  );
}
