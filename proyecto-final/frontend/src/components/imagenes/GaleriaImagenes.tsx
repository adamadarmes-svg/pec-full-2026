import { useState } from "react";
import { AccionEliminar } from "@/components/exoplanetas/AccionEliminar";
import { VisorImagen } from "@/components/imagenes/VisorImagen";
import { VistaPreviaPendiente } from "@/components/imagenes/VistaPreviaPendiente";
import { Boton } from "@/components/ui/Boton";
import { urlImagen } from "@/services/imagenService";
import type { Imagen } from "@/types";
import { textoCredito } from "@/utils/formato";

interface PropsGaleriaImagenes {
  // la principal va primero
  imagenes: Imagen[];
  // la api ya filtra cuáles puede ver cada uno
  pendientes: Imagen[];
  idPrincipal?: string;
  puedeElegirPrincipal: boolean;
  puedeDespublicar: boolean;
  puedePublicar: boolean;
  puedeEliminar: (imagen: Imagen) => boolean;
  onMarcarPrincipal: (id: string) => Promise<void>;
  onDespublicar: (id: string) => Promise<void>;
  onPublicar: (id: string) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
}

// las imágenes van sin marcos porque solo ilustran, el dato es el esquema
export function GaleriaImagenes({
  imagenes,
  pendientes,
  idPrincipal,
  puedeElegirPrincipal,
  puedeDespublicar,
  puedePublicar,
  puedeEliminar,
  onMarcarPrincipal,
  onDespublicar,
  onPublicar,
  onEliminar,
}: PropsGaleriaImagenes) {
  const [abierta, setAbierta] = useState<Imagen | null>(null);
  // guardo cuál está ocupada para evitar dobles clics
  const [ocupada, setOcupada] = useState<string | null>(null);

  // si no hay imágenes no pinto nada porque el esquema ya basta
  if (imagenes.length === 0 && pendientes.length === 0) return null;

  const ejecutar = async (id: string, accion: (id: string) => Promise<void>) => {
    setOcupada(id);
    try {
      await accion(id);
    } finally {
      setOcupada(null);
    }
  };

  return (
    <section aria-labelledby="titulo-galeria">
      <h2 id="titulo-galeria" className="font-serif text-nombre text-tinta">
        imágenes
      </h2>

      <ul className="m-0 mt-8 grid list-none gap-x-10 gap-y-14 p-0 md:grid-cols-2">
        {imagenes.map((imagen) => {
          const { _id, titulo, creditoAutor } = imagen;
          const esPrincipal = _id === idPrincipal;
          return (
            <li key={_id} className={esPrincipal ? "md:col-span-2" : undefined}>
              <figure className="m-0">
                <button
                  type="button"
                  onClick={() => setAbierta(imagen)}
                  aria-label={`ampliar ${titulo}`}
                  className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
                >
                  <img src={urlImagen(imagen)} alt={titulo} loading="lazy" className="block h-auto w-full" />
                </button>
                <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-apoyo">
                  <span className="text-tinta-tenue">{titulo}</span>
                  <span className="text-tinta-apagada">{textoCredito(creditoAutor)}</span>
                </figcaption>
              </figure>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-apoyo">
                {esPrincipal ? (
                  <span className="text-acento">imagen principal</span>
                ) : (
                  puedeElegirPrincipal && (
                    <Boton onClick={() => ejecutar(_id, onMarcarPrincipal)} disabled={ocupada === _id}>
                      usar como principal
                    </Boton>
                  )
                )}
                {puedeDespublicar && (
                  <Boton onClick={() => ejecutar(_id, onDespublicar)} disabled={ocupada === _id}>
                    despublicar
                  </Boton>
                )}
                {puedeEliminar(imagen) && <AccionEliminar onConfirmar={() => onEliminar(_id)} />}
              </div>
            </li>
          );
        })}
      </ul>

      {/* las pendientes van aparte porque sin token no se pueden pedir con un img normal */}
      {pendientes.length > 0 && (
        <ul className="m-0 mt-14 grid list-none gap-x-10 gap-y-14 p-0 md:grid-cols-2">
          {pendientes.map((imagen) => {
            const { _id, titulo, creditoAutor } = imagen;
            return (
              <li key={_id}>
                <figure className="m-0">
                  <div className="opacity-70">
                    <VistaPreviaPendiente imagen={imagen} />
                  </div>
                  <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-apoyo">
                    <span className="text-acento">pendiente de publicación</span>
                    <span className="text-tinta-tenue">{titulo}</span>
                    <span className="text-tinta-apagada">{textoCredito(creditoAutor)}</span>
                  </figcaption>
                </figure>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-apoyo">
                  {puedePublicar && (
                    <Boton onClick={() => ejecutar(_id, onPublicar)} disabled={ocupada === _id}>
                      publicar
                    </Boton>
                  )}
                  {puedeEliminar(imagen) && <AccionEliminar onConfirmar={() => onEliminar(_id)} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <VisorImagen imagen={abierta} onCerrar={() => setAbierta(null)} />
    </section>
  );
}
