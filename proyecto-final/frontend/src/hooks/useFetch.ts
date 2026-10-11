import { type DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { esAbortError, mensajeDeError } from "@/services/api";

interface EstadoFetch<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
}

// paso el signal para poder cancelar la carga
export function useFetch<T>(cargar: (signal: AbortSignal) => Promise<T>, dependencias: DependencyList) {
  // agrupé el estado porque datos, carga y error cambian juntos
  const [estado, setEstado] = useState<EstadoFetch<T>>({ datos: null, cargando: true, error: null });
  // uso una versión para poder recargar sin tocar las dependencias
  const [version, setVersion] = useState(0);

  // guardo la función en una ref porque si no la petición se repetía sin fin
  const cargarRef = useRef(cargar);
  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    const controlador = new AbortController();
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    cargarRef
      .current(controlador.signal)
      .then((datos) => {
        // si llega después de cancelar la ignoro porque ya no vale
        if (controlador.signal.aborted) return;
        setEstado({ datos, cargando: false, error: null });
      })
      .catch((error: unknown) => {
        if (esAbortError(error) || controlador.signal.aborted) return;
        setEstado((previo) => ({ ...previo, cargando: false, error: mensajeDeError(error) }));
      });

    // cancelo al cambiar o desmontar para que no pise la siguiente
    return () => controlador.abort();
    // las dependencias las pone quien llama
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...estado, recargar };
}
