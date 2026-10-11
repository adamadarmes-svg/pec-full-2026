import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { Campo, CampoTexto } from "@/components/ui/Campo";
import { Casilla } from "@/components/ui/Casilla";
import { Selector } from "@/components/ui/Selector";
import { LIMITES, OPCIONES_METODO_DESCUBRIMIENTO, OPCIONES_TIPO_PLANETA } from "@/const/catalogo";
import { MENSAJES } from "@/const/config";
import { useFetch } from "@/hooks/useFetch";
import { type ErroresFormulario, useFormulario } from "@/hooks/useFormulario";
import { mensajeDeError } from "@/services/api";
import { listar as listarFuentes } from "@/services/fuenteService";
import {
  type CambiosExoplaneta,
  type DatosExoplaneta,
  type Exoplaneta,
  idDe,
  type MetodoDescubrimiento,
  type Opcion,
  type TipoPlaneta,
} from "@/types";

// uso "" en vez de undefined porque los inputs controlados no aceptan undefined
interface ValoresExoplaneta {
  nombre: string;
  estrellaAnfitriona: string;
  tipoEspectral: string;
  tipoPlaneta: TipoPlaneta;
  metodoDescubrimiento: MetodoDescubrimiento | "";
  anioDescubrimiento?: number;
  masa?: number;
  radio?: number;
  periodoOrbital?: number;
  temperaturaEquilibrio?: number;
  distancia?: number;
  zonaHabitable: boolean;
  confirmado: boolean;
  descripcion: string;
  fuentePrincipal: string;
}

interface PropsComunes {
  textoEnviar: string;
  textoEnviando: string;
  rutaCancelar: string;
}

// separé crear y editar en la unión para que cada página reciba el tipo correcto
type PropsFormularioExoplaneta = PropsComunes &
  (
    | { inicial?: undefined; onEnviar: (datos: DatosExoplaneta) => Promise<void> }
    | { inicial: Exoplaneta; onEnviar: (cambios: CambiosExoplaneta) => Promise<void> }
  );

const ANIO_MAXIMO = new Date().getFullYear() + 1;

function aValores(exoplaneta?: Exoplaneta): ValoresExoplaneta {
  return {
    nombre: exoplaneta?.nombre ?? "",
    estrellaAnfitriona: exoplaneta?.estrellaAnfitriona ?? "",
    tipoEspectral: exoplaneta?.tipoEspectral ?? "",
    tipoPlaneta: exoplaneta?.tipoPlaneta ?? "Desconocido",
    metodoDescubrimiento: exoplaneta?.metodoDescubrimiento ?? "",
    anioDescubrimiento: exoplaneta?.anioDescubrimiento,
    masa: exoplaneta?.masa,
    radio: exoplaneta?.radio,
    periodoOrbital: exoplaneta?.periodoOrbital,
    temperaturaEquilibrio: exoplaneta?.temperaturaEquilibrio,
    distancia: exoplaneta?.distancia,
    zonaHabitable: exoplaneta?.zonaHabitable ?? false,
    confirmado: exoplaneta?.confirmado ?? false,
    descripcion: exoplaneta?.descripcion ?? "",
    fuentePrincipal: idDe(exoplaneta?.fuentePrincipal) ?? "",
  };
}

// al crear no envío los vacíos porque no hay nada que borrar
function aDatos(valores: ValoresExoplaneta): DatosExoplaneta {
  const textoOpcional = (texto: string) => texto.trim() || undefined;
  return {
    nombre: valores.nombre.trim(),
    estrellaAnfitriona: valores.estrellaAnfitriona.trim(),
    tipoEspectral: textoOpcional(valores.tipoEspectral),
    tipoPlaneta: valores.tipoPlaneta,
    metodoDescubrimiento: valores.metodoDescubrimiento || undefined,
    anioDescubrimiento: valores.anioDescubrimiento,
    masa: valores.masa,
    radio: valores.radio,
    periodoOrbital: valores.periodoOrbital,
    temperaturaEquilibrio: valores.temperaturaEquilibrio,
    distancia: valores.distancia,
    zonaHabitable: valores.zonaHabitable,
    confirmado: valores.confirmado,
    descripcion: textoOpcional(valores.descripcion),
    fuentePrincipal: valores.fuentePrincipal || undefined,
  };
}

// al editar mando null en los vacíos porque es la única forma de borrar un dato mal puesto
function aCambios(valores: ValoresExoplaneta): CambiosExoplaneta {
  const datos = aDatos(valores);
  return {
    ...datos,
    tipoEspectral: datos.tipoEspectral ?? null,
    metodoDescubrimiento: datos.metodoDescubrimiento ?? null,
    anioDescubrimiento: datos.anioDescubrimiento ?? null,
    masa: datos.masa ?? null,
    radio: datos.radio ?? null,
    periodoOrbital: datos.periodoOrbital ?? null,
    temperaturaEquilibrio: datos.temperaturaEquilibrio ?? null,
    distancia: datos.distancia ?? null,
    descripcion: datos.descripcion ?? null,
    fuentePrincipal: datos.fuentePrincipal ?? null,
  };
}

// copié las reglas del backend para avisar antes de enviar
function validar(valores: ValoresExoplaneta): ErroresFormulario<ValoresExoplaneta> {
  const errores: ErroresFormulario<ValoresExoplaneta> = {};
  if (!valores.nombre.trim()) errores.nombre = "falta el nombre.";
  if (!valores.estrellaAnfitriona.trim()) errores.estrellaAnfitriona = "falta la estrella anfitriona.";

  const negativos = ["masa", "radio", "periodoOrbital", "temperaturaEquilibrio", "distancia"] as const;
  for (const campo of negativos) {
    const valor = valores[campo];
    if (valor !== undefined && valor < 0) errores[campo] = "no puede ser negativo.";
  }

  const anio = valores.anioDescubrimiento;
  if (anio !== undefined && (anio < LIMITES.ANIO_MIN_DESCUBRIMIENTO || anio > ANIO_MAXIMO)) {
    errores.anioDescubrimiento = `debe estar entre ${LIMITES.ANIO_MIN_DESCUBRIMIENTO} y ${ANIO_MAXIMO}.`;
  }
  return errores;
}

export function FormularioExoplaneta(props: PropsFormularioExoplaneta) {
  // no deconstruyo props porque así typescript sabe qué onEnviar toca
  const { textoEnviar, textoEnviando, rutaCancelar } = props;
  const { valores, errores, manejarCambio, validar: validarFormulario } = useFormulario(aValores(props.inicial), validar);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const { datos: fuentes } = useFetch((signal) => listarFuentes(signal), []);
  const opcionesFuente: Opcion[] = (fuentes ?? []).map(({ _id, titulo, anio }) => ({
    value: _id,
    label: anio ? `${titulo} (${anio})` : titulo,
  }));

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorEnvio(null);
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      // la navegación la decide cada página
      if (props.inicial) {
        await props.onEnviar(aCambios(valores));
      } else {
        await props.onEnviar(aDatos(valores));
      }
    } catch (error) {
      setErrorEnvio(mensajeDeError(error));
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="grid max-w-3xl gap-y-16">
      <fieldset className="m-0 grid gap-x-10 gap-y-8 border-0 p-0 md:grid-cols-2">
        <legend className="mb-8 p-0 font-serif text-nombre text-tinta">identificación</legend>
        <Campo
          etiqueta="nombre"
          name="nombre"
          value={valores.nombre}
          onChange={manejarCambio}
          error={errores.nombre}
          ayuda="designación oficial, como Kepler-186f"
          required
        />
        <Campo
          etiqueta="estrella anfitriona"
          name="estrellaAnfitriona"
          value={valores.estrellaAnfitriona}
          onChange={manejarCambio}
          error={errores.estrellaAnfitriona}
          required
        />
        <Selector etiqueta="tipo de planeta" name="tipoPlaneta" opciones={OPCIONES_TIPO_PLANETA} value={valores.tipoPlaneta} onChange={manejarCambio} />
        <Campo
          etiqueta="tipo espectral de la estrella"
          name="tipoEspectral"
          value={valores.tipoEspectral}
          onChange={manejarCambio}
          ayuda="como M1V o G2IV"
        />
      </fieldset>

      <fieldset className="m-0 grid gap-x-10 gap-y-8 border-0 p-0 md:grid-cols-2">
        <legend className="mb-8 p-0 font-serif text-nombre text-tinta">parámetros físicos</legend>
        <Campo etiqueta="radio, en radios terrestres" name="radio" type="number" step="any" min={0} value={valores.radio ?? ""} onChange={manejarCambio} error={errores.radio} />
        <Campo etiqueta="masa, en masas terrestres" name="masa" type="number" step="any" min={0} value={valores.masa ?? ""} onChange={manejarCambio} error={errores.masa} />
        <Campo
          etiqueta="temperatura de equilibrio, en kelvin"
          name="temperaturaEquilibrio"
          type="number"
          step="any"
          min={0}
          value={valores.temperaturaEquilibrio ?? ""}
          onChange={manejarCambio}
          error={errores.temperaturaEquilibrio}
        />
        <Campo
          etiqueta="periodo orbital, en días"
          name="periodoOrbital"
          type="number"
          step="any"
          min={0}
          value={valores.periodoOrbital ?? ""}
          onChange={manejarCambio}
          error={errores.periodoOrbital}
        />
        <Campo
          etiqueta="distancia, en años luz"
          name="distancia"
          type="number"
          step="any"
          min={0}
          value={valores.distancia ?? ""}
          onChange={manejarCambio}
          error={errores.distancia}
        />
        <div className="flex flex-col justify-end gap-y-4">
          <Casilla etiqueta="en zona habitable" name="zonaHabitable" checked={valores.zonaHabitable} onChange={manejarCambio} />
          <Casilla etiqueta="confirmado" name="confirmado" checked={valores.confirmado} onChange={manejarCambio} />
        </div>
      </fieldset>

      <fieldset className="m-0 grid gap-x-10 gap-y-8 border-0 p-0 md:grid-cols-2">
        <legend className="mb-8 p-0 font-serif text-nombre text-tinta">descubrimiento y fuente</legend>
        <Selector
          etiqueta="método de descubrimiento"
          name="metodoDescubrimiento"
          opciones={OPCIONES_METODO_DESCUBRIMIENTO}
          opcionVacia="sin especificar"
          value={valores.metodoDescubrimiento}
          onChange={manejarCambio}
        />
        <Campo
          etiqueta="año de descubrimiento"
          name="anioDescubrimiento"
          type="number"
          inputMode="numeric"
          value={valores.anioDescubrimiento ?? ""}
          onChange={manejarCambio}
          error={errores.anioDescubrimiento}
        />
        <div className="md:col-span-2">
          <Selector
            etiqueta="fuente bibliográfica"
            name="fuentePrincipal"
            opciones={opcionesFuente}
            opcionVacia="sin fuente"
            value={valores.fuentePrincipal}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-2">
          <CampoTexto etiqueta="descripción" name="descripcion" value={valores.descripcion} onChange={manejarCambio} />
        </div>
      </fieldset>

      <div className="grid gap-y-6">
        {errorEnvio && <Alerta variante="error">{errorEnvio}</Alerta>}
        {Object.values(errores).some(Boolean) && <Alerta variante="error">{MENSAJES.REVISA_CAMPOS}</Alerta>}
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
          <Boton type="submit" variante="primario" cargando={enviando} textoCargando={textoEnviando}>
            {textoEnviar}
          </Boton>
          <EnlaceBoton to={rutaCancelar}>cancelar</EnlaceBoton>
        </div>
      </div>
    </form>
  );
}
