import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROLES } from "@/const/catalogo";
import { EVENTO_SESION_EXPIRADA } from "@/const/config";
import * as authService from "@/services/authService";
import { ErrorApi, esAbortError } from "@/services/api";
import { guardarSesion, guardarUsuario, leerToken, leerUsuarioCrudo, limpiarSesion } from "@/services/sesionStorage";
import { type DatosLogin, type DatosRegistro, idDe, type Poblado, type Usuario } from "@/types";

interface EstadoAuth {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
}

interface ValorAuth {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  estaAutenticado: boolean;
  esAdmin: boolean;
  esAutor: (autor: Poblado<{ _id: string }> | null | undefined) => boolean;
  iniciarSesion: (datos: DatosLogin) => Promise<Usuario>;
  registrar: (datos: DatosRegistro) => Promise<Usuario>;
  cerrarSesion: () => void;
}

const ESTADO_VACIO: EstadoAuth = { usuario: null, token: null, cargando: false };

const AuthContext = createContext<ValorAuth | null>(null);

// localStorage lo puede editar cualquiera desde las herramientas del
// navegador: se comprueba la forma mínima antes de confiar en el usuario guardado
function esUsuarioGuardado(valor: unknown): valor is Usuario {
  if (typeof valor !== "object" || valor === null) return false;
  if (!("_id" in valor) || !("email" in valor) || !("rol" in valor)) return false;
  const { _id, email, rol } = valor;
  return typeof _id === "string" && typeof email === "string" && ROLES.some((valido) => valido === rol);
}

// Inicialización perezosa: se ejecuta una sola vez, en el primer render. Si
// los datos guardados están corruptos se limpian y se arranca sin sesión.
function leerSesionGuardada(): EstadoAuth {
  try {
    const token = leerToken();
    const usuarioCrudo = leerUsuarioCrudo();
    if (!token || !usuarioCrudo) return ESTADO_VACIO;

    const usuario: unknown = JSON.parse(usuarioCrudo);
    if (!esUsuarioGuardado(usuario)) throw new Error("Usuario guardado no válido");

    // cargando en true: hay sesión, pero falta confirmar con el servidor que
    // el token sigue siendo válido (ver el efecto de montaje)
    return { usuario, token, cargando: true };
  } catch {
    limpiarSesion();
    return ESTADO_VACIO;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Un único estado: usuario, token y carga cambian siempre juntos
  const [estado, setEstado] = useState<EstadoAuth>(leerSesionGuardada);

  // Al montar, si hay token guardado se valida contra el servidor. Solo se
  // ejecuta una vez: después, los 401 los detecta la capa de API.
  useEffect(() => {
    if (!estado.token) return;

    // activo evita actualizar el estado si el componente ya se desmontó
    let activo = true;
    const controlador = new AbortController();

    authService
      .obtenerPerfil(controlador.signal)
      .then((usuario) => {
        if (!activo) return;
        // Se refresca el usuario por si cambió (por ejemplo, de rol)
        guardarUsuario(usuario);
        setEstado((previo) => ({ ...previo, usuario, cargando: false }));
      })
      .catch((error: unknown) => {
        if (!activo || esAbortError(error)) return;
        // Solo se cierra sesión si el servidor rechaza el token o la cuenta.
        // Si falla la red se conserva la sesión guardada para no echar al
        // usuario por un corte momentáneo.
        if (error instanceof ErrorApi && (error.status === 401 || error.status === 403)) {
          limpiarSesion();
          setEstado(ESTADO_VACIO);
        } else {
          setEstado((previo) => ({ ...previo, cargando: false }));
        }
      });

    return () => {
      activo = false;
      controlador.abort();
    };
    // Solo al montar: el token inicial es el que hay que validar
  }, []);

  // La capa de API avisa con este evento cuando un 401 invalida el token
  // en cualquier petición; aquí se vacía el estado para que la interfaz lo refleje
  useEffect(() => {
    const manejarSesionExpirada = () => setEstado(ESTADO_VACIO);
    window.addEventListener(EVENTO_SESION_EXPIRADA, manejarSesionExpirada);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, manejarSesionExpirada);
  }, []);

  const iniciarSesion = useCallback(async (datos: DatosLogin): Promise<Usuario> => {
    const { usuario, token } = await authService.iniciarSesion(datos);
    guardarSesion(token, usuario);
    setEstado({ usuario, token, cargando: false });
    return usuario;
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro): Promise<Usuario> => {
    const { usuario, token } = await authService.registrar(datos);
    guardarSesion(token, usuario);
    setEstado({ usuario, token, cargando: false });
    return usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    limpiarSesion();
    setEstado(ESTADO_VACIO);
  }, []);

  // useMemo para que los consumidores no se vuelvan a renderizar si el
  // estado no ha cambiado
  const valor = useMemo<ValorAuth>(() => {
    const { usuario, token, cargando } = estado;
    const esAdmin = usuario?.rol === "admin";
    return {
      usuario,
      token,
      cargando,
      estaAutenticado: Boolean(usuario && token),
      esAdmin,
      // Acepta el autor como id o como objeto con populate, porque creadoPor,
      // subidaPor y autor llegan de una forma u otra según el endpoint
      esAutor: (autor) => {
        if (!usuario) return false;
        return esAdmin || idDe(autor) === usuario._id;
      },
      iniciarSesion,
      registrar,
      cerrarSesion,
    };
  }, [estado, iniciarSesion, registrar, cerrarSesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ValorAuth {
  const contexto = useContext(AuthContext);
  // Usarlo fuera del Provider es un error de programación: mejor fallar claro
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return contexto;
}
