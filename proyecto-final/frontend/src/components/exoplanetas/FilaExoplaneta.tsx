import { Link } from "react-router-dom";
import { AccionEliminar } from "@/components/exoplanetas/AccionEliminar";
import { EnlaceBoton } from "@/components/ui/Boton";
import { EsquemaSistema } from "@/components/ui/EsquemaSistema";
import { ETIQUETAS_TIPO_PLANETA } from "@/const/catalogo";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import type { Exoplaneta } from "@/types";
import { formatearNumero } from "@/utils/formato";

type PropsFilaExoplaneta = Exoplaneta & {
  onEliminar: (id: string) => Promise<void>;
};

// no repito como texto temperatura, periodo ni radio porque ya los dice el esquema, masa, distancia y año sí porque no tienen forma visual
export function FilaExoplaneta({
  _id,
  nombre,
  estrellaAnfitriona,
  tipoPlaneta,
  masa,
  distancia,
  anioDescubrimiento,
  radio,
  temperaturaEquilibrio,
  periodoOrbital,
  zonaHabitable,
  creadoPor,
  onEliminar,
}: PropsFilaExoplaneta) {
  const { esAutor } = useAuth();

  return (
    <article className="grid gap-y-3 py-fila">
      {/* uní nombre y esquema en un solo enlace para que la órbita se ilumine al enfocarlo */}
      <Link
        to={RUTAS.DETALLE(_id)}
        className="grid items-center gap-x-12 gap-y-5 md:grid-cols-[minmax(13rem,23rem)_minmax(0,1fr)]"
      >
        <div className="min-w-0">
          <h2 className="font-serif text-nombre text-tinta">{nombre}</h2>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-apoyo text-tinta-tenue">
            <span>{ETIQUETAS_TIPO_PLANETA[tipoPlaneta]}</span>
            {masa !== undefined && <span>{formatearNumero(masa)} masas terrestres</span>}
            {distancia !== undefined && <span>a {formatearNumero(distancia)} años luz</span>}
            {anioDescubrimiento !== undefined && <span>descubierto en {anioDescubrimiento}</span>}
          </p>
        </div>
        <EsquemaSistema
          estrella={estrellaAnfitriona}
          planeta={nombre}
          radio={radio}
          temperatura={temperaturaEquilibrio}
          periodo={periodoOrbital}
          zonaHabitable={zonaHabitable}
          nombreEnEtiqueta={false}
        />
      </Link>

      {/* lo saqué del enlace para no meter botones dentro de un enlace */}
      {esAutor(creadoPor) && (
        <div className="flex items-baseline gap-x-6">
          <EnlaceBoton to={RUTAS.EDITAR(_id)}>editar</EnlaceBoton>
          <AccionEliminar onConfirmar={() => onEliminar(_id)} />
        </div>
      )}
    </article>
  );
}
