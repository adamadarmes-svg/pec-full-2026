import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExoplanet } from "@/services/api";
import ExoplanetCard from "@/components/ExoplanetCard";

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

        {!cargando && !error && exoplaneta && <ExoplanetCard {...exoplaneta} />}
      </div>
    </div>
  );
}

export default ExoplanetDetailPage;
