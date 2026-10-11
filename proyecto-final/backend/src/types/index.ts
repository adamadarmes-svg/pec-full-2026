import { Document, Types } from "mongoose";

// los puse como constantes para que esquemas y tipos usen la misma lista
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

// "subida" guarda la imagen en base64 en la base y "enlace" solo guarda la url
export const ORIGENES_IMAGEN = ["subida", "enlace"] as const;

export const FORMATOS_IMAGEN = ["jpeg", "png", "webp", "gif"] as const;

export const TIPOS_OBSERVACION = ["Observación", "Corrección", "Pregunta", "Referencia"] as const;

// saqué los tipos de las constantes para que se actualicen solos
export type RolUsuario = (typeof ROLES_USUARIO)[number];
export type TipoPlaneta = (typeof TIPOS_PLANETA)[number];
export type MetodoDescubrimiento = (typeof METODOS_DESCUBRIMIENTO)[number];
export type OrigenImagen = (typeof ORIGENES_IMAGEN)[number];
export type FormatoImagen = (typeof FORMATOS_IMAGEN)[number];
export type TipoObservacion = (typeof TIPOS_OBSERVACION)[number];

// los opcionales son los que el esquema no marca como required
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
  // lo implementa user-model.ts con bcrypt.compare
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

// según el origen va en datos o en url, por eso ninguno es obligatorio
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

// solo meto lo justo porque el token se puede leer sin la clave
export interface PayloadJWT {
  id: string;
  email: string;
  rol: RolUsuario;
}

// quité password y métodos de mongoose porque esto es lo que llega al cliente
export type UsuarioPublico = Pick<
  IUser,
  "nombre" | "email" | "institucion" | "rol" | "activo" | "createdAt" | "updatedAt"
> & { _id: Types.ObjectId };

export interface RespuestaAuth {
  usuario: UsuarioPublico;
  token: string;
}

// amplié el Request de express para poder usar req.usuario sin castings
declare global {
  namespace Express {
    interface Request {
      usuario?: IUser;
    }
  }
}

// el stack solo sale fuera de producción para depurar
export interface RespuestaError {
  error: string;
  mensaje: string;
  stack?: string;
}
