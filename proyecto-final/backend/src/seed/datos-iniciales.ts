import { IObservation } from "../types";

// Solo los campos de contenido: exoplaneta y autor los asigna seed.ts en
// tiempo de ejecución, porque sus _id dependen de los datos reales de la BD.
export type ObservacionInicial = Pick<IObservation, "contenido" | "tipo" | "anioObservacion" | "instrumento">;

// Redactadas sin nombrar un planeta concreto, porque el seed las reparte de
// forma cíclica entre los exoplanetas que existan.
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
