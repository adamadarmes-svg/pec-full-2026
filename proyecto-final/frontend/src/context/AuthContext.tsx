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

// compruebo la forma porque cualquiera puede editar el localStorage
function esUsuarioGuardado(valor: unknown): valor is Usuario {
  if (typeof valor !== "object" || valor === null) return false;
  if (!("_id" in valor) || !("email" in valor) || !("rol" in valor)) return false;
  const { _id, email, rol } = valor;
  return typeof _id === "string" && typeof email === "string" && ROLES.some((valido) => valido === rol);
}

// lo inicializo una sola vez y si los datos están rotos empiezo sin sesión
function leerSesionGuardada(): EstadoAuth {
  try {
    const token = leerToken();
    const usuarioCrudo = leerUsuarioCrudo();
    if (!token || !usuarioCrudo) return ESTADO_VACIO;

    const usuario: unknown = JSON.parse(usuarioCrudo);
    if (!esUsuarioGuardado(usuario)) throw new Error("usuario guardado no válido");

    // empiezo cargando porque falta confirmar que el token sigue valiendo
    return { usuario, token, cargando: true };
  } catch {
    limpiarSesion();
    return ESTADO_VACIO;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // un solo estado porque usuario, token y carga cambian juntos
  const [estado, setEstado] = useState<EstadoAuth>(leerSesionGuardada);

  // valido el token solo al montar, después los 401 los detecta la api
  useEffect(() => {
    if (!estado.token) return;

    // uso activo para no tocar el estado si ya se desmontó
    let activo = true;
    const controlador = new AbortController();

    authService
      .obtenerPerfil(controlador.signal)
      .then((usuario) => {
        if (!activo) return;
        // refresco el usuario por si cambió de rol
        guardarUsuario(usuario);
        setEstado((previo) => ({ ...previo, usuario, cargando: false }));
      })
      .catch((error: unknown) => {
        if (!activo || esAbortError(error)) return;
        // solo cierro sesión si el servidor rechaza el token, si falla la red no echo al usuario
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
    // solo al montar porque es el token guardado el que hay que validar
  }, []);

  // escucho este evento para vaciar la sesión cuando la api detecta un 401
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

  // uso useMemo para no renderizar de más si nada cambió
  const valor = useMemo<ValorAuth>(() => {
    const { usuario, token, cargando } = estado;
    const esAdmin = usuario?.rol === "admin";
    return {
      usuario,
      token,
      cargando,
      estaAutenticado: Boolean(usuario && token),
      esAdmin,
      // acepto id u objeto porque el autor llega de las dos formas según el endpoint
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
  // prefiero que falle claro si se usa fuera del Provider
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return contexto;
}
