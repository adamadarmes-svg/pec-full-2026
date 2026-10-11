import { Navigate, useLocation } from "react-router-dom";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { useAuth } from "@/context/AuthContext";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { rutaDeOrigen } from "@/utils/navegacion";

export default function Registro() {
  useTituloPagina("crear cuenta");
  const { estaAutenticado } = useAuth();
  const ubicacion = useLocation();

  // igual que en Login, con sesión no enseño el formulario
  if (estaAutenticado) return <Navigate to={rutaDeOrigen(ubicacion.state)} replace />;

  return <FormularioAuth modo="registro" />;
}
