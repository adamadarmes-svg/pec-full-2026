import { useEffect, useState } from "react";
import { esAbortError } from "@/services/api";
import { obtenerArchivoPrivado } from "@/services/imagenService";

interface EstadoImagenPrivada {
  url: string | null;
  cargando: boolean;
  error: boolean;
}

// la pido con token y uso una url temporal porque un img normal no manda el token
export function useImagenPrivada(id: string): EstadoImagenPrivada {
  const [estado, setEstado] = useState<EstadoImagenPrivada>({ url: null, cargando: true, error: false });

  useEffect(() => {
    const controlador = new AbortController();
    let urlCreada: string | null = null;
    setEstado({ url: null, cargando: true, error: false });

    obtenerArchivoPrivado(id, controlador.signal)
      .then((blob) => {
        if (controlador.signal.aborted) return;
        urlCreada = URL.createObjectURL(blob);
        setEstado({ url: urlCreada, cargando: false, error: false });
      })
      .catch((error: unknown) => {
        if (esAbortError(error) || controlador.signal.aborted) return;
        setEstado({ url: null, cargando: false, error: true });
      });

    // libero la url temporal al desmontar o cambiar de id para no dejar memoria ocupada
    return () => {
      controlador.abort();
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
  }, [id]);

  return estado;
}
