import { type DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { esAbortError, mensajeDeError } from "@/services/api";

interface EstadoFetch<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
}

// Carga genérica de datos con cancelación. Recibe una función que recibe el
// signal y devuelve una promesa, y las dependencias que provocan la recarga.
// Ejemplo: useFetch((signal) => obtener(id, signal), [id])
export function useFetch<T>(cargar: (signal: AbortSignal) => Promise<T>, dependencias: DependencyList) {
  // Estado agrupado: datos, cargando y error cambian siempre juntos
  const [estado, setEstado] = useState<EstadoFetch<T>>({ datos: null, cargando: true, error: null });
  // Cambiar la versión fuerza una recarga sin tocar las dependencias
  const [version, setVersion] = useState(0);

  // La función se guarda en una ref: quien llama suele pasar una flecha nueva
  // en cada render, y si fuera dependencia del efecto la petición se repetiría
  // sin fin. Solo el array de dependencias decide cuándo recargar.
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
        // Si la respuesta llega después de cancelar, es de una carga ya obsoleta
        if (controlador.signal.aborted) return;
        setEstado({ datos, cargando: false, error: null });
      })
      .catch((error: unknown) => {
        if (esAbortError(error) || controlador.signal.aborted) return;
        setEstado((previo) => ({ ...previo, cargando: false, error: mensajeDeError(error) }));
      });

    // Al cambiar las dependencias o desmontar se cancela la petición en curso
    return () => controlador.abort();
    // Las dependencias las define quien llama, más la versión para recargar
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...estado, recargar };
}
