import { useCallback } from "react";
import { useFetch } from "@/hooks/useFetch";
import { actualizar, eliminar, obtener } from "@/services/exoplanetaService";

export function useFichaExoplaneta(id: string) {
  const { datos, cargando, error, recargar } = useFetch((signal) => obtener(id, signal), [id]);

  const eliminarExoplaneta = useCallback(() => eliminar(id), [id]);

  // recargo después para traer la imagen nueva con populate
  const marcarPrincipal = useCallback(
    async (imagenId: string | null) => {
      await actualizar(id, { imagenPrincipal: imagenId });
      recargar();
    },
    [id, recargar]
  );

  return { exoplaneta: datos, cargando, error, recargar, eliminarExoplaneta, marcarPrincipal };
}
