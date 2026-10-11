import type {
  FORMATOS_IMAGEN,
  METODOS_DESCUBRIMIENTO,
  ORIGENES_IMAGEN,
  ROLES,
  TIPOS_OBSERVACION,
  TIPOS_PLANETA,
} from "@/const/catalogo";

// Union types derivados de las constantes del catálogo: una sola fuente de
// verdad para los valores y para los tipos
export type RolUsuario = (typeof ROLES)[number];
export type TipoPlaneta = (typeof TIPOS_PLANETA)[number];
export type MetodoDescubrimiento = (typeof METODOS_DESCUBRIMIENTO)[number];
export type OrigenImagen = (typeof ORIGENES_IMAGEN)[number];
export type FormatoImagen = (typeof FORMATOS_IMAGEN)[number];
export type TipoObservacion = (typeof TIPOS_OBSERVACION)[number];

// Opción de un select
export interface Opcion<T extends string = string> {
  value: T;
  label: string;
}

// --- Referencias con populate ---

// Un campo referenciado llega como id (sin populate) o como objeto (con
// populate), según el endpoint. La unión obliga a comprobar cuál es antes de
// leer sus propiedades.
export type Poblado<T extends { _id: string }> = string | T;

// Type guard: true si el campo viene como objeto
export function estaPoblado<T extends { _id: string }>(campo: Poblado<T> | null | undefined): campo is T {
  return typeof campo === "object" && campo !== null;
}

// Id de un campo referenciado, venga como venga
export function idDe<T extends { _id: string }>(campo: Poblado<T> | null | undefined): string | undefined {
  if (campo === null || campo === undefined) return undefined;
  return estaPoblado(campo) ? campo._id : campo;
}

// --- Entidades tal como las devuelve la API ---

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  institucion?: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Fuente {
  _id: string;
  titulo: string;
  autores: string;
  publicacion?: string;
  anio?: number;
  doi?: string;
  url?: string;
  revisadoPorPares: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Imagen {
  _id: string;
  titulo: string;
  descripcion: string;
  origen: OrigenImagen;
  // Solo en el detalle de una imagen subida: los listados nunca lo incluyen
  datos?: string;
  url?: string;
  formato?: FormatoImagen;
  tamanoKb?: number;
  exoplaneta: Poblado<ExoplanetaResumen>;
  subidaPor: Poblado<Pick<Usuario, "_id" | "nombre">>;
  creditoAutor: string;
  publicada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Observacion {
  _id: string;
  contenido: string;
  exoplaneta: string;
  autor: Poblado<UsuarioResumen>;
  tipo: TipoObservacion;
  anioObservacion?: number;
  instrumento?: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Las versiones con populate solo traen los campos que selecciona el
// backend. Tiparlas así impide leer en un componente un dato que no llega.
export type UsuarioResumen = Pick<Usuario, "_id" | "nombre" | "institucion">;
export type FuenteResumen = Pick<Fuente, "_id" | "titulo" | "autores" | "publicacion" | "anio" | "doi" | "url">;
export type ImagenResumen = Pick<Imagen, "_id" | "titulo" | "url" | "datos" | "origen">;
export type ExoplanetaResumen = Pick<Exoplaneta, "_id" | "nombre">;

export interface Exoplaneta {
  _id: string;
  nombre: string;
  estrellaAnfitriona: string;
  tipoEspectral?: string;
  tipoPlaneta: TipoPlaneta;
  // Unidades: masa y radio en masas/radios terrestres, periodo en días,
  // temperatura en kelvin y distancia en años luz
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
  // null cuando se quitó la imagen principal
  imagenPrincipal?: Poblado<ImagenResumen> | null;
  fuentePrincipal?: Poblado<FuenteResumen>;
  creadoPor?: Poblado<UsuarioResumen>;
  createdAt: string;
  updatedAt: string;
}

// --- Respuestas de la API ---

export interface Paginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface RespuestaExoplanetas {
  exoplanetas: Exoplaneta[];
  paginacion: Paginacion;
}

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}

export interface RespuestaEliminacion {
  mensaje: string;
  id: string;
}

export interface RespuestaEliminacionExoplaneta extends RespuestaEliminacion {
  imagenesBorradas: number;
  observacionesBorradas: number;
}

// Cuerpo de cualquier error de la API. La clase que se lanza en el código
// es ErrorApi (services/api.ts), que además lleva el status HTTP.
export interface CuerpoErrorApi {
  error: string;
  mensaje: string;
}

// --- Datos que se envían a la API ---

// Parámetros del listado. Todos opcionales: solo se envían los que tienen valor.
export interface FiltrosExoplanetas {
  pagina?: number;
  limite?: number;
  buscar?: string;
  tipoPlaneta?: TipoPlaneta;
  tipos?: TipoPlaneta[];
  metodoDescubrimiento?: MetodoDescubrimiento;
  zonaHabitable?: boolean;
  confirmado?: boolean;
  anioDesde?: number;
  anioHasta?: number;
  distanciaMax?: number;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  institucion?: string;
}

export interface DatosLogin {
  email: string;
  password: string;
}

// Al crear, las referencias se envían como id. creadoPor e imagenPrincipal
// no van: el backend asigna el primero y descarta el segundo.
export type DatosExoplaneta = Omit<
  Exoplaneta,
  "_id" | "createdAt" | "updatedAt" | "creadoPor" | "fuentePrincipal" | "imagenPrincipal"
> & { fuentePrincipal?: string };

// Al actualizar sí se puede fijar o quitar (null) la imagen principal
export type CambiosExoplaneta = Partial<DatosExoplaneta> & { imagenPrincipal?: string | null };

// Unión discriminada por origen: TypeScript exige datos en una subida y url
// en un enlace, igual que el validador del backend
interface DatosImagenComunes {
  titulo: string;
  descripcion?: string;
  creditoAutor?: string;
  exoplaneta: string;
}
export type DatosImagenNueva =
  | (DatosImagenComunes & { origen: "subida"; datos: string })
  | (DatosImagenComunes & { origen: "enlace"; url: string; formato?: FormatoImagen });

export type CambiosImagen = Partial<Pick<Imagen, "titulo" | "descripcion" | "creditoAutor">>;

export type DatosObservacion = Pick<Observacion, "contenido"> &
  Partial<Pick<Observacion, "tipo" | "anioObservacion" | "instrumento">>;

export type DatosFuente = Omit<Fuente, "_id" | "createdAt" | "updatedAt" | "revisadoPorPares"> & {
  revisadoPorPares?: boolean;
};
