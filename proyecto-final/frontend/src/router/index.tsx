import { type ComponentType, lazy, type LazyExoticComponent, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Diseno } from "@/components/layout/Diseno";
import { Cargando } from "@/components/ui/Cargando";
import { RUTAS } from "@/const/rutas";
import { RutaProtegida } from "@/router/RutaProtegida";

// cargo cada página bajo demanda para que el catálogo no descargue los formularios
const Catalogo = lazy(() => import("@/pages/Catalogo"));
const DetalleExoplaneta = lazy(() => import("@/pages/DetalleExoplaneta"));
const Login = lazy(() => import("@/pages/Login"));
const Registro = lazy(() => import("@/pages/Registro"));
const NuevoExoplaneta = lazy(() => import("@/pages/NuevoExoplaneta"));
const EditarExoplaneta = lazy(() => import("@/pages/EditarExoplaneta"));
const MisRegistros = lazy(() => import("@/pages/MisRegistros"));
const Moderacion = lazy(() => import("@/pages/Moderacion"));
const NoEncontrada = lazy(() => import("@/pages/NoEncontrada"));

// el mismo indicador para todas mientras llega su código
function cargarPagina(Pagina: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={<Cargando texto="cargando la página" />}>
      <Pagina />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <Diseno />,
    children: [
      { index: true, element: cargarPagina(Catalogo) },
      { path: RUTAS.DETALLE(":id"), element: cargarPagina(DetalleExoplaneta) },
      { path: RUTAS.LOGIN, element: cargarPagina(Login) },
      { path: RUTAS.REGISTRO, element: cargarPagina(Registro) },
      {
        element: <RutaProtegida />,
        children: [
          { path: RUTAS.NUEVO, element: cargarPagina(NuevoExoplaneta) },
          { path: RUTAS.EDITAR(":id"), element: cargarPagina(EditarExoplaneta) },
          { path: RUTAS.MIS_REGISTROS, element: cargarPagina(MisRegistros) },
        ],
      },
      // esta ruta además comprueba el rol
      {
        element: <RutaProtegida rol="admin" />,
        children: [{ path: RUTAS.PANEL_ADMIN, element: cargarPagina(Moderacion) }],
      },
      { path: "*", element: cargarPagina(NoEncontrada) },
    ],
  },
]);
