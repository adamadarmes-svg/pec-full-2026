import "styled-components";

// no tiene colores propios para que tailwind y styled-components no se desincronicen

const colores = {
  fondo: "var(--color-fondo)",
  tinta: "var(--color-tinta)",
  tintaTenue: "var(--color-tinta-tenue)",
  tintaApagada: "var(--color-tinta-apagada)",
  acento: "var(--color-acento)",
  acentoFuerte: "var(--color-acento-fuerte)",
  habitable: "var(--color-habitable)",
  calor: "var(--color-calor)",
  peligro: "var(--color-peligro)",
  linea: "var(--color-linea)",
  lineaFuerte: "var(--color-linea-fuerte)",
} as const;

// uso color-mix para no repetir los colores en rgba
export function translucido(color: string, porcentaje: number): string {
  return `color-mix(in srgb, ${color} ${porcentaje}%, transparent)`;
}

export const tema = {
  colores,

  fuentes: {
    serif: "var(--font-serif)",
    sans: "var(--font-sans)",
  },

  tamanos: {
    apoyo: "var(--text-apoyo)",
    cuerpo: "var(--text-cuerpo)",
    destacado: "var(--text-destacado)",
    nombre: "var(--text-nombre)",
    titulo: "var(--text-titulo)",
    monumental: "var(--text-monumental)",
  },

  // sin tracking amplio porque no hay mayúsculas, los titulares se cierran un poco porque a gran tamaño se separan
  tracking: {
    titular: "-0.015em",
    normal: "0",
  },

  // pasos grandes para separar con aire y no con cajas
  espaciado: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem",
    24: "6rem",
  },

  // radios de 0 a 2 px porque lo redondeado se ve genérico, solo los planetas son discos
  radios: {
    ninguno: "0",
    fino: "var(--radius-fino)",
    maximo: "var(--radius-maximo)",
  },

  // sin sombras, la profundidad la da la luz de los planetas
  transiciones: {
    rapida: "180ms ease-out",
  },

  capas: {
    base: 0,
    notificacion: 50,
  },

  medios: {
    tablet: "@media (min-width: 768px)",
    escritorio: "@media (min-width: 1024px)",
  },
} as const;

export type Tema = typeof tema;

// así props.theme viene tipado en todos los componentes
declare module "styled-components" {
  export interface DefaultTheme extends Tema {}
}
