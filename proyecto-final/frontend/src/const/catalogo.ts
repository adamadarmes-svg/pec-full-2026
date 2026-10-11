import type {
  FormatoImagen,
  MetodoDescubrimiento,
  Opcion,
  OrigenImagen,
  RolUsuario,
  TipoObservacion,
  TipoPlaneta,
} from "@/types";

// tienen que ser iguales que en el backend, tildes incluidas, o la api los rechaza
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

// uso etiquetas propias en vez de text-transform para dejar con mayúscula Neptuno, Júpiter y Tierra
export const ETIQUETAS_TIPO_PLANETA: Record<TipoPlaneta, string> = {
  Terrestre: "terrestre",
  Supertierra: "supertierra",
  "Tipo-Neptuno": "tipo Neptuno",
  "Gigante gaseoso": "gigante gaseoso",
  Desconocido: "tipo desconocido",
};

export const ETIQUETAS_METODO_DESCUBRIMIENTO: Record<MetodoDescubrimiento, string> = {
  Tránsito: "tránsito",
  "Velocidad radial": "velocidad radial",
  "Imagen directa": "imagen directa",
  Microlente: "microlente",
  Astrometría: "astrometría",
  Otro: "otro método",
};

export const ETIQUETAS_TIPO_OBSERVACION: Record<TipoObservacion, string> = {
  Observación: "observación",
  Corrección: "corrección",
  Pregunta: "pregunta",
  Referencia: "referencia",
};

export const ETIQUETAS_ORIGEN_IMAGEN: Record<OrigenImagen, string> = {
  subida: "subir archivo",
  enlace: "enlace externo",
};

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  admin: "administrador",
  investigador: "investigador",
};

function aOpciones<T extends string>(valores: readonly T[], etiquetas: Record<T, string>): Opcion<T>[] {
  return valores.map((valor) => ({ value: valor, label: etiquetas[valor] }));
}

export const OPCIONES_TIPO_PLANETA = aOpciones(TIPOS_PLANETA, ETIQUETAS_TIPO_PLANETA);
export const OPCIONES_METODO_DESCUBRIMIENTO = aOpciones(METODOS_DESCUBRIMIENTO, ETIQUETAS_METODO_DESCUBRIMIENTO);
export const OPCIONES_TIPO_OBSERVACION = aOpciones(TIPOS_OBSERVACION, ETIQUETAS_TIPO_OBSERVACION);
export const OPCIONES_ORIGEN_IMAGEN = aOpciones(ORIGENES_IMAGEN, ETIQUETAS_ORIGEN_IMAGEN);
export const OPCIONES_ROL = aOpciones(ROLES, ETIQUETAS_ROL);
export const OPCIONES_FORMATO_IMAGEN: Opcion<FormatoImagen>[] = FORMATOS_IMAGEN.map((formato) => ({
  value: formato,
  label: formato,
}));

// los repito aquí para avisar antes de enviar
export const LIMITES = {
  TITULO_IMAGEN: 120,
  DESCRIPCION_IMAGEN: 500,
  OBSERVACION_MIN: 10,
  OBSERVACION_MAX: 1000,
  PASSWORD_MIN: 6,
  ANIO_MIN_DESCUBRIMIENTO: 1988,
  // base64 ocupa un tercio más, por eso el archivo original no puede pasar de unos 3000 kb
  IMAGEN_BASE64_MAX_KB: 4000,
  IMAGEN_ARCHIVO_MAX_KB: 3000,
  // apunto a la mitad del máximo para dejar margen al resto de la petición
  IMAGEN_BASE64_OBJETIVO_KB: 2048,
} as const;

export const POR_PAGINA = 12;
