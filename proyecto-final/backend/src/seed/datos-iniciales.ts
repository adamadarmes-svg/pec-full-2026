import { IExoplanet, IObservation, ISource } from "../types";

// no guardo ningún _id porque en una base nueva no existirían, el seed resuelve las relaciones al ejecutarse

export type FuenteInicial = Pick<ISource, "titulo" | "autores" | "publicacion" | "anio" | "doi" | "url" | "revisadoPorPares">;

// identifico la fuente por su doi porque es único y no cambia
export interface ReferenciaFuente {
  doi: string;
}

// quité creadoPor e imagenPrincipal porque los pone el seed o no existen en una base nueva
export type ExoplanetaInicial = Pick<
  IExoplanet,
  | "nombre"
  | "estrellaAnfitriona"
  | "tipoEspectral"
  | "tipoPlaneta"
  | "masa"
  | "radio"
  | "periodoOrbital"
  | "temperaturaEquilibrio"
  | "distancia"
  | "metodoDescubrimiento"
  | "anioDescubrimiento"
  | "zonaHabitable"
  | "confirmado"
  | "descripcion"
> & { fuente?: ReferenciaFuente };

// exoplaneta y autor los pone el seed porque sus _id dependen de la base
export type ObservacionInicial = Pick<IObservation, "contenido" | "tipo" | "anioObservacion" | "instrumento">;

// van antes que los exoplanetas porque estos las referencian
export const FUENTES_INICIALES: FuenteInicial[] = [
  {
    titulo: "A Jupiter-mass companion to a solar-type star",
    autores: "Mayor, M. y Queloz, D.",
    publicacion: "Nature",
    anio: 1995,
    doi: "10.1038/378355a0",
    url: "https://doi.org/10.1038/378355a0",
    revisadoPorPares: true,
  },
  {
    titulo: "Detection of Planetary Transits Across a Sun-like Star",
    autores: "Charbonneau, D. et al.",
    publicacion: "The Astrophysical Journal Letters",
    anio: 2000,
    doi: "10.1086/312457",
    url: "https://doi.org/10.1086/312457",
    revisadoPorPares: true,
  },
  {
    titulo: "Discovery and Validation of Kepler-452b: A 1.6 R-Earth Super Earth Exoplanet in the Habitable Zone of a G2 Star",
    autores: "Jenkins, J. M. et al.",
    publicacion: "The Astronomical Journal",
    anio: 2015,
    doi: "10.1088/0004-6256/150/2/56",
    url: "https://doi.org/10.1088/0004-6256/150/2/56",
    revisadoPorPares: true,
  },
  {
    titulo: "Stellar and Planetary Properties of K2 Campaign 1 Candidates and Validation of 17 Planets",
    autores: "Montet, B. T. et al.",
    publicacion: "The Astrophysical Journal",
    anio: 2015,
    doi: "10.1088/0004-637X/809/1/25",
    url: "https://doi.org/10.1088/0004-637X/809/1/25",
    revisadoPorPares: true,
  },
  {
    titulo: "A terrestrial planet candidate in a temperate orbit around Proxima Centauri",
    autores: "Anglada-Escudé, G. et al.",
    publicacion: "Nature",
    anio: 2016,
    doi: "10.1038/nature19106",
    url: "https://doi.org/10.1038/nature19106",
    revisadoPorPares: true,
  },
  {
    titulo: "Seven temperate terrestrial planets around the nearby ultracool dwarf star TRAPPIST-1",
    autores: "Gillon, M. et al.",
    publicacion: "Nature",
    anio: 2017,
    doi: "10.1038/nature21360",
    url: "https://doi.org/10.1038/nature21360",
    revisadoPorPares: true,
  },
];

// los copié tal cual de producción, Kepler‑452 b lleva un guion especial porque así está guardado
export const EXOPLANETAS_INICIALES: ExoplanetaInicial[] = [
  {
    nombre: "51 Pegasi b",
    estrellaAnfitriona: "51 Pegasi",
    tipoEspectral: "G2IV",
    tipoPlaneta: "Gigante gaseoso",
    masa: 150,
    radio: 21,
    periodoOrbital: 4.23,
    temperaturaEquilibrio: 1260,
    distancia: 50.45,
    metodoDescubrimiento: "Velocidad radial",
    anioDescubrimiento: 1995,
    zonaHabitable: false,
    confirmado: true,
    descripcion: "Primer exoplaneta descubierto alrededor de una estrella de tipo solar. Es un júpiter caliente que orbita muy cerca de su estrella.",
    fuente: { doi: "10.1038/378355a0" },
  },
  {
    nombre: "Gliese 1214 b",
    estrellaAnfitriona: "Gliese 1214",
    tipoEspectral: "M4.5V",
    tipoPlaneta: "Tipo-Neptuno",
    masa: 6.55,
    radio: 2.68,
    periodoOrbital: 1.58,
    temperaturaEquilibrio: 555,
    distancia: 48,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2009,
    zonaHabitable: false,
    confirmado: true,
    descripcion: "Mundo oceánico candidato, con una densidad que sugiere una envoltura rica en agua o en hidrógeno.",
  },
  {
    nombre: "HD 209458 b",
    estrellaAnfitriona: "HD 209458",
    tipoEspectral: "G0V",
    tipoPlaneta: "Gigante gaseoso",
    masa: 220,
    radio: 15.5,
    periodoOrbital: 3.52,
    temperaturaEquilibrio: 1450,
    distancia: 159,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 1999,
    zonaHabitable: false,
    confirmado: true,
    descripcion: "Primer exoplaneta detectado por el método de tránsito y primero al que se le identificó una atmósfera.",
    fuente: { doi: "10.1086/312457" },
  },
  {
    nombre: "K2-18 b",
    estrellaAnfitriona: "K2-18",
    tipoEspectral: "M2.5V",
    tipoPlaneta: "Tipo-Neptuno",
    masa: 8.63,
    radio: 2.61,
    periodoOrbital: 32.94,
    temperaturaEquilibrio: 265,
    distancia: 124,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2015,
    zonaHabitable: true,
    confirmado: true,
    descripcion: "Mini-Neptuno en la zona habitable de una enana roja. Objeto de estudio por la posible presencia de vapor de agua en su atmósfera.",
    fuente: { doi: "10.1088/0004-637X/809/1/25" },
  },
  {
    nombre: "KOI-5715.01",
    estrellaAnfitriona: "KOI-5715",
    tipoEspectral: "K",
    tipoPlaneta: "Supertierra",
    masa: 4.2,
    radio: 1.8,
    periodoOrbital: 189.96,
    temperaturaEquilibrio: 240,
    distancia: 2965,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2020,
    zonaHabitable: true,
    confirmado: false,
    descripcion: "Candidato a supertierra pendiente de confirmación. Los parámetros son estimaciones sujetas a revisión.",
  },
  {
    nombre: "Kepler‑452 b",
    estrellaAnfitriona: "Kepler‑452",
    tipoEspectral: "G2",
    tipoPlaneta: "Supertierra",
    masa: 5,
    radio: 1.63,
    periodoOrbital: 384.84,
    temperaturaEquilibrio: 265,
    distancia: 1400,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2015,
    zonaHabitable: true,
    confirmado: true,
    descripcion: "Planeta extrasolar que orbita una estrella tipo G2 en la constelación de Cygnus. Se considera uno de los primeros candidatos potencialmente habitables por su tamaño y distancia orbital similares a los de la Tierra.",
  },
  {
    nombre: "LHS 1140 b",
    estrellaAnfitriona: "LHS 1140",
    tipoEspectral: "M4.5V",
    tipoPlaneta: "Supertierra",
    masa: 6.38,
    radio: 1.73,
    periodoOrbital: 24.74,
    temperaturaEquilibrio: 230,
    distancia: 48.9,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2017,
    zonaHabitable: true,
    confirmado: true,
    descripcion: "Supertierra rocosa en la zona habitable de una enana roja tranquila.",
  },
  {
    nombre: "Proxima Centauri b",
    estrellaAnfitriona: "Proxima Centauri",
    tipoEspectral: "M5.5V",
    tipoPlaneta: "Terrestre",
    masa: 1.07,
    radio: 1.03,
    periodoOrbital: 11.19,
    temperaturaEquilibrio: 234,
    distancia: 4.24,
    metodoDescubrimiento: "Velocidad radial",
    anioDescubrimiento: 2016,
    zonaHabitable: true,
    confirmado: true,
    descripcion: "El exoplaneta confirmado más cercano a la Tierra. Orbita en la zona habitable de una enana roja sujeta a intensas fulguraciones estelares.",
    fuente: { doi: "10.1038/nature19106" },
  },
  {
    nombre: "TRAPPIST-1 e",
    estrellaAnfitriona: "TRAPPIST-1",
    tipoEspectral: "M8V",
    tipoPlaneta: "Terrestre",
    masa: 0.69,
    radio: 0.92,
    periodoOrbital: 6.1,
    temperaturaEquilibrio: 250,
    distancia: 40.7,
    metodoDescubrimiento: "Tránsito",
    anioDescubrimiento: 2017,
    zonaHabitable: true,
    confirmado: true,
    descripcion: "Uno de los siete planetas templados del sistema TRAPPIST-1. Es el candidato con mayor probabilidad de albergar agua líquida en superficie.",
    fuente: { doi: "10.1038/nature21360" },
  },
];

// no nombran ningún planeta porque el seed las reparte entre todos
export const OBSERVACIONES_EJEMPLO: ObservacionInicial[] = [
  {
    contenido:
      "El espectro de transmisión obtenido con NIRSpec muestra una banda de absorción de CO2 en torno a 4,3 micras, lo que apunta a una atmósfera rica en compuestos de carbono.",
    tipo: "Observación",
    anioObservacion: 2023,
    instrumento: "JWST",
  },
  {
    contenido:
      "La curva de luz completa de la misión principal reduce la incertidumbre del periodo orbital. El valor del catálogo está desfasado en varios minutos y debería actualizarse.",
    tipo: "Corrección",
    anioObservacion: 2013,
    instrumento: "Kepler",
  },
  {
    contenido:
      "¿Las variaciones en la profundidad del tránsito entre sectores se deben a manchas estelares o a la presencia de un segundo planeta no detectado?",
    tipo: "Pregunta",
    anioObservacion: 2021,
    instrumento: "TESS",
  },
  {
    contenido:
      "Las medidas de velocidad radial con ESPRESSO acotan la masa con una precisión mejor del 10 %. Ver la publicación del consorcio ESPRESSO para los datos completos.",
    tipo: "Referencia",
    anioObservacion: 2020,
    instrumento: "VLT",
  },
  {
    contenido:
      "Las observaciones en ultravioleta con STIS detectan una cola de hidrógeno que se extiende más allá del radio de Roche, señal de escape atmosférico activo.",
    tipo: "Observación",
    anioObservacion: 2018,
    instrumento: "Hubble",
  },
  {
    contenido:
      "El radio publicado no tenía en cuenta la dilución por una estrella compañera cercana. Con la corrección, el planeta resulta un 8 % mayor de lo indicado.",
    tipo: "Corrección",
    anioObservacion: 2022,
    instrumento: "TESS",
  },
];
