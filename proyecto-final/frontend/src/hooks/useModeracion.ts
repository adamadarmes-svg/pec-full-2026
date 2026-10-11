import { useCallback, useMemo } from "react";
import { useFetch } from "@/hooks/useFetch";
import { eliminar, listar as listarImagenes, publicar } from "@/services/imagenService";
import { listarOcultas, ocultar } from "@/services/observacionService";

export function useModeracion() {
  const imagenes = useFetch((signal) => listarImagenes(signal), []);
  const observaciones = useFetch((signal) => listarOcultas(signal), []);

  // aquí solo me interesan las pendientes
  const pendientes = useMemo(() => (imagenes.datos ?? []).filter((imagen) => !imagen.publicada), [imagenes.datos]);

  const { recargar: recargarImagenes } = imagenes;
  const { recargar: recargarObservaciones } = observaciones;

  const publicarImagen = useCallback(
    async (id: string) => {
      await publicar(id, true);
      recargarImagenes();
    },
    [recargarImagenes]
  );

  const eliminarImagen = useCallback(
    async (id: string) => {
      await eliminar(id);
      recargarImagenes();
    },
    [recargarImagenes]
  );

  const mostrarObservacion = useCallback(
    async (id: string) => {
      await ocultar(id, true);
      recargarObservaciones();
    },
    [recargarObservaciones]
  );

  return {
    pendientes,
    cargandoImagenes: imagenes.cargando,
    errorImagenes: imagenes.error,
    ocultas: observaciones.datos ?? [],
    cargandoObservaciones: observaciones.cargando,
    errorObservaciones: observaciones.error,
    publicarImagen,
    eliminarImagen,
    mostrarObservacion,
    recargarImagenes,
    recargarObservaciones,
  };
}
