import { type ReactNode, useCallback } from "react";
import { CatalogoExoplanetas } from "@/components/exoplanetas/CatalogoExoplanetas";
import { FiltrosExoplanetas } from "@/components/exoplanetas/FiltrosExoplanetas";
import { Paginacion } from "@/components/exoplanetas/Paginacion";
import { Alerta } from "@/components/ui/Alerta";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { MENSAJES } from "@/const/config";
import { useNotification } from "@/context/NotificationContext";
import type { useExoplanetas } from "@/hooks/useExoplanetas";
import { mensajeDeError } from "@/services/api";
import { eliminar } from "@/services/exoplanetaService";

type PropsVistaCatalogo = ReturnType<typeof useExoplanetas> & {
  titulo: string;
  // solo se ve sin registros ni filtros, con filtros sale otro mensaje
  vacio: ReactNode;
};

// lo separé para que el catálogo y mis registros compartan la vista y el hook se quede en la página
export function VistaCatalogo({
  titulo,
  vacio,
  lista,
  paginacion,
  cargando,
  error,
  filtros,
  hayFiltros,
  cambiarFiltro,
  cambiarPagina,
  limpiarFiltros,
  recargar,
  quitarLocal,
}: PropsVistaCatalogo) {
  const notificar = useNotification();

  // lo quito de la lista sin recargar para que sea más rápido
  const eliminarExoplaneta = useCallback(
    async (id: string) => {
      try {
        await eliminar(id);
        quitarLocal(id);
        notificar(MENSAJES.ELIMINADO);
      } catch (errorEliminar) {
        notificar(mensajeDeError(errorEliminar), "error");
      }
    },
    [quitarLocal, notificar]
  );

  // subo arriba al cambiar de página porque ahí empieza la nueva
  const irAPagina = (pagina: number) => {
    cambiarPagina(pagina);
    window.scrollTo({ top: 0 });
  };

  const cargaInicial = cargando && lista.length === 0;

  return (
    // dejé más aire arriba para que el título se lea como parte del catálogo y no de la cabecera
    <section aria-labelledby="titulo-catalogo" className="pt-10 md:pt-16">
      <h1 id="titulo-catalogo" className="font-serif text-titulo text-tinta">
        {titulo}
      </h1>

      <div className="mt-8 md:mt-10">
        <FiltrosExoplanetas filtros={filtros} hayFiltros={hayFiltros} onCambiar={cambiarFiltro} onLimpiar={limpiarFiltros} />
      </div>

      {/* puse la leyenda para que quien ve tenga lo mismo que quien usa lector de pantalla */}
      <p className="mt-8 text-apoyo text-tinta-apagada">
        la posición en la órbita indica el periodo orbital, el tamaño el radio, el color la temperatura de equilibrio
        (violeta fría, rojo caliente) y el anillo la zona habitable.
      </p>

      <div className="mt-6 md:mt-8">
        {error ? (
          <Alerta variante="error">
            <p>{error}</p>
            <Boton onClick={recargar}>volver a intentarlo</Boton>
          </Alerta>
        ) : cargaInicial ? (
          <Cargando texto="cargando exoplanetas" />
        ) : lista.length === 0 ? (
          hayFiltros ? (
            <Alerta>
              <p>ninguno coincide con los filtros.</p>
              <Boton onClick={limpiarFiltros}>quitar filtros</Boton>
            </Alerta>
          ) : (
            vacio
          )
        ) : (
          // atenúo la lista anterior mientras carga para no dejar la pantalla vacía
          <div aria-busy={cargando} className={cargando ? "opacity-50" : undefined}>
            <CatalogoExoplanetas exoplanetas={lista} onEliminar={eliminarExoplaneta} />
            <Paginacion pagina={paginacion.pagina} totalPaginas={paginacion.totalPaginas} onCambiar={irAPagina} />
          </div>
        )}
      </div>
    </section>
  );
}
