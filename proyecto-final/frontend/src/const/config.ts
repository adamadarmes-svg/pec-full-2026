
const urlEntorno = import.meta.env.VITE_API_URL;

// prefiero un error claro al arrancar a peticiones fallando a undefined
if (!urlEntorno) {
  throw new Error(
    "falta VITE_API_URL en .env.development o .env.production (debe acabar en /api)."
  );
}

// quito la barra final para poder concatenar los endpoints
export const API_URL = urlEntorno.replace(/\/+$/, "");

// puse un prefijo para no chocar con otras apps del mismo dominio
export const CLAVES_STORAGE = {
  TOKEN: "exoarchive:token",
  USUARIO: "exoarchive:usuario",
} as const;

// uso un evento para que api.ts no dependa de react
export const EVENTO_SESION_EXPIRADA = "exoarchive:sesion-expirada";

export const MENSAJES = {
  SIN_CONEXION: "sin conexión con el servidor. prueba otra vez.",
  ERROR_GENERICO: "no se pudo completar. prueba otra vez.",
  SESION_EXPIRADA: "tu sesión ha caducado. vuelve a entrar.",
  SESION_INICIADA: "sesión iniciada.",
  SESION_CERRADA: "sesión cerrada.",
  REGISTRO_COMPLETADO: "cuenta creada.",
  SIN_PERMISO: "solo su autor o un administrador pueden hacerlo.",
  CAMPO_OBLIGATORIO: "campo obligatorio.",
  REVISA_CAMPOS: "corrige los campos marcados.",
  GUARDADO: "cambios guardados.",
  CREADO: "exoplaneta registrado.",
  ELIMINADO: "exoplaneta eliminado.",
  IMAGEN_PENDIENTE: "imagen enviada. falta que la publique un administrador.",
  IMAGEN_PUBLICADA: "imagen publicada.",
  IMAGEN_DESPUBLICADA: "imagen retirada. vuelve a estar pendiente.",
  IMAGEN_ELIMINADA: "imagen eliminada.",
  PRINCIPAL_ACTUALIZADA: "imagen principal actualizada.",
  OBSERVACION_PUBLICADA: "observación publicada.",
  OBSERVACION_ELIMINADA: "observación eliminada.",
  OBSERVACION_OCULTA: "observación oculta.",
  OBSERVACION_VISIBLE: "observación visible.",
  SOLO_ADMIN: "solo para administradores.",
} as const;
