import { useState } from "react";
import FieldSelect from "./FieldSelect";
import { btnGhost, btnPrimario, campoInput } from "../ui";

const TIPOS_PLANETA = ["Desconocido", "Terrestre", "Supertierra", "Tipo-Neptuno", "Gigante gaseoso"];
const METODOS_DESCUBRIMIENTO = [
  "Tránsito",
  "Velocidad radial",
  "Imagen directa",
  "Microlente",
  "Astrometría",
  "Otro",
];

const ESTADO_INICIAL = {
  nombre: "",
  estrellaAnfitriona: "",
  tipoEspectral: "",
  tipoPlaneta: "Desconocido",
  masa: "",
  radio: "",
  periodoOrbital: "",
  temperaturaEquilibrio: "",
  distancia: "",
  metodoDescubrimiento: "",
  anioDescubrimiento: "",
  zonaHabitable: false,
  confirmado: false,
  descripcion: "",
};

function aFormulario(datos) {
  return {
    ...ESTADO_INICIAL,
    ...datos,
    masa: datos.masa ?? "",
    radio: datos.radio ?? "",
    periodoOrbital: datos.periodoOrbital ?? "",
    temperaturaEquilibrio: datos.temperaturaEquilibrio ?? "",
    distancia: datos.distancia ?? "",
    anioDescubrimiento: datos.anioDescubrimiento ?? "",
  };
}

function aPeticion(form) {
  const numero = (v) => (v === "" ? undefined : Number(v));
  return {
    nombre: form.nombre.trim(),
    estrellaAnfitriona: form.estrellaAnfitriona.trim(),
    tipoEspectral: form.tipoEspectral.trim() || undefined,
    tipoPlaneta: form.tipoPlaneta,
    masa: numero(form.masa),
    radio: numero(form.radio),
    periodoOrbital: numero(form.periodoOrbital),
    temperaturaEquilibrio: numero(form.temperaturaEquilibrio),
    distancia: numero(form.distancia),
    metodoDescubrimiento: form.metodoDescubrimiento || undefined,
    anioDescubrimiento: numero(form.anioDescubrimiento),
    zonaHabitable: form.zonaHabitable,
    confirmado: form.confirmado,
    descripcion: form.descripcion.trim() || undefined,
  };
}

function Campo({ etiqueta, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-wider text-ink-faint">{etiqueta}</span>
      {children}
    </label>
  );
}

function ExoplanetForm({ initialData, submitLabel = "Registrar exoplaneta", enviando, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => aFormulario(initialData || ESTADO_INICIAL));
  const [errorLocal, setErrorLocal] = useState(null);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorLocal(null);
    try {
      await onSubmit(aPeticion(form));
      if (!initialData) setForm(ESTADO_INICIAL);
    } catch (err) {
      setErrorLocal(err.message);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Nombre *">
          <input
            type="text"
            className={campoInput}
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="Kepler-452 b"
            required
          />
        </Campo>

        <Campo etiqueta="Estrella anfitriona *">
          <input
            type="text"
            className={campoInput}
            value={form.estrellaAnfitriona}
            onChange={(e) => actualizar("estrellaAnfitriona", e.target.value)}
            placeholder="Kepler-452"
            required
          />
        </Campo>

        <Campo etiqueta="Tipo espectral">
          <input
            type="text"
            className={campoInput}
            value={form.tipoEspectral}
            onChange={(e) => actualizar("tipoEspectral", e.target.value)}
            placeholder="G2"
          />
        </Campo>

        <Campo etiqueta="Tipo de planeta">
          <FieldSelect
            value={form.tipoPlaneta}
            onChange={(valor) => actualizar("tipoPlaneta", valor)}
            options={TIPOS_PLANETA.map((tipo) => ({ value: tipo, label: tipo }))}
          />
        </Campo>

        <Campo etiqueta="Masa (M⊕)">
          <input
            type="number"
            step="0.01"
            min="0"
            className={campoInput}
            value={form.masa}
            onChange={(e) => actualizar("masa", e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Radio (R⊕)">
          <input
            type="number"
            step="0.01"
            min="0"
            className={campoInput}
            value={form.radio}
            onChange={(e) => actualizar("radio", e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Periodo orbital (días)">
          <input
            type="number"
            step="0.01"
            min="0"
            className={campoInput}
            value={form.periodoOrbital}
            onChange={(e) => actualizar("periodoOrbital", e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Temperatura de equilibrio (K)">
          <input
            type="number"
            step="1"
            min="0"
            className={campoInput}
            value={form.temperaturaEquilibrio}
            onChange={(e) => actualizar("temperaturaEquilibrio", e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Distancia (años luz)">
          <input
            type="number"
            step="0.01"
            min="0"
            className={campoInput}
            value={form.distancia}
            onChange={(e) => actualizar("distancia", e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Método de descubrimiento">
          <FieldSelect
            value={form.metodoDescubrimiento}
            onChange={(valor) => actualizar("metodoDescubrimiento", valor)}
            options={[
              { value: "", label: "Sin especificar" },
              ...METODOS_DESCUBRIMIENTO.map((metodo) => ({ value: metodo, label: metodo })),
            ]}
          />
        </Campo>

        <Campo etiqueta="Año de descubrimiento">
          <input
            type="number"
            step="1"
            min="1988"
            className={campoInput}
            value={form.anioDescubrimiento}
            onChange={(e) => actualizar("anioDescubrimiento", e.target.value)}
          />
        </Campo>
      </div>

      <Campo etiqueta="Descripción">
        <textarea
          rows={2}
          className={campoInput}
          value={form.descripcion}
          onChange={(e) => actualizar("descripcion", e.target.value)}
          placeholder="Notas sobre el hallazgo..."
        />
      </Campo>

      <div className="flex flex-wrap gap-6 border-t border-border pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-xs uppercase tracking-wide text-ink-dim">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-accent"
            checked={form.zonaHabitable}
            onChange={(e) => actualizar("zonaHabitable", e.target.checked)}
          />
          En zona habitable
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs uppercase tracking-wide text-ink-dim">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-accent"
            checked={form.confirmado}
            onChange={(e) => actualizar("confirmado", e.target.checked)}
          />
          Confirmado
        </label>
      </div>

      {errorLocal && (
        <p className="border border-peligro/30 bg-peligro-dim px-3.5 py-2.5 text-sm text-peligro">
          {errorLocal}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button type="button" className={btnGhost} onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className={btnPrimario} disabled={enviando}>
          {enviando ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ExoplanetForm;