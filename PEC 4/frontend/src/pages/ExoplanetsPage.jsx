import { useEffect, useState } from "react";
import {
  getExoplanets,
  createExoplanet,
  updateExoplanet,
  deleteExoplanet,
} from "../services/api";
import ExoplanetList from "../components/ExoplanetList";
import ExoplanetForm from "../components/ExoplanetForm";
import FieldSelect from "../components/FieldSelect";
import { btnPrimario, panelBase } from "../ui";

function ExoplanetsPage() {
  const [exoplanetas, setExoplanetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getExoplanets({ buscar: busqueda, tipoPlaneta: filtroTipo })
      .then((data) => {
        if (!cancelado) setExoplanetas(data);
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
  }, [busqueda, filtroTipo]);

  async function handleCreate(datos) {
    setEnviando(true);
    try {
      const nuevo = await createExoplanet(datos);
      setExoplanetas((prev) => [nuevo, ...prev]);
      setMostrarFormulario(false);
    } finally {
      setEnviando(false);
    }
  }

  async function handleUpdate(id, datos) {
    setEnviando(true);
    try {
      const actualizado = await updateExoplanet(id, datos);
      setExoplanetas((prev) => prev.map((e) => (e._id === id ? actualizado : e)));
      setEditandoId(null);
    } finally {
      setEnviando(false);
    }
  }

  async function handleDelete(exoplaneta) {
    const confirmado = window.confirm(`¿Eliminar "${exoplaneta.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
      await deleteExoplanet(exoplaneta._id);
      setExoplanetas((prev) => prev.filter((e) => e._id !== exoplaneta._id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24">
      <header className="relative mb-12 flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-accent/60 via-border to-transparent" />
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent/80">
            Catálogo orbital
          </span>
          <h1 className="mt-3 font-serif text-3xl font-medium tracking-wide text-ink sm:text-4xl">
            EXO — ARCHIVE
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
            Registro de exoplanetas confirmados y candidatos, con sus fuentes de investigación.
          </p>
        </div>
        <button type="button" className={btnPrimario} onClick={() => setMostrarFormulario((v) => !v)}>
          {mostrarFormulario ? "Cerrar formulario" : "Registrar exoplaneta"}
        </button>
      </header>

      {mostrarFormulario && (
        <section className={`${panelBase} mb-8`}>
          <h2 className="mb-5 font-serif text-lg font-medium text-ink">Nuevo exoplaneta</h2>
          <ExoplanetForm onSubmit={handleCreate} enviando={enviando} />
        </section>
      )}

      <section className="mb-8 flex flex-col border border-border bg-surface sm:flex-row sm:divide-x sm:divide-border">
        <input
          type="search"
          className="flex-1 border-0 bg-transparent px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors focus:bg-surface-strong"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <FieldSelect
          variant="bare"
          className="sm:w-56"
          value={filtroTipo}
          onChange={setFiltroTipo}
          options={[
            { value: "", label: "Todos los tipos" },
            { value: "Terrestre", label: "Terrestre" },
            { value: "Supertierra", label: "Supertierra" },
            { value: "Tipo-Neptuno", label: "Tipo-Neptuno" },
            { value: "Gigante gaseoso", label: "Gigante gaseoso" },
            { value: "Desconocido", label: "Desconocido" },
          ]}
        />
      </section>

      <main>
        {cargando && (
          <div className="frame border border-border px-6 py-16 text-center">
            <p className="font-serif text-base text-ink">Cargando exoplanetas…</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-faint">
              Sincronizando catálogo
            </p>
          </div>
        )}

        {!cargando && error && (
          <div className="frame border border-peligro/30 px-6 py-16 text-center">
            <p className="font-serif text-base text-peligro">No se pudieron cargar los exoplanetas.</p>
            <p className="mt-2 text-sm text-ink-dim">{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <ExoplanetList
            exoplanetas={exoplanetas}
            editandoId={editandoId}
            enviando={enviando}
            onEdit={(exoplaneta) => setEditandoId(exoplaneta._id)}
            onCancelEdit={() => setEditandoId(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default ExoplanetsPage;