import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Boton } from "@/components/ui/Boton";
import { Campo, CampoTexto } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { LIMITES, OPCIONES_TIPO_OBSERVACION } from "@/const/catalogo";
import { type ErroresFormulario, useFormulario } from "@/hooks/useFormulario";
import { mensajeDeError } from "@/services/api";
import type { DatosObservacion, TipoObservacion } from "@/types";

interface PropsFormularioObservacion {
  onEnviar: (datos: DatosObservacion) => Promise<void>;
}

interface ValoresObservacion {
  contenido: string;
  // mando el valor con tilde porque sin ella el modelo lo rechaza
  tipo: TipoObservacion;
  anioObservacion?: number;
  instrumento: string;
}

const VALORES_INICIALES: ValoresObservacion = { contenido: "", tipo: "Observación", instrumento: "" };
const ANIO_MAXIMO = new Date().getFullYear() + 1;
const UMBRAL_AVISO = Math.round(LIMITES.OBSERVACION_MAX * 0.9);

function validar(valores: ValoresObservacion): ErroresFormulario<ValoresObservacion> {
  const errores: ErroresFormulario<ValoresObservacion> = {};
  const longitud = valores.contenido.trim().length;
  if (longitud < LIMITES.OBSERVACION_MIN) {
    errores.contenido = `escribe al menos ${LIMITES.OBSERVACION_MIN} caracteres.`;
  } else if (longitud > LIMITES.OBSERVACION_MAX) {
    errores.contenido = `sobran ${longitud - LIMITES.OBSERVACION_MAX} caracteres.`;
  }
  const anio = valores.anioObservacion;
  if (anio !== undefined && (anio < LIMITES.ANIO_MIN_DESCUBRIMIENTO || anio > ANIO_MAXIMO)) {
    errores.anioObservacion = `debe estar entre ${LIMITES.ANIO_MIN_DESCUBRIMIENTO} y ${ANIO_MAXIMO}.`;
  }
  return errores;
}

export function FormularioObservacion({ onEnviar }: PropsFormularioObservacion) {
  const { valores, errores, manejarCambio, reiniciar, validar: validarFormulario } = useFormulario(VALORES_INICIALES, validar);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // cuento sin espacios en los extremos porque así cuenta el backend
  const longitud = valores.contenido.trim().length;
  const colorContador =
    longitud > LIMITES.OBSERVACION_MAX ? "text-peligro" : longitud >= UMBRAL_AVISO ? "text-acento" : "text-tinta-apagada";
  const textoContador =
    longitud > LIMITES.OBSERVACION_MAX
      ? `${longitud} de ${LIMITES.OBSERVACION_MAX} caracteres: sobran ${longitud - LIMITES.OBSERVACION_MAX}`
      : longitud >= UMBRAL_AVISO
        ? `${longitud} de ${LIMITES.OBSERVACION_MAX} caracteres: quedan ${LIMITES.OBSERVACION_MAX - longitud}`
        : `${longitud} de ${LIMITES.OBSERVACION_MAX} caracteres`;

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorEnvio(null);
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      await onEnviar({
        contenido: valores.contenido.trim(),
        tipo: valores.tipo,
        anioObservacion: valores.anioObservacion,
        instrumento: valores.instrumento.trim() || undefined,
      });
      reiniciar();
    } catch (error) {
      setErrorEnvio(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    // no le puse título porque ya lo dice el enlace que lo abre
    <form onSubmit={enviar} noValidate aria-label="escribir una observación" className="grid max-w-3xl gap-y-8">

      <div className="grid gap-y-2">
        <CampoTexto etiqueta="observación" name="contenido" value={valores.contenido} onChange={manejarCambio} error={errores.contenido} />
        <p className={`m-0 text-apoyo tabular-nums ${colorContador}`}>{textoContador}</p>
      </div>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
        <Selector etiqueta="tipo" name="tipo" opciones={OPCIONES_TIPO_OBSERVACION} value={valores.tipo} onChange={manejarCambio} />
        <Campo
          etiqueta="año de la observación"
          name="anioObservacion"
          type="number"
          inputMode="numeric"
          value={valores.anioObservacion ?? ""}
          onChange={manejarCambio}
          error={errores.anioObservacion}
        />
        <Campo etiqueta="instrumento" name="instrumento" value={valores.instrumento} onChange={manejarCambio} placeholder="JWST, TESS, VLT…" />
      </div>

      {errorEnvio && <Alerta variante="error">{errorEnvio}</Alerta>}

      <div>
        <Boton type="submit" variante="primario" cargando={enviando} textoCargando="publicando">
          publicar observación
        </Boton>
      </div>
    </form>
  );
}
