import { VistaCatalogo } from "@/components/exoplanetas/VistaCatalogo";
import { Alerta } from "@/components/ui/Alerta";
import { EnlaceBoton } from "@/components/ui/Boton";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useExoplanetas } from "@/hooks/useExoplanetas";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { pluralizar } from "@/utils/formato";

// siempre hay usuario porque va dentro de RutaProtegida
export default function MisRegistros() {
  useTituloPagina("mis registros");
  const { usuario } = useAuth();
  const catalogo = useExoplanetas({ creadoPor: usuario?._id });
  const { total } = catalogo.paginacion;

  const titulo =
    catalogo.cargando && catalogo.lista.length === 0
      ? "mis registros"
      : catalogo.hayFiltros
        ? pluralizar(total, "registro tuyo coincide", "registros tuyos coinciden")
        : pluralizar(total, "exoplaneta registrado por ti", "exoplanetas registrados por ti");

  const vacio = (
    <Alerta>
      <p>aún no has registrado ninguno.</p>
      <EnlaceBoton to={RUTAS.NUEVO} variante="primario">
        registrar exoplaneta
      </EnlaceBoton>
    </Alerta>
  );

  return <VistaCatalogo {...catalogo} titulo={titulo} vacio={vacio} />;
}
