import { Link, NavLink, useNavigate } from "react-router-dom";
import { Boton } from "@/components/ui/Boton";
import { Logo } from "@/components/ui/Logo";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

function claseEnlace({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "text-tinta underline decoration-acento underline-offset-[0.4em]"
    : "text-tinta-tenue hover:text-tinta";
}

export function Cabecera() {
  const { usuario, estaAutenticado, esAdmin, cerrarSesion } = useAuth();
  const notificar = useNotification();
  const navegar = useNavigate();

  const salir = () => {
    cerrarSesion();
    notificar(MENSAJES.SESION_CERRADA);
    navegar(RUTAS.INICIO);
  };

  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4 py-8 md:py-10">
      <Link to={RUTAS.INICIO} aria-label="exoarchive, ir al catálogo">
        <Logo />
      </Link>

      <nav aria-label="principal" className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-apoyo">
        <NavLink to={RUTAS.INICIO} end className={claseEnlace}>
          catálogo
        </NavLink>
        {estaAutenticado && (
          <>
            <NavLink to={RUTAS.MIS_REGISTROS} className={claseEnlace}>
              mis registros
            </NavLink>
            <NavLink to={RUTAS.NUEVO} className={claseEnlace}>
              registrar exoplaneta
            </NavLink>
          </>
        )}
        {esAdmin && (
          <NavLink to={RUTAS.PANEL_ADMIN} className={claseEnlace}>
            moderación
          </NavLink>
        )}
      </nav>

      <div className="flex items-baseline gap-x-6 text-apoyo">
        {estaAutenticado && usuario ? (
          <>
            <span className="text-tinta-tenue">{usuario.nombre}</span>
            <Boton onClick={salir}>salir</Boton>
          </>
        ) : (
          <>
            <NavLink to={RUTAS.LOGIN} className={claseEnlace}>
              entrar
            </NavLink>
            <NavLink to={RUTAS.REGISTRO} className={claseEnlace}>
              crear cuenta
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
