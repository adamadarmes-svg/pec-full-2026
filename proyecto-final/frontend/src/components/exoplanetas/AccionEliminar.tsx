import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";

interface PropsAccionEliminar {
  onConfirmar: () => Promise<void>;
}

type Fase = "inicial" | "confirmando" | "eliminando";

const ESPERA_CONFIRMACION_MS = 5000;

// no usé window.confirm porque rompe la estética, se cancela sola si no confirmas
export function AccionEliminar({ onConfirmar }: PropsAccionEliminar) {
  const [fase, setFase] = useState<Fase>("inicial");

  useEffect(() => {
    if (fase !== "confirmando") return;
    const temporizador = setTimeout(() => setFase("inicial"), ESPERA_CONFIRMACION_MS);
    return () => clearTimeout(temporizador);
  }, [fase]);

  const confirmar = async () => {
    setFase("eliminando");
    try {
      await onConfirmar();
    } finally {
      // si se borró ya no está montado y si falló vuelve a ofrecer el botón
      setFase("inicial");
    }
  };

  if (fase === "inicial") {
    return (
      <Boton variante="peligro" onClick={() => setFase("confirmando")}>
        eliminar
      </Boton>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-x-5">
      <Boton variante="peligro" onClick={confirmar} cargando={fase === "eliminando"} textoCargando="eliminando">
        confirmar eliminación
      </Boton>
      <Boton onClick={() => setFase("inicial")} disabled={fase === "eliminando"}>
        cancelar
      </Boton>
    </span>
  );
}
