// Configuración global leída una sola vez al cargar la aplicación.

const urlEntorno = import.meta.env.VITE_API_URL;

// Sin URL de la API la aplicación no puede hacer nada: mejor un error claro
// al arrancar que peticiones fallando a "undefined/exoplanets"
if (!urlEntorno) {
  throw new Error(
    "Falta la variable de entorno VITE_API_URL. Defínela en .env.development o .env.production (debe terminar en /api)."
  );
}

// Sin barra final, para poder concatenar endpoints que empiezan por "/"
export const API_URL = urlEntorno.replace(/\/+$/, "");

// Prefijo propio para no chocar con otras aplicaciones del mismo dominio
export const CLAVES_STORAGE = {
  TOKEN: "exoarchive:token",
  USUARIO: "exoarchive:usuario",
} as const;

// Evento de window que emite la capa de API cuando el servidor rechaza el
// token. AuthContext lo escucha; así api.ts no depende de React.
export const EVENTO_SESION_EXPIRADA = "exoarchive:sesion-expirada";

export const MENSAJES = {
  SIN_CONEXION: "No se ha podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.",
  ERROR_GENERICO: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
  SESION_EXPIRADA: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
  SESION_INICIADA: "Sesión iniciada correctamente.",
  SESION_CERRADA: "Has cerrado sesión.",
  REGISTRO_COMPLETADO: "Cuenta creada. Ya puedes empezar a catalogar.",
  SIN_PERMISO: "No tienes permiso para realizar esta acción.",
  CAMPO_OBLIGATORIO: "Este campo es obligatorio.",
  GUARDADO: "Cambios guardados.",
  CREADO: "Registro creado correctamente.",
  ELIMINADO: "Registro eliminado.",
  IMAGEN_PENDIENTE: "Imagen enviada. Será visible cuando un administrador la apruebe.",
} as const;
