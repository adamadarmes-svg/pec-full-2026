import { VistaCatalogo } from "@/components/exoplanetas/VistaCatalogo";
import { Alerta } from "@/components/ui/Alerta";
import { EnlaceBoton } from "@/components/ui/Boton";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useExoplanetas } from "@/hooks/useExoplanetas";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { pluralizar } from "@/utils/formato";

// sin portada de marketing, se entra directo a los datos
export default function Catalogo() {
  useTituloPagina("catálogo");
  const catalogo = useExoplanetas();
  const { estaAutenticado } = useAuth();
  const { total } = catalogo.paginacion;

  // no enseño un 0 mientras carga porque sería falso
  const titulo =
    catalogo.cargando && catalogo.lista.length === 0
      ? "catálogo de exoplanetas"
      : catalogo.hayFiltros
        ? pluralizar(total, "exoplaneta coincide", "exoplanetas coinciden")
        : pluralizar(total, "exoplaneta registrado", "exoplanetas registrados");

  const vacio = (
    <Alerta>
      <p>aún no hay exoplanetas.</p>
      {estaAutenticado ? (
        <EnlaceBoton to={RUTAS.NUEVO} variante="primario">
          registrar el primero
        </EnlaceBoton>
      ) : (
        <EnlaceBoton to={RUTAS.LOGIN} variante="primario">
          entra para registrar el primero
        </EnlaceBoton>
      )}
    </Alerta>
  );

  return <VistaCatalogo {...catalogo} titulo={titulo} vacio={vacio} />;
}
