import type {
  FORMATOS_IMAGEN,
  METODOS_DESCUBRIMIENTO,
  ORIGENES_IMAGEN,
  ROLES,
  TIPOS_OBSERVACION,
  TIPOS_PLANETA,
} from "@/const/catalogo";

// los saqué de las constantes para tener una sola lista
export type RolUsuario = (typeof ROLES)[number];
export type TipoPlaneta = (typeof TIPOS_PLANETA)[number];
export type MetodoDescubrimiento = (typeof METODOS_DESCUBRIMIENTO)[number];
export type OrigenImagen = (typeof ORIGENES_IMAGEN)[number];
export type FormatoImagen = (typeof FORMATOS_IMAGEN)[number];
export type TipoObservacion = (typeof TIPOS_OBSERVACION)[number];

export interface Opcion<T extends string = string> {
  value: T;
  label: string;
}


// llega como id o como objeto según el endpoint, la unión me obliga a comprobarlo
export type Poblado<T extends { _id: string }> = string | T;

export function estaPoblado<T extends { _id: string }>(campo: Poblado<T> | null | undefined): campo is T {
  return typeof campo === "object" && campo !== null;
}

export function idDe<T extends { _id: string }>(campo: Poblado<T> | null | undefined): string | undefined {
  if (campo === null || campo === undefined) return undefined;
  return estaPoblado(campo) ? campo._id : campo;
}


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
  // solo viene en el detalle de una subida
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
  // solo viene con populate en moderación
  exoplaneta: Poblado<ExoplanetaResumen>;
  autor: Poblado<UsuarioResumen>;
  tipo: TipoObservacion;
  anioObservacion?: number;
  instrumento?: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

// tipé solo lo que trae el populate para no leer un dato que no llega
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
  // masa y radio en unidades terrestres, periodo en días, temperatura en kelvin y distancia en años luz
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
  // null cuando se quitó la principal
  imagenPrincipal?: Poblado<ImagenResumen> | null;
  fuentePrincipal?: Poblado<FuenteResumen>;
  creadoPor?: Poblado<UsuarioResumen>;
  createdAt: string;
  updatedAt: string;
}


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

// en el código se lanza ErrorApi, que además lleva el status
export interface CuerpoErrorApi {
  error: string;
  mensaje: string;
}


// todos opcionales, solo mando los que tienen valor
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
  // para mis registros
  creadoPor?: string;
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

// creadoPor e imagenPrincipal no se mandan porque el backend los pone o los descarta
export type DatosExoplaneta = Omit<
  Exoplaneta,
  "_id" | "createdAt" | "updatedAt" | "creadoPor" | "fuentePrincipal" | "imagenPrincipal"
> & { fuentePrincipal?: string };

// null significa borrar y el backend lo convierte en $unset
type CamposObligatorios = "nombre" | "estrellaAnfitriona" | "tipoPlaneta" | "zonaHabitable" | "confirmado";
export type CambiosExoplaneta = Partial<Pick<DatosExoplaneta, CamposObligatorios>> & {
  [K in Exclude<keyof DatosExoplaneta, CamposObligatorios>]?: DatosExoplaneta[K] | null;
} & { imagenPrincipal?: string | null };

// separé por origen para que typescript exija datos o url como el backend
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
