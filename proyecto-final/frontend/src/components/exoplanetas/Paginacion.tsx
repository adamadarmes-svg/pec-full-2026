import { Boton } from "@/components/ui/Boton";

interface PropsPaginacion {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

// no la muestro con una sola página porque serían botones que no hacen nada
export function Paginacion({ pagina, totalPaginas, onCambiar }: PropsPaginacion) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="paginación del catálogo" className="flex flex-wrap items-baseline gap-x-8 gap-y-3 pt-12">
      <Boton onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 1}>
        anterior
      </Boton>
      <span className="text-apoyo text-tinta-tenue tabular-nums" aria-live="polite">
        página {pagina} de {totalPaginas}
      </span>
      <Boton onClick={() => onCambiar(pagina + 1)} disabled={pagina >= totalPaginas}>
        siguiente
      </Boton>
    </nav>
  );
}
