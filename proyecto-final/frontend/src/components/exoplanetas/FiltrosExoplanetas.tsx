import { type ChangeEvent, useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { OPCIONES_METODO_DESCUBRIMIENTO, OPCIONES_TIPO_PLANETA } from "@/const/catalogo";
import { useDiferido } from "@/hooks/useDiferido";
import type { ClaveFiltro } from "@/hooks/useExoplanetas";
import type { FiltrosExoplanetas as Filtros, Opcion } from "@/types";

interface PropsFiltrosExoplanetas {
  filtros: Filtros;
  hayFiltros: boolean;
  onCambiar: <K extends ClaveFiltro>(clave: K, valor: Filtros[K]) => void;
  onLimpiar: () => void;
}

const OPCIONES_ZONA: Opcion<"si" | "no">[] = [
  { value: "si", label: "en zona habitable" },
  { value: "no", label: "fuera de la zona habitable" },
];

function aNumero(texto: string): number | undefined {
  if (texto.trim() === "") return undefined;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : undefined;
}

export function FiltrosExoplanetas({ filtros, hayFiltros, onCambiar, onLimpiar }: PropsFiltrosExoplanetas) {
  // espero 300 ms sin teclear para no lanzar una petición por cada letra
  const [busqueda, setBusqueda] = useState(filtros.buscar ?? "");
  const [anioDesde, setAnioDesde] = useState(filtros.anioDesde?.toString() ?? "");
  const [anioHasta, setAnioHasta] = useState(filtros.anioHasta?.toString() ?? "");

  const busquedaDiferida = useDiferido(busqueda);
  const anioDesdeDiferido = useDiferido(anioDesde);
  const anioHastaDiferido = useDiferido(anioHasta);

  // solo aviso si cambió de verdad para que limpiar no haga dos peticiones
  useEffect(() => {
    const valor = busquedaDiferida.trim() || undefined;
    if (valor !== filtros.buscar) onCambiar("buscar", valor);
  }, [busquedaDiferida]);

  useEffect(() => {
    const valor = aNumero(anioDesdeDiferido);
    if (valor !== filtros.anioDesde) onCambiar("anioDesde", valor);
  }, [anioDesdeDiferido]);

  useEffect(() => {
    const valor = aNumero(anioHastaDiferido);
    if (valor !== filtros.anioHasta) onCambiar("anioHasta", valor);
  }, [anioHastaDiferido]);

  const cambiarTipo = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;
    onCambiar("tipoPlaneta", OPCIONES_TIPO_PLANETA.find((o) => o.value === valor)?.value);
  };

  const cambiarMetodo = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;
    onCambiar(
      "metodoDescubrimiento",
      OPCIONES_METODO_DESCUBRIMIENTO.find((o) => o.value === valor)?.value
    );
  };

  const cambiarZona = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;
    onCambiar("zonaHabitable", valor === "" ? undefined : valor === "si");
  };

  const limpiar = () => {
    setBusqueda("");
    setAnioDesde("");
    setAnioHasta("");
    onLimpiar();
  };

  const valorZona = filtros.zonaHabitable === undefined ? "" : filtros.zonaHabitable ? "si" : "no";

  return (
    <form
      role="search"
      aria-label="filtrar exoplanetas"
      onSubmit={(evento) => evento.preventDefault()}
      className="grid grid-cols-2 items-end gap-x-8 gap-y-6 md:grid-cols-4 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,0.6fr)_minmax(0,0.6fr)]"
    >
      <div className="col-span-2 md:col-span-4 lg:col-span-1">
        <Campo
          etiqueta="buscar por nombre"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Kepler, TRAPPIST, HD…"
          autoComplete="off"
        />
      </div>
      <Selector
        etiqueta="tipo de planeta"
        opciones={OPCIONES_TIPO_PLANETA}
        opcionVacia="todos"
        value={filtros.tipoPlaneta ?? ""}
        onChange={cambiarTipo}
      />
      <Selector
        etiqueta="método de descubrimiento"
        opciones={OPCIONES_METODO_DESCUBRIMIENTO}
        opcionVacia="todos"
        value={filtros.metodoDescubrimiento ?? ""}
        onChange={cambiarMetodo}
      />
      <Selector etiqueta="zona habitable" opciones={OPCIONES_ZONA} opcionVacia="todas" value={valorZona} onChange={cambiarZona} />
      <Campo
        etiqueta="desde el año"
        type="number"
        inputMode="numeric"
        value={anioDesde}
        onChange={(evento) => setAnioDesde(evento.target.value)}
        placeholder="1995"
      />
      <Campo
        etiqueta="hasta el año"
        type="number"
        inputMode="numeric"
        value={anioHasta}
        onChange={(evento) => setAnioHasta(evento.target.value)}
        placeholder="2025"
      />

      {hayFiltros && (
        <div className="col-span-2 md:col-span-4 lg:col-span-6">
          <Boton onClick={limpiar}>quitar filtros</Boton>
        </div>
      )}
    </form>
  );
}
