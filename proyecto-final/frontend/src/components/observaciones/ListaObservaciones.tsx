import { useState } from "react";
import { AccionEliminar } from "@/components/exoplanetas/AccionEliminar";
import { Boton } from "@/components/ui/Boton";
import { ETIQUETAS_TIPO_OBSERVACION } from "@/const/catalogo";
import { estaPoblado, type Observacion } from "@/types";
import { formatearFecha } from "@/utils/formato";

interface PropsListaObservaciones {
  observaciones: Observacion[];
  // lo decide el padre porque sabe quién es el autor del exoplaneta
  puedeEliminar: (observacion: Observacion) => boolean;
  puedeModerar: boolean;
  onEliminar: (id: string) => Promise<void>;
  onCambiarVisibilidad: (id: string, visible: boolean) => Promise<void>;
}

// no las ordeno porque la api ya las manda de la más nueva a la más vieja
export function ListaObservaciones({
  observaciones,
  puedeEliminar,
  puedeModerar,
  onEliminar,
  onCambiarVisibilidad,
}: PropsListaObservaciones) {
  const [ocupada, setOcupada] = useState<string | null>(null);

  const cambiarVisibilidad = async (id: string, visible: boolean) => {
    setOcupada(id);
    try {
      await onCambiarVisibilidad(id, visible);
    } finally {
      setOcupada(null);
    }
  };

  return (
    <ol className="m-0 grid list-none gap-y-10 p-0">
      {observaciones.map((observacion) => {
        const { _id, contenido, autor, tipo, instrumento, anioObservacion, visible, createdAt } = observacion;
        return (
          <li key={_id} className={`border-l border-linea pl-5 ${visible ? "" : "opacity-60"}`}>
            <p className="m-0 max-w-[62ch] whitespace-pre-line text-tinta">{contenido}</p>
            <p className="m-0 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-apoyo text-tinta-tenue">
              {estaPoblado(autor) && <span>{autor.nombre}</span>}
              <span>{ETIQUETAS_TIPO_OBSERVACION[tipo]}</span>
              {instrumento && <span>{instrumento}</span>}
              {anioObservacion !== undefined && <span>observado en {anioObservacion}</span>}
              <span className="text-tinta-apagada">{formatearFecha(createdAt)}</span>
              {!visible && <span className="text-peligro">oculta</span>}
            </p>

            {(puedeModerar || puedeEliminar(observacion)) && (
              <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                {puedeModerar && (
                  <Boton onClick={() => cambiarVisibilidad(_id, !visible)} disabled={ocupada === _id}>
                    {visible ? "ocultar" : "volver a mostrar"}
                  </Boton>
                )}
                {puedeEliminar(observacion) && <AccionEliminar onConfirmar={() => onEliminar(_id)} />}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
