import { useCallback, useRef, useState } from "react";
import { comprimirImagen, ErrorImagen, type ImagenComprimida } from "@/utils/comprimirImagen";

interface EstadoCompresion {
  imagen: ImagenComprimida | null;
  comprimiendo: boolean;
  error: string | null;
}

const ESTADO_INICIAL: EstadoCompresion = { imagen: null, comprimiendo: false, error: null };

export function useCompresionImagen() {
  const [estado, setEstado] = useState<EstadoCompresion>(ESTADO_INICIAL);
  // cuento las selecciones para descartar el resultado si eligen otro archivo mientras comprime
  const turnoRef = useRef(0);

  const procesar = useCallback(async (archivo: File) => {
    const turno = ++turnoRef.current;
    setEstado({ imagen: null, comprimiendo: true, error: null });
    try {
      const imagen = await comprimirImagen(archivo);
      if (turno === turnoRef.current) setEstado({ imagen, comprimiendo: false, error: null });
    } catch (error) {
      if (turno !== turnoRef.current) return;
      // si no es un ErrorImagen pongo un mensaje genérico
      const mensaje =
        error instanceof ErrorImagen
          ? error.message
          : "no se pudo leer la imagen. puede estar dañada.";
      setEstado({ imagen: null, comprimiendo: false, error: mensaje });
    }
  }, []);

  const limpiar = useCallback(() => {
    turnoRef.current++;
    setEstado(ESTADO_INICIAL);
  }, []);

  return { ...estado, procesar, limpiar };
}
