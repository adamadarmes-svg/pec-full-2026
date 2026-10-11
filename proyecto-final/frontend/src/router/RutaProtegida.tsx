import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Cargando } from "@/components/ui/Cargando";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import type { RolUsuario } from "@/types";
import type { EstadoRedireccion } from "@/utils/navegacion";

interface PropsRutaProtegida {
  rol?: RolUsuario;
}

// sesión y rol en el mismo componente porque comparten la espera de la sesión
export function RutaProtegida({ rol }: PropsRutaProtegida) {
  const { cargando, estaAutenticado, usuario } = useAuth();
  const notificar = useNotification();
  const ubicacion = useLocation();
  const sinPermiso = !cargando && estaAutenticado && rol !== undefined && usuario?.rol !== rol;

  // aviso en un efecto porque hacerlo durante el render da error
  useEffect(() => {
    if (sinPermiso) notificar(MENSAJES.SOLO_ADMIN, "error");
  }, [sinPermiso, notificar]);

  // espero a validar el token para no mandar al login a quien sí tiene sesión
  if (cargando) return <Cargando texto="comprobando la sesión" />;

  if (!estaAutenticado) {
    // guardo a dónde quería ir para volver después de entrar
    const estado: EstadoRedireccion = { desde: ubicacion.pathname + ubicacion.search };
    return <Navigate to={RUTAS.LOGIN} replace state={estado} />;
  }

  if (sinPermiso) return <Navigate to={RUTAS.INICIO} replace />;

  return <Outlet />;
}
