import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExoplanet } from "@/services/api";
import ExoplanetCard from "@/components/ExoplanetCard";
import { panelBase } from "@/ui";

function ExoplanetDetailPage() {
  const { id } = useParams();

  const [exoplaneta, setExoplaneta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getExoplanet(id)
      .then((data) => {
        if (!cancelado) setExoplaneta(data);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-24">
      <Link
        to="/"
        className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent/80 hover:text-accent-strong"
      >
        ← Volver al listado
      </Link>

      <div className="mt-8">
        {cargando && (
          <div className="frame border border-border px-6 py-16 text-center">
            <p className="font-serif text-base text-ink">Cargando exoplaneta…</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-faint">
              Sincronizando catálogo
            </p>
          </div>
        )}

        {!cargando && error && (
          <div className="frame border border-peligro/30 px-6 py-16 text-center">
            <p className="font-serif text-base text-peligro">No se pudo cargar el exoplaneta.</p>
            <p className="mt-2 text-sm text-ink-dim">{error}</p>
          </div>
        )}

        {!cargando && !error && exoplaneta && (
          <>
            <ExoplanetCard {...exoplaneta} />

            <section className={`${panelBase} mt-6`}>
              <h2 className="mb-4 font-serif text-lg font-medium text-ink">Fuente de la publicación</h2>

              {exoplaneta.fuentePrincipal ? (
                <div>
                  <p className="font-serif text-base text-ink">{exoplaneta.fuentePrincipal.titulo}</p>
                  <p className="mt-1 text-sm text-ink-dim">{exoplaneta.fuentePrincipal.autores}</p>
                  {(exoplaneta.fuentePrincipal.publicacion || exoplaneta.fuentePrincipal.anio) && (
                    <p className="mt-1 text-sm text-ink-dim">
                      {exoplaneta.fuentePrincipal.publicacion}
                      {exoplaneta.fuentePrincipal.anio ? `, ${exoplaneta.fuentePrincipal.anio}` : ""}
                    </p>
                  )}
                  {(exoplaneta.fuentePrincipal.doi || exoplaneta.fuentePrincipal.url) && (
                    <a
                      href={
                        exoplaneta.fuentePrincipal.doi
                          ? `https://doi.org/${exoplaneta.fuentePrincipal.doi}`
                          : exoplaneta.fuentePrincipal.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-accent hover:text-accent-strong"
                    >
                      Ver publicación original ↗
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink-faint">
                  Este registro no tiene una fuente bibliográfica asociada.
                </p>
              )}

              {exoplaneta.creadoPor && (
                <p className="mt-4 border-t border-border pt-4 text-xs uppercase tracking-wide text-ink-faint">
                  Registrado por {exoplaneta.creadoPor.nombre}
                  {exoplaneta.creadoPor.institucion ? ` · ${exoplaneta.creadoPor.institucion}` : ""}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ExoplanetDetailPage;
