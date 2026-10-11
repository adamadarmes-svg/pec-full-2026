import styled from "styled-components";
import { translucido } from "@/styles/theme";
import { formatearNumero } from "@/utils/formato";

// es lo único llamativo del diseño, por eso todo lo demás es silencioso

type TamanoEsquema = "normal" | "grande";

interface PropsEsquemaSistema {
  estrella: string;
  planeta: string;
  radio?: number;
  temperatura?: number;
  periodo?: number;
  zonaHabitable: boolean;
  tamano?: TamanoEsquema;
  // no repito el nombre porque en la fila ya se lee al lado
  nombreEnEtiqueta?: boolean;
}


function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

// usé escala logarítmica de 1 a 500 días porque si no casi todos quedaban pegados a la estrella, el 8 % inicial es para no dibujarlos encima de ella
const PERIODO_MIN = 1;
const PERIODO_MAX = 500;
const MARGEN_ESTRELLA = 8;

function posicionOrbital(periodo: number): number {
  const acotado = limitar(periodo, PERIODO_MIN, PERIODO_MAX);
  const fraccion = Math.log(acotado / PERIODO_MIN) / Math.log(PERIODO_MAX / PERIODO_MIN);
  return MARGEN_ESTRELLA + fraccion * (100 - MARGEN_ESTRELLA);
}

// usé la raíz del radio para que un gigante no aplaste a una terrestre
const RADIO_MIN = 0.3;
const RADIO_MAX = 25;
const DIAMETROS: Record<TamanoEsquema, { min: number; max: number }> = {
  normal: { min: 6, max: 40 },
  grande: { min: 10, max: 96 },
};

function diametroDisco(radio: number, tamano: TamanoEsquema): number {
  const { min, max } = DIAMETROS[tamano];
  const fraccion =
    (Math.sqrt(limitar(radio, RADIO_MIN, RADIO_MAX)) - Math.sqrt(RADIO_MIN)) / (Math.sqrt(RADIO_MAX) - Math.sqrt(RADIO_MIN));
  return min + fraccion * (max - min);
}

// el color sale de la temperatura y mezclo en oklab y no en oklch porque oklch pasaba por el rosa entre violeta y dorado
const T_FRIA = 100;
const T_TEMPLADA = 500;
const T_CALIENTE = 2000;

function colorTemperatura(kelvin: number): string {
  if (kelvin <= T_TEMPLADA) {
    const porcentaje = limitar((kelvin - T_FRIA) / (T_TEMPLADA - T_FRIA), 0, 1) * 100;
    return `color-mix(in oklab, var(--color-habitable), var(--color-acento) ${porcentaje.toFixed(1)}%)`;
  }
  const porcentaje = limitar((kelvin - T_TEMPLADA) / (T_CALIENTE - T_TEMPLADA), 0, 1) * 100;
  return `color-mix(in oklab, var(--color-acento), var(--color-calor) ${porcentaje.toFixed(1)}%)`;
}

// describo lo que el esquema solo dice con tamaño, color y posición
function describir({ planeta, radio, temperatura, periodo, zonaHabitable, nombreEnEtiqueta }: PropsEsquemaSistema): string {
  const partes = [
    nombreEnEtiqueta ? planeta : null,
    radio !== undefined ? `radio ${formatearNumero(radio)} radios terrestres` : "radio desconocido",
    temperatura !== undefined ? `temperatura ${formatearNumero(temperatura)} kelvin` : "temperatura desconocida",
    periodo !== undefined ? `periodo orbital ${formatearNumero(periodo)} días` : "periodo orbital desconocido",
    // siempre lo pongo, con el mismo sí o no que la ficha
    `zona habitable ${zonaHabitable ? "sí" : "no"}`,
  ];
  return partes.filter(Boolean).join(", ");
}

export function EsquemaSistema(props: PropsEsquemaSistema) {
  const { estrella, radio, temperatura, periodo, zonaHabitable, tamano = "normal", nombreEnEtiqueta = true } = props;

  // si falta un dato pinto el disco neutro y discontinuo porque la ausencia también es información
  const sinDatos = radio === undefined || temperatura === undefined || periodo === undefined;
  const diametro = diametroDisco(radio ?? 1, tamano);
  // sin periodo saco el disco de la órbita porque cualquier posición parecería un dato real
  const posicion = periodo !== undefined ? posicionOrbital(periodo) : null;
  const color = temperatura !== undefined ? colorTemperatura(temperatura) : undefined;
  const alto = DIAMETROS[tamano].max + 24;

  return (
    <Contenedor
      role="img"
      aria-label={`esquema del sistema de ${estrella}: ${describir({ ...props, nombreEnEtiqueta })}`}
      $alto={alto}
    >
      <Orbita aria-hidden $indeterminada={posicion === null} $hueco={diametro} />
      <Estrella aria-hidden $tamano={tamano} />
      <Planeta aria-hidden $posicion={posicion} $diametro={diametro}>
        {!sinDatos && color && <Resplandor $color={color} $diametro={diametro} />}
        <Disco $color={sinDatos ? undefined : color} />
        {zonaHabitable && <Anillo />}
      </Planeta>
    </Contenedor>
  );
}


// en móvil reduzco la escala para que el esquema se acorte pero no desaparezca
const Contenedor = styled.div.attrs<{ $alto: number }>(({ $alto }) => ({
  style: { height: `calc(${$alto}px * var(--escala))` },
}))`
  --escala: 0.72;
  position: relative;
  width: 100%;
  min-width: 0;

  ${({ theme }) => theme.medios.tablet} {
    --escala: 1;
  }
`;

// uso una segunda capa porque los degradados no se pueden animar
const Orbita = styled.span.attrs<{ $indeterminada: boolean; $hueco: number }>(({ $indeterminada, $hueco }) => ({
  style: $indeterminada ? { right: `calc(${($hueco + 16).toFixed(1)}px * var(--escala))` } : undefined,
}))`
  position: absolute;
  top: 50%;
  left: 3px;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colores.lineaFuerte},
    ${({ theme }) => translucido(theme.colores.tinta, 4)}
  );
  ${({ $indeterminada }) =>
    $indeterminada &&
    `mask-image: repeating-linear-gradient(to right, black 0 6px, transparent 6px 11px);`}

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colores.acentoFuerte},
      ${({ theme }) => translucido(theme.colores.acento, 35)}
    );
    transition: opacity ${({ theme }) => theme.transiciones.rapida};
  }

  ${Contenedor}:hover &::after,
  :is(a:hover, a:focus-visible) &::after {
    opacity: 1;
  }
`;

const Estrella = styled.span<{ $tamano: TamanoEsquema }>`
  position: absolute;
  top: 50%;
  left: 0;
  width: ${({ $tamano }) => ($tamano === "grande" ? 10 : 6)}px;
  height: ${({ $tamano }) => ($tamano === "grande" ? 10 : 6)}px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    ${({ theme }) => theme.colores.tinta} 0%,
    ${({ theme }) => theme.colores.acentoFuerte} 45%,
    transparent 75%
  );

  &::after {
    content: "";
    position: absolute;
    inset: -250%;
    border-radius: 50%;
    background: radial-gradient(circle, ${({ theme }) => translucido(theme.colores.acentoFuerte, 30)}, transparent 65%);
    filter: blur(3px);
  }
`;

// puse posición y tamaño en style para no crear una clase nueva por cada planeta
const Planeta = styled.span.attrs<{ $posicion: number | null; $diametro: number }>(({ $posicion, $diametro }) => ({
  style: {
    left: $posicion === null ? "100%" : `${$posicion}%`,
    transform: $posicion === null ? "translate(-100%, -50%)" : undefined,
    width: `calc(${$diametro.toFixed(1)}px * var(--escala))`,
    height: `calc(${$diametro.toFixed(1)}px * var(--escala))`,
  },
}))`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

// usé blur y no box-shadow porque el diseño no tiene sombras
const Resplandor = styled.span.attrs<{ $color: string; $diametro: number }>(({ $color, $diametro }) => ({
  style: {
    background: `radial-gradient(circle, ${$color} 0%, color-mix(in srgb, ${$color} 35%, transparent) 38%, transparent 68%)`,
    filter: `blur(calc(${Math.max($diametro * 0.18, 3).toFixed(1)}px * var(--escala)))`,
  },
}))`
  position: absolute;
  inset: -110%;
  border-radius: 50%;
  opacity: 0.75;
  pointer-events: none;
`;

// descentré el degradado para que parezca iluminado por la estrella de la izquierda
const Disco = styled.span.attrs<{ $color?: string }>(({ $color }) => ({
  style: $color
    ? {
        background: `radial-gradient(circle at 32% 38%, color-mix(in oklab, ${$color}, var(--color-tinta) 35%) 0%, ${$color} 42%, color-mix(in oklab, ${$color}, var(--color-fondo) 65%) 100%)`,
      }
    : undefined,
}))`
  position: absolute;
  inset: 0;
  border-radius: 50%;

  /* sin datos solo dejo el contorno discontinuo */
  &:not([style]) {
    border: 1px dashed ${({ theme }) => theme.colores.tintaApagada};
  }
`;

const Anillo = styled.span`
  position: absolute;
  inset: calc(-6px * var(--escala));
  border: 1px solid ${({ theme }) => translucido(theme.colores.habitable, 75)};
  border-radius: 50%;
`;
