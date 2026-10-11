import { useCallback, useMemo } from "react";
import { useFetch } from "@/hooks/useFetch";
import { crear, eliminar, listarPorExoplaneta, publicar } from "@/services/imagenService";
import type { DatosImagenNueva, Imagen } from "@/types";

// recibo idPrincipal para poner la principal primero
export function useImagenes(exoplanetaId: string, idPrincipal: string | undefined) {
  const { datos, cargando, error, recargar } = useFetch((signal) => listarPorExoplaneta(exoplanetaId, signal), [exoplanetaId]);

  const publicadas = useMemo<Imagen[]>(() => {
    const lista = (datos ?? []).filter((imagen) => imagen.publicada);
    return [...lista.filter((i) => i._id === idPrincipal), ...lista.filter((i) => i._id !== idPrincipal)];
  }, [datos, idPrincipal]);

  // enseño las pendientes para que quien sube una no crea que se perdió
  const pendientes = useMemo<Imagen[]>(() => (datos ?? []).filter((imagen) => !imagen.publicada), [datos]);

  const subir = useCallback(
    async (nueva: DatosImagenNueva) => {
      await crear(nueva);
      recargar();
    },
    [recargar]
  );

  const quitar = useCallback(
    async (id: string) => {
      await eliminar(id);
      recargar();
    },
    [recargar]
  );

  // quien llama tiene que refrescar la ficha porque el backend quita la principal
  const despublicar = useCallback(
    async (id: string) => {
      await publicar(id, false);
      recargar();
    },
    [recargar]
  );

  const publicarImagen = useCallback(
    async (id: string) => {
      await publicar(id, true);
      recargar();
    },
    [recargar]
  );

  return { publicadas, pendientes, cargando, error, recargar, subir, quitar, despublicar, publicarImagen };
}
