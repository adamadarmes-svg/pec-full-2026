import { useState } from "react";
import { Link } from "react-router-dom";
import { AccionEliminar } from "@/components/exoplanetas/AccionEliminar";
import { VistaPreviaPendiente } from "@/components/imagenes/VistaPreviaPendiente";
import { Alerta } from "@/components/ui/Alerta";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useNotification } from "@/context/NotificationContext";
import { useModeracion } from "@/hooks/useModeracion";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { mensajeDeError } from "@/services/api";
import { estaPoblado, idDe, type Poblado } from "@/types";
import { formatearFecha, pluralizar } from "@/utils/formato";

function EnlaceExoplaneta({ exoplaneta }: { exoplaneta: Poblado<{ _id: string; nombre: string }> }) {
  const id = idDe(exoplaneta);
  if (!id) return null;
  return (
    <Link to={RUTAS.DETALLE(id)} className="text-tinta underline decoration-linea-fuerte underline-offset-[0.3em] hover:decoration-tinta">
      {estaPoblado(exoplaneta) ? exoplaneta.nombre : "ver exoplaneta"}
    </Link>
  );
}

// el admin casi siempre lo verá vacío, por eso los vacíos lo dicen claro
export default function Moderacion() {
  useTituloPagina("moderación");
  const notificar = useNotification();
  const moderacion = useModeracion();
  const [publicando, setPublicando] = useState<string | null>(null);
  const [mostrando, setMostrando] = useState<string | null>(null);

  // ocupo el botón mientras dura para evitar dobles clics
  const ejecutar = async (
    id: string,
    accion: (id: string) => Promise<void>,
    exito: string,
    marcarOcupado: (id: string | null) => void
  ) => {
    marcarOcupado(id);
    try {
      await accion(id);
      notificar(exito);
    } catch (error) {
      notificar(mensajeDeError(error), "error");
    } finally {
      marcarOcupado(null);
    }
  };

  const eliminarImagen = async (id: string) => {
    try {
      await moderacion.eliminarImagen(id);
      notificar(MENSAJES.IMAGEN_ELIMINADA);
    } catch (error) {
      notificar(mensajeDeError(error), "error");
    }
  };

  const { pendientes, ocultas } = moderacion;

  return (
    <article className="pt-10 md:pt-16">
      <h1 className="font-serif text-titulo text-tinta">moderación</h1>

      <section aria-labelledby="titulo-pendientes" className="mt-16">
        <h2 id="titulo-pendientes" className="font-serif text-nombre text-tinta">
          imágenes pendientes
        </h2>
        <div className="mt-8">
          {moderacion.errorImagenes ? (
            <Alerta variante="error">
              <p>{moderacion.errorImagenes}</p>
              <Boton onClick={moderacion.recargarImagenes}>volver a intentarlo</Boton>
            </Alerta>
          ) : moderacion.cargandoImagenes && pendientes.length === 0 ? (
            <Cargando texto="cargando imágenes pendientes" />
          ) : pendientes.length === 0 ? (
            <Alerta>no hay imágenes pendientes.</Alerta>
          ) : (
            <>
              <p className="m-0 text-apoyo text-tinta-tenue">{pluralizar(pendientes.length, "imagen espera revisión", "imágenes esperan revisión")}</p>
              <ul className="m-0 mt-10 grid list-none gap-y-14 p-0">
                {pendientes.map((imagen) => (
                  <li key={imagen._id} className="grid items-start gap-x-10 gap-y-5 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                    <VistaPreviaPendiente imagen={imagen} />
                    <div className="grid gap-y-3">
                      <p className="m-0 text-destacado text-tinta">{imagen.titulo}</p>
                      <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 text-apoyo text-tinta-tenue">
                        <EnlaceExoplaneta exoplaneta={imagen.exoplaneta} />
                        {estaPoblado(imagen.subidaPor) && <span>subida por {imagen.subidaPor.nombre}</span>}
                        <span className="text-tinta-apagada">{formatearFecha(imagen.createdAt)}</span>
                      </p>
                      {imagen.descripcion && <p className="m-0 max-w-[62ch] text-tinta-tenue">{imagen.descripcion}</p>}
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                        <Boton
                          variante="primario"
                          onClick={() => ejecutar(imagen._id, moderacion.publicarImagen, MENSAJES.IMAGEN_PUBLICADA, setPublicando)}
                          cargando={publicando === imagen._id}
                          textoCargando="publicando"
                        >
                          publicar
                        </Boton>
                        <AccionEliminar onConfirmar={() => eliminarImagen(imagen._id)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="titulo-ocultas" className="mt-seccion">
        <h2 id="titulo-ocultas" className="font-serif text-nombre text-tinta">
          observaciones ocultas
        </h2>
        <div className="mt-8">
          {moderacion.errorObservaciones ? (
            <Alerta variante="error">
              <p>{moderacion.errorObservaciones}</p>
              <Boton onClick={moderacion.recargarObservaciones}>volver a intentarlo</Boton>
            </Alerta>
          ) : moderacion.cargandoObservaciones && ocultas.length === 0 ? (
            <Cargando texto="cargando observaciones ocultas" />
          ) : ocultas.length === 0 ? (
            <Alerta>no hay observaciones ocultas.</Alerta>
          ) : (
            <ul className="m-0 grid list-none gap-y-10 p-0">
              {ocultas.map(({ _id, contenido, autor, exoplaneta, createdAt }) => (
                <li key={_id} className="border-l border-linea pl-5">
                  <p className="m-0 max-w-[62ch] whitespace-pre-line text-tinta">{contenido}</p>
                  <p className="m-0 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-apoyo text-tinta-tenue">
                    {estaPoblado(autor) && <span>{autor.nombre}</span>}
                    <EnlaceExoplaneta exoplaneta={exoplaneta} />
                    <span className="text-tinta-apagada">{formatearFecha(createdAt)}</span>
                  </p>
                  <div className="mt-3">
                    <Boton
                      onClick={() => ejecutar(_id, moderacion.mostrarObservacion, MENSAJES.OBSERVACION_VISIBLE, setMostrando)}
                      cargando={mostrando === _id}
                      textoCargando="mostrando"
                    >
                      volver a mostrar
                    </Boton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </article>
  );
}
