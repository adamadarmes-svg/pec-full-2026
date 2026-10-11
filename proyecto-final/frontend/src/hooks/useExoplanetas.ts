import { useCallback, useEffect, useState } from "react";
import { POR_PAGINA } from "@/const/catalogo";
import { esAbortError, mensajeDeError } from "@/services/api";
import { listar } from "@/services/exoplanetaService";
import type { Exoplaneta, FiltrosExoplanetas, Paginacion } from "@/types";

// El estado va agrupado a propósito en un solo objeto: lista, paginación,
// carga y error cambian siempre a la vez tras cada petición. Con un useState
// por campo habría renders intermedios incoherentes (lista nueva con la
// paginación vieja) y más llamadas a set que coordinar.
interface EstadoExoplanetas {
  lista: Exoplaneta[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
}

const PAGINACION_INICIAL: Paginacion = { pagina: 1, limite: POR_PAGINA, total: 0, totalPaginas: 0 };

// Filtros que se pueden cambiar con cambiarFiltro. La página va aparte
// porque tiene su propia función.
type ClaveFiltro = Exclude<keyof FiltrosExoplanetas, "pagina">;

function calcularTotalPaginas(total: number, limite: number): number {
  return Math.ceil(total / limite);
}

export function useExoplanetas(filtrosIniciales: FiltrosExoplanetas = {}) {
  const [estado, setEstado] = useState<EstadoExoplanetas>({
    lista: [],
    paginacion: PAGINACION_INICIAL,
    cargando: true,
    error: null,
  });

  // Los filtros van en otro useState porque son de otra naturaleza: los
  // decide el usuario, mientras que el estado anterior lo decide la API
  const [filtros, setFiltros] = useState<FiltrosExoplanetas>({
    pagina: 1,
    limite: POR_PAGINA,
    ...filtrosIniciales,
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    listar(filtros, controlador.signal)
      .then(({ exoplanetas, paginacion }) => {
        if (controlador.signal.aborted) return;
        setEstado((previo) => ({ ...previo, lista: exoplanetas, paginacion, cargando: false, error: null }));
      })
      .catch((error: unknown) => {
        if (esAbortError(error) || controlador.signal.aborted) return;
        setEstado((previo) => ({ ...previo, cargando: false, error: mensajeDeError(error) }));
      });

    // Si el usuario cambia de filtro antes de que llegue la respuesta, la
    // petición anterior se cancela y no puede pisar la nueva
    return () => controlador.abort();
  }, [filtros, version]);

  // Un filtro nuevo vuelve a la primera página: la actual podría no existir
  const cambiarFiltro = useCallback(<K extends ClaveFiltro>(clave: K, valor: FiltrosExoplanetas[K]) => {
    setFiltros((previos) => ({ ...previos, [clave]: valor, pagina: 1 }));
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((previos) => ({ ...previos, pagina }));
  }, []);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  // Actualizaciones locales tras crear, editar o borrar, para reflejar el
  // cambio al momento sin volver a pedir la página entera. Son aproximadas
  // (un registro nuevo puede no cumplir los filtros activos); recargar() da
  // el dato exacto.
  const agregarLocal = useCallback((exoplaneta: Exoplaneta) => {
    setEstado((previo) => {
      const total = previo.paginacion.total + 1;
      return {
        ...previo,
        lista: [exoplaneta, ...previo.lista],
        paginacion: {
          ...previo.paginacion,
          total,
          totalPaginas: calcularTotalPaginas(total, previo.paginacion.limite),
        },
      };
    });
  }, []);

  const reemplazarLocal = useCallback((exoplaneta: Exoplaneta) => {
    setEstado((previo) => ({
      ...previo,
      lista: previo.lista.map((actual) => (actual._id === exoplaneta._id ? exoplaneta : actual)),
    }));
  }, []);

  const quitarLocal = useCallback((id: string) => {
    setEstado((previo) => {
      const total = Math.max(previo.paginacion.total - 1, 0);
      return {
        ...previo,
        lista: previo.lista.filter((actual) => actual._id !== id),
        paginacion: {
          ...previo.paginacion,
          total,
          totalPaginas: calcularTotalPaginas(total, previo.paginacion.limite),
        },
      };
    });
  }, []);

  return {
    ...estado,
    filtros,
    cambiarFiltro,
    cambiarPagina,
    recargar,
    agregarLocal,
    reemplazarLocal,
    quitarLocal,
  };
}
