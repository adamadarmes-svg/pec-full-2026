import { Outlet } from "react-router-dom";
import { Cabecera } from "@/components/layout/Cabecera";

// puse un ancho amplio para que el esquema tenga recorrido
export function Diseno() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 md:px-10">
      {/* puse este enlace para saltar la navegación con teclado */}
      <a
        href="#contenido"
        className="absolute left-5 top-2 -translate-y-20 text-apoyo text-tinta focus-visible:translate-y-0"
      >
        saltar al contenido
      </a>
      <Cabecera />
      <main id="contenido" className="flex-1 pb-12">
        <Outlet />
      </main>
      <footer className="pb-10 pt-6 text-apoyo text-tinta-apagada">
        catálogo de exoplanetas con su fuente bibliográfica
      </footer>
    </div>
  );
}
