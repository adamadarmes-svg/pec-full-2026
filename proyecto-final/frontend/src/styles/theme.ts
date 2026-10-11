import "styled-components";

// Tema visual de EXO-ARCHIVE: oscuro, espacial y de lujo minimalista.
// Los colores son los mismos que las variables de Tailwind de index.css,
// para que los componentes con styled-components y los de Tailwind se vean
// como una sola interfaz.

const colores = {
  // Fondo y superficies. La jerarquía se marca subiendo la luminosidad del
  // fondo un poco en cada nivel, no con sombras.
  fondo: "#06050a",
  superficie: "rgba(255, 255, 255, 0.025)",
  superficieFuerte: "rgba(255, 255, 255, 0.05)",
  superficieActiva: "rgba(255, 255, 255, 0.08)",

  // Bordes finísimos teñidos de dorado: son la estructura de la interfaz
  borde: "rgba(201, 167, 104, 0.16)",
  bordeFuerte: "rgba(201, 167, 104, 0.4)",

  // Escala de tintas, de texto principal a texto secundario y apagado
  tinta: "#f2ede1",
  tintaTenue: "#a39c8c",
  tintaApagada: "#625c4e",

  // Acento dorado y su texto de contraste para botones rellenos
  acento: "#c9a768",
  acentoTenue: "rgba(201, 167, 104, 0.14)",
  acentoFuerte: "#e8cd94",
  sobreAcento: "#1a1206",

  // Estados con significado propio
  habitable: "#9c8cf0",
  habitableTenue: "rgba(156, 140, 240, 0.14)",
  peligro: "#d1707a",
  peligroTenue: "rgba(209, 112, 122, 0.12)",
} as const;

export const tema = {
  colores,

  // Tres familias con papeles distintos: serif para los titulares, sans para
  // el texto corrido y monoespaciada para los datos numéricos (masa, radio,
  // periodo, temperatura, distancia). Las cifras alineadas en columnas son las
  // que hacen que una ficha se lea como un instrumento científico.
  // La mono es la del sistema (ui-monospace) para no descargar otra fuente.
  fuentes: {
    serif: '"Fraunces", Georgia, serif',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, "SF Mono", "Cascadia Mono", "Segoe UI Mono", Menlo, Consolas, monospace',
  },

  // Escala de mucho contraste: titulares enormes frente a etiquetas
  // diminutas. Ese salto de tamaño es el que da el aire editorial.
  tamanos: {
    etiqueta: "0.625rem", // 10px, para etiquetas en mayúsculas
    mini: "0.6875rem", // 11px
    pequeno: "0.8125rem", // 13px
    base: "0.9375rem", // 15px, texto corrido
    medio: "1.125rem",
    grande: "1.5rem",
    titulo: "2.5rem",
    display: "4rem",
    // Fluido para que el titular de portada no desborde en móvil
    monumental: "clamp(3rem, 9vw, 7rem)",
  },

  // Tracking negativo para los titulares grandes en serif (a ese tamaño se
  // ven demasiado separados) y muy amplio para las etiquetas en mayúsculas
  tracking: {
    titular: "-0.03em",
    ajustado: "-0.01em",
    normal: "0",
    amplio: "0.12em",
    etiqueta: "0.22em",
  },

  pesos: {
    ligero: 300,
    regular: 400,
    medio: 500,
    seminegrita: 600,
  },

  alturasLinea: {
    titular: 1.02,
    compacta: 1.25,
    normal: 1.6,
  },

  // Escala de espaciado generosa, con pasos grandes al final para separar
  // secciones con mucho aire en lugar de con líneas o cajas
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
    32: "8rem",
  },

  // Radios casi nulos, de 0 a 2px como máximo: decisión de diseño, no
  // descuido. Las esquinas redondeadas son el sello de las interfaces
  // genéricas; los ángulos rectos dan el aire editorial y científico.
  radios: {
    ninguno: "0",
    fino: "1px",
    maximo: "2px",
  },

  bordes: {
    fino: `1px solid ${colores.borde}`,
    fuerte: `1px solid ${colores.bordeFuerte}`,
    acento: `1px solid ${colores.acento}`,
  },

  // Sombras mínimas: sin desenfoques grandes ni efecto de elevación. Solo un
  // contorno de 1px y el anillo de foco, ambos sin difuminar.
  sombras: {
    ninguna: "none",
    contorno: `0 0 0 1px ${colores.borde}`,
    foco: `0 0 0 1px ${colores.acento}`,
  },

  transiciones: {
    rapida: "150ms ease",
    normal: "250ms ease",
  },

  capas: {
    base: 0,
    cabecera: 10,
    superpuesta: 40,
    notificacion: 50,
  },

  // Media queries listas para usar: ${({ theme }) => theme.medios.tablet} { ... }
  medios: {
    tablet: "@media (min-width: 768px)",
    escritorio: "@media (min-width: 1024px)",
    amplio: "@media (min-width: 1280px)",
  },
} as const;

export type Tema = typeof tema;

// Hace que props.theme venga tipado con este tema en todos los componentes
// de styled-components, sin tener que anotarlo en cada uno
declare module "styled-components" {
  export interface DefaultTheme extends Tema {}
}
