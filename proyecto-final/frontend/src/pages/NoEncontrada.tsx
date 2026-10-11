import { EnlaceBoton } from "@/components/ui/Boton";
import { RUTAS } from "@/const/rutas";
import { useTituloPagina } from "@/hooks/useTituloPagina";

export default function NoEncontrada() {
  useTituloPagina("página no encontrada");

  return (
    <section className="pt-12">
      <h1 className="font-serif text-titulo text-tinta">esta página no existe</h1>
      <p className="mt-8 max-w-[62ch] text-destacado text-tinta-tenue">
        revisa el enlace.
      </p>
      <div className="mt-10">
        <EnlaceBoton to={RUTAS.INICIO} variante="primario">
          ir al catálogo
        </EnlaceBoton>
      </div>
    </section>
  );
}
