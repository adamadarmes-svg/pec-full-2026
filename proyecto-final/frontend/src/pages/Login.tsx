import { Navigate, useLocation } from "react-router-dom";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { useAuth } from "@/context/AuthContext";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { rutaDeOrigen } from "@/utils/navegacion";

export default function Login() {
  useTituloPagina("entrar");
  const { estaAutenticado } = useAuth();
  const ubicacion = useLocation();

  // con sesión no tiene sentido el formulario, así que redirijo
  if (estaAutenticado) return <Navigate to={rutaDeOrigen(ubicacion.state)} replace />;

  return <FormularioAuth modo="login" />;
}
