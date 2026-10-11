import { useCallback } from "react";
import { useFetch } from "@/hooks/useFetch";
import { crear, eliminar, listarPorExoplaneta, ocultar } from "@/services/observacionService";
import type { DatosObservacion } from "@/types";

// la api ya las ordena y al admin le manda también las ocultas
export function useObservaciones(exoplanetaId: string) {
  const { datos, cargando, error, recargar } = useFetch((signal) => listarPorExoplaneta(exoplanetaId, signal), [exoplanetaId]);

  const escribir = useCallback(
    async (nueva: DatosObservacion) => {
      await crear(exoplanetaId, nueva);
      recargar();
    },
    [exoplanetaId, recargar]
  );

  const quitar = useCallback(
    async (id: string) => {
      await eliminar(id);
      recargar();
    },
    [recargar]
  );

  const cambiarVisibilidad = useCallback(
    async (id: string, visible: boolean) => {
      await ocultar(id, visible);
      recargar();
    },
    [recargar]
  );

  return { observaciones: datos ?? [], cargando, error, recargar, escribir, quitar, cambiarVisibilidad };
}
