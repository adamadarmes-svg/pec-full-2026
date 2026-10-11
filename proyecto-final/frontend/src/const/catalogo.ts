import type { Opcion } from "@/types";

// Valores de dominio. Deben coincidir exactamente con los enums del backend,
// tildes incluidas: si difieren, la API rechaza el dato con un 400.
// Los union types de types/index.ts se derivan de estos arrays.
export const TIPOS_PLANETA = ["Terrestre", "Supertierra", "Tipo-Neptuno", "Gigante gaseoso", "Desconocido"] as const;

export const METODOS_DESCUBRIMIENTO = [
  "Tránsito",
  "Velocidad radial",
  "Imagen directa",
  "Microlente",
  "Astrometría",
  "Otro",
] as const;

export const TIPOS_OBSERVACION = ["Observación", "Corrección", "Pregunta", "Referencia"] as const;

export const FORMATOS_IMAGEN = ["jpeg", "png", "webp", "gif"] as const;

export const ORIGENES_IMAGEN = ["subida", "enlace"] as const;

export const ROLES = ["admin", "investigador"] as const;

// Opciones para los select. Cuando el valor ya es legible se usa como etiqueta.
function aOpciones<T extends string>(valores: readonly T[]): Opcion<T>[] {
  return valores.map((valor) => ({ value: valor, label: valor }));
}

export const OPCIONES_TIPO_PLANETA = aOpciones(TIPOS_PLANETA);
export const OPCIONES_METODO_DESCUBRIMIENTO = aOpciones(METODOS_DESCUBRIMIENTO);
export const OPCIONES_TIPO_OBSERVACION = aOpciones(TIPOS_OBSERVACION);

export const OPCIONES_FORMATO_IMAGEN: Opcion<(typeof FORMATOS_IMAGEN)[number]>[] = FORMATOS_IMAGEN.map((formato) => ({
  value: formato,
  label: formato.toUpperCase(),
}));

export const OPCIONES_ORIGEN_IMAGEN: Opcion<(typeof ORIGENES_IMAGEN)[number]>[] = [
  { value: "subida", label: "Subir archivo" },
  { value: "enlace", label: "Enlace externo" },
];

export const OPCIONES_ROL: Opcion<(typeof ROLES)[number]>[] = [
  { value: "admin", label: "Administrador" },
  { value: "investigador", label: "Investigador" },
];

// Límites que replica el frontend para avisar antes de enviar. La validación
// definitiva sigue siendo la del backend.
export const LIMITES = {
  TITULO_IMAGEN: 120,
  DESCRIPCION_IMAGEN: 500,
  OBSERVACION_MIN: 10,
  OBSERVACION_MAX: 1000,
  PASSWORD_MIN: 6,
  ANIO_MIN_DESCUBRIMIENTO: 1988,
  // Límite de la cadena Base64 que acepta la API (por el máximo de 4,5 MB por
  // petición de Vercel). Base64 ocupa un tercio más que el archivo, así que
  // el archivo original puede pesar como mucho unos 3000 KB.
  IMAGEN_BASE64_MAX_KB: 4000,
  IMAGEN_ARCHIVO_MAX_KB: 3000,
} as const;

// Exoplanetas por página en el catálogo: múltiplo de 2, 3 y 4 para que la
// rejilla quede completa en cualquier número de columnas
export const POR_PAGINA = 12;
