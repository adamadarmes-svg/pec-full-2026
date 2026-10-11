import { FilaExoplaneta } from "@/components/exoplanetas/FilaExoplaneta";
import type { Exoplaneta } from "@/types";

interface PropsCatalogoExoplanetas {
  exoplanetas: Exoplaneta[];
  onEliminar: (id: string) => Promise<void>;
}

// uso el _id como key para que react no mezcle el estado de las filas al borrar o paginar
export function CatalogoExoplanetas({ exoplanetas, onEliminar }: PropsCatalogoExoplanetas) {
  return (
    <ol className="m-0 list-none p-0">
      {exoplanetas.map(({ _id, ...exoplaneta }) => (
        <li key={_id}>
          <FilaExoplaneta _id={_id} {...exoplaneta} onEliminar={onEliminar} />
        </li>
      ))}
    </ol>
  );
}
