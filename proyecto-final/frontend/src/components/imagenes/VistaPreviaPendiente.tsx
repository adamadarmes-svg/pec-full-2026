import { Cargando } from "@/components/ui/Cargando";
import { useImagenPrivada } from "@/hooks/useImagenPrivada";
import type { Imagen } from "@/types";

const CLASE_IMAGEN = "block h-auto max-h-64 w-auto max-w-full";

// las subidas las pido con token porque la api no las da sin él hasta publicarlas
export function VistaPreviaPendiente({ imagen }: { imagen: Imagen }) {
  if (imagen.origen === "enlace") {
    return <img src={imagen.url} alt={imagen.titulo} loading="lazy" className={CLASE_IMAGEN} />;
  }
  return <VistaPreviaSubida id={imagen._id} titulo={imagen.titulo} />;
}

// lo hice componente aparte porque un hook no se puede llamar de forma condicional
function VistaPreviaSubida({ id, titulo }: { id: string; titulo: string }) {
  const { url, cargando, error } = useImagenPrivada(id);

  if (cargando) return <Cargando texto="cargando la vista previa" />;
  // si falla pongo texto para que no salga el icono de imagen rota
  if (error || !url) return <p className="m-0 text-apoyo text-peligro">no se pudo cargar la imagen.</p>;
  return <img src={url} alt={titulo} loading="lazy" className={CLASE_IMAGEN} />;
}
