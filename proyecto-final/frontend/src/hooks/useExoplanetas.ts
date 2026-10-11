import { useCallback, useEffect, useRef, useState } from "react";
import { POR_PAGINA } from "@/const/catalogo";
import { esAbortError, mensajeDeError } from "@/services/api";
import { listar } from "@/services/exoplanetaService";
import type { Exoplaneta, FiltrosExoplanetas, Paginacion } from "@/types";

// agrupé el estado porque lista, paginación, carga y error cambian a la vez y así no hay renders a medias
interface EstadoExoplanetas {
  lista: Exoplaneta[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
}

const PAGINACION_INICIAL: Paginacion = { pagina: 1, limite: POR_PAGINA, total: 0, totalPaginas: 0 };

// la página va aparte porque tiene su propia función
export type ClaveFiltro = Exclude<keyof FiltrosExoplanetas, "pagina">;

// creadoPor y limite no cuentan como filtros porque los fija la página
const FILTROS_DE_USUARIO: ClaveFiltro[] = [
  "buscar",
  "tipoPlaneta",
  "tipos",
  "metodoDescubrimiento",
  "zonaHabitable",
  "confirmado",
  "anioDesde",
  "anioHasta",
  "distanciaMax",
];

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

  // los filtros van aparte porque los decide el usuario y los guardo en una ref para poder volver a ellos
  const inicialesRef = useRef<FiltrosExoplanetas>({ pagina: 1, limite: POR_PAGINA, ...filtrosIniciales });
  const [filtros, setFiltros] = useState<FiltrosExoplanetas>(inicialesRef.current);

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

    // cancelo la petición anterior para que no pise la nueva
    return () => controlador.abort();
  }, [filtros, version]);

  // vuelvo a la primera página porque la actual podría no existir
  const cambiarFiltro = useCallback(<K extends ClaveFiltro>(clave: K, valor: FiltrosExoplanetas[K]) => {
    setFiltros((previos) => ({ ...previos, [clave]: valor, pagina: 1 }));
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((previos) => ({ ...previos, pagina }));
  }, []);

  // vuelvo a los filtros iniciales sin perder los fijos como creadoPor
  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...inicialesRef.current });
  }, []);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const hayFiltros = FILTROS_DE_USUARIO.some((clave) => {
    const valor = filtros[clave];
    return Array.isArray(valor) ? valor.length > 0 : valor !== undefined && valor !== "";
  });

  // actualizo en local para no pedir otra vez la página entera
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
    hayFiltros,
    cambiarFiltro,
    limpiarFiltros,
    cambiarPagina,
    recargar,
    agregarLocal,
    reemplazarLocal,
    quitarLocal,
  };
}
