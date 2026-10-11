import { useEffect, useRef } from "react";
import { Boton } from "@/components/ui/Boton";
import { urlImagen } from "@/services/imagenService";
import type { Imagen } from "@/types";
import { textoCredito } from "@/utils/formato";

interface PropsVisorImagen {
  imagen: Imagen | null;
  onCerrar: () => void;
}

// usé el dialog nativo porque ya atrapa el foco y se cierra con escape
export function VisorImagen({ imagen, onCerrar }: PropsVisorImagen) {
  const dialogoRef = useRef<HTMLDialogElement>(null);

  // cualquier forma de cerrar pasa por onClose para avisar al padre
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (imagen && !dialogo.open) dialogo.showModal();
    if (!imagen && dialogo.open) dialogo.close();
  }, [imagen]);

  const cerrar = () => dialogoRef.current?.close();

  return (
    // definí el backdrop porque por defecto es blanco translúcido y desentonaba
    <dialog
      ref={dialogoRef}
      onClose={onCerrar}
      aria-label={imagen ? imagen.titulo : undefined}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-tinta backdrop:bg-fondo"
    >
      {imagen && (
        <div
          className="flex h-full flex-col items-center justify-center gap-6 px-5 py-6 md:px-10"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
        >
          <div className="flex w-full justify-end">
            <Boton onClick={cerrar}>cerrar</Boton>
          </div>
          <figure className="m-0 flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <img src={urlImagen(imagen)} alt={imagen.titulo} loading="lazy" className="block max-h-[78vh] max-w-full object-contain" />
            <figcaption className="text-center text-apoyo">
              <span className="text-tinta-tenue">{imagen.titulo}</span>
              <span className="ml-4 text-tinta-apagada">{textoCredito(imagen.creditoAutor)}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </dialog>
  );
}
