import { Document, Types } from "mongoose";

// Valores permitidos de los enums. Se definen como constantes para que los
// esquemas de Mongoose y los tipos de TypeScript compartan una única fuente.
export const ROLES_USUARIO = ["admin", "investigador"] as const;

export const TIPOS_PLANETA = [
  "Terrestre",
  "Supertierra",
  "Tipo-Neptuno",
  "Gigante gaseoso",
  "Desconocido",
] as const;

export const METODOS_DESCUBRIMIENTO = [
  "Tránsito",
  "Velocidad radial",
  "Imagen directa",
  "Microlente",
  "Astrometría",
  "Otro",
] as const;

// "subida": la imagen se guarda en Base64 en la propia BD; "enlace": URL externa
export const ORIGENES_IMAGEN = ["subida", "enlace"] as const;

export const FORMATOS_IMAGEN = ["jpeg", "png", "webp", "gif"] as const;

export const TIPOS_OBSERVACION = ["Observación", "Corrección", "Pregunta", "Referencia"] as const;

// Union types derivados de las constantes: si se añade un valor al array,
// el tipo se actualiza solo.
export type RolUsuario = (typeof ROLES_USUARIO)[number];
export type TipoPlaneta = (typeof TIPOS_PLANETA)[number];
export type MetodoDescubrimiento = (typeof METODOS_DESCUBRIMIENTO)[number];
export type OrigenImagen = (typeof ORIGENES_IMAGEN)[number];
export type FormatoImagen = (typeof FORMATOS_IMAGEN)[number];
export type TipoObservacion = (typeof TIPOS_OBSERVACION)[number];

// Los campos opcionales son los que el esquema no marca como required.
export interface IExoplanet extends Document {
  nombre: string;
  estrellaAnfitriona: string;
  tipoEspectral?: string;
  tipoPlaneta: TipoPlaneta;
  masa?: number;
  radio?: number;
  periodoOrbital?: number;
  temperaturaEquilibrio?: number;
  distancia?: number;
  metodoDescubrimiento?: MetodoDescubrimiento;
  anioDescubrimiento?: number;
  zonaHabitable: boolean;
  confirmado: boolean;
  descripcion?: string;
  imagenPrincipal?: Types.ObjectId;
  fuentePrincipal?: Types.ObjectId;
  creadoPor?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  institucion?: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Método de instancia definido en el modelo: compara con el hash guardado
  compararPassword(passwordPlano: string): Promise<boolean>;
}

export interface ISource extends Document {
  titulo: string;
  autores: string;
  publicacion?: string;
  anio?: number;
  doi?: string;
  url?: string;
  revisadoPorPares: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Según el origen, el contenido está en datos (Base64) o en url, nunca ambos obligatorios
export interface IImage extends Document {
  titulo: string;
  descripcion: string;
  origen: OrigenImagen;
  datos?: string;
  url?: string;
  formato?: FormatoImagen;
  tamanoKb?: number;
  exoplaneta: Types.ObjectId;
  subidaPor: Types.ObjectId;
  creditoAutor: string;
  publicada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Aportación de un usuario sobre un exoplaneta concreto
export interface IObservation extends Document {
  contenido: string;
  exoplaneta: Types.ObjectId;
  autor: Types.ObjectId;
  tipo: TipoObservacion;
  anioObservacion?: number;
  instrumento?: string;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Formato común de las respuestas de error de la API.
// stack solo se envía fuera de producción, para depurar.
export interface RespuestaError {
  error: string;
  mensaje: string;
  stack?: string;
}
