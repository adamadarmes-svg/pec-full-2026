import { useNavigate } from "react-router-dom";
import { FormularioExoplaneta } from "@/components/exoplanetas/FormularioExoplaneta";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useNotification } from "@/context/NotificationContext";
import { useTituloPagina } from "@/hooks/useTituloPagina";
import { crear } from "@/services/exoplanetaService";
import type { DatosExoplaneta } from "@/types";

export default function NuevoExoplaneta() {
  useTituloPagina("registrar exoplaneta");
  const notificar = useNotification();
  const navegar = useNavigate();

  // voy al detalle porque la respuesta de crear no trae populate
  const enviar = async (datos: DatosExoplaneta) => {
    const nuevo = await crear(datos);
    notificar(MENSAJES.CREADO);
    navegar(RUTAS.DETALLE(nuevo._id));
  };

  return (
    <section>
      <h1 className="font-serif text-titulo text-tinta">registrar exoplaneta</h1>
      <div className="mt-16">
        <FormularioExoplaneta
          textoEnviar="registrar exoplaneta"
          textoEnviando="registrando"
          rutaCancelar={RUTAS.INICIO}
          onEnviar={enviar}
        />
      </div>
    </section>
  );
}
