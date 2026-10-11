import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";

interface PropsDesplegable {
  etiqueta: string;
  // le paso cerrar para que el formulario se pliegue solo al enviar
  children: (cerrar: () => void) => ReactNode;
}

// no usé details porque así controlo el foco y el aria-expanded se anuncia igual en todos los lectores
export function Desplegable({ etiqueta, children }: PropsDesplegable) {
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLDivElement>(null);
  // sin esto el foco se movía nada más cargar
  const interactuadoRef = useRef(false);

  useEffect(() => {
    if (!interactuadoRef.current) return;
    if (abierto) {
      panelRef.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
    } else {
      disparadorRef.current?.querySelector<HTMLElement>("button")?.focus();
    }
  }, [abierto]);

  const alternar = () => {
    interactuadoRef.current = true;
    setAbierto((previo) => !previo);
  };

  const cerrar = useCallback(() => {
    interactuadoRef.current = true;
    setAbierto(false);
  }, []);

  return (
    <div>
      <div ref={disparadorRef}>
        <Boton onClick={alternar} aria-expanded={abierto} aria-controls={idPanel}>
          {etiqueta}
        </Boton>
      </div>
      {/* lo dejo montado aunque esté plegado para no perder lo escrito */}
      <div id={idPanel} ref={panelRef} hidden={!abierto} className="mt-10">
        {children(cerrar)}
      </div>
    </div>
  );
}
