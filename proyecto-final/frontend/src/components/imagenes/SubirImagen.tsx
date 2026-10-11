import { type ChangeEvent, type FormEvent, useId, useRef, useState } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Boton } from "@/components/ui/Boton";
import { Campo, CampoTexto } from "@/components/ui/Campo";
import { Cargando } from "@/components/ui/Cargando";
import { Selector } from "@/components/ui/Selector";
import { LIMITES, OPCIONES_ORIGEN_IMAGEN } from "@/const/catalogo";
import { useCompresionImagen } from "@/hooks/useCompresionImagen";
import { type ErroresFormulario, useFormulario } from "@/hooks/useFormulario";
import { mensajeDeError } from "@/services/api";
import type { DatosImagenNueva, OrigenImagen } from "@/types";
import { formatearNumero } from "@/utils/formato";

interface PropsSubirImagen {
  exoplanetaId: string;
  onEnviar: (datos: DatosImagenNueva) => Promise<void>;
}

interface ValoresImagen {
  titulo: string;
  descripcion: string;
  creditoAutor: string;
  origen: OrigenImagen;
  url: string;
}

const VALORES_INICIALES: ValoresImagen = { titulo: "", descripcion: "", creditoAutor: "", origen: "subida", url: "" };

// el accept es solo una ayuda, el tipo real lo compruebo por los bytes
const TIPOS_ACEPTADOS = "image/jpeg,image/png,image/webp,image/gif";

const PATRON_URL = /^https?:\/\/\S+$/i;

function validar(valores: ValoresImagen): ErroresFormulario<ValoresImagen> {
  const errores: ErroresFormulario<ValoresImagen> = {};
  if (!valores.titulo.trim()) errores.titulo = "falta el título.";
  else if (valores.titulo.length > LIMITES.TITULO_IMAGEN) errores.titulo = `máximo ${LIMITES.TITULO_IMAGEN} caracteres.`;
  if (valores.descripcion.length > LIMITES.DESCRIPCION_IMAGEN) {
    errores.descripcion = `máximo ${LIMITES.DESCRIPCION_IMAGEN} caracteres.`;
  }
  if (valores.origen === "enlace" && !PATRON_URL.test(valores.url.trim())) {
    errores.url = "la dirección debe empezar por http:// o https://";
  }
  return errores;
}

export function SubirImagen({ exoplanetaId, onEnviar }: PropsSubirImagen) {
  const { valores, errores, manejarCambio, reiniciar, validar: validarFormulario } = useFormulario(VALORES_INICIALES, validar);
  const compresion = useCompresionImagen();
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [faltaArchivo, setFaltaArchivo] = useState(false);
  // guardo la url que falló para que el aviso se vaya al escribir otra
  const [urlFallida, setUrlFallida] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const idArchivo = useId();
  const esSubida = valores.origen === "subida";

  const elegirArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    setFaltaArchivo(false);
    setNombreArchivo(archivo?.name ?? null);
    if (archivo) compresion.procesar(archivo);
    else compresion.limpiar();
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorEnvio(null);
    const camposValidos = validarFormulario();
    const sinArchivo = esSubida && !compresion.imagen;
    setFaltaArchivo(sinArchivo);
    if (!camposValidos || sinArchivo || compresion.comprimiendo) return;

    const comunes = {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim() || undefined,
      creditoAutor: valores.creditoAutor.trim() || undefined,
      exoplaneta: exoplanetaId,
    };
    // no mando formato ni tamaño porque el backend los calcula
    const datos: DatosImagenNueva =
      esSubida && compresion.imagen
        ? { ...comunes, origen: "subida", datos: compresion.imagen.datos }
        : { ...comunes, origen: "enlace", url: valores.url.trim() };

    setEnviando(true);
    try {
      await onEnviar(datos);
      reiniciar();
      compresion.limpiar();
      setNombreArchivo(null);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    } catch (error) {
      setErrorEnvio(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    // no le puse título porque ya lo dice el enlace que lo abre
    <form onSubmit={enviar} noValidate aria-label="añadir una imagen" className="grid max-w-3xl gap-y-8">

      <div className="grid items-start gap-x-10 gap-y-8 md:grid-cols-2">
        <Campo etiqueta="título" name="titulo" value={valores.titulo} onChange={manejarCambio} error={errores.titulo} maxLength={LIMITES.TITULO_IMAGEN} />
        <Campo
          etiqueta="crédito del autor"
          name="creditoAutor"
          value={valores.creditoAutor}
          onChange={manejarCambio}
          ayuda="observatorio, misión o persona que la tomó"
        />
        <div className="md:col-span-2">
          <CampoTexto
            etiqueta="descripción"
            name="descripcion"
            value={valores.descripcion}
            onChange={manejarCambio}
            error={errores.descripcion}
            maxLength={LIMITES.DESCRIPCION_IMAGEN}
          />
        </div>
        <Selector etiqueta="origen de la imagen" name="origen" opciones={OPCIONES_ORIGEN_IMAGEN} value={valores.origen} onChange={manejarCambio} />

        {esSubida ? (
          <div className="grid gap-y-2">
            <span className="text-apoyo text-tinta-tenue">archivo</span>
            {/* escondí el input nativo porque enseña textos del navegador que no puedo cambiar, sigue accesible con teclado */}
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-2">
              <input
                ref={inputArchivoRef}
                id={idArchivo}
                type="file"
                accept={TIPOS_ACEPTADOS}
                onChange={elegirArchivo}
                aria-describedby={`${idArchivo}-ayuda`}
                aria-invalid={faltaArchivo || Boolean(compresion.error)}
                className="peer sr-only"
              />
              <label
                htmlFor={idArchivo}
                className="cursor-pointer text-apoyo text-acento-fuerte underline decoration-acento underline-offset-[0.4em] peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-acento"
              >
                elegir archivo
              </label>
              <span className="text-apoyo text-tinta-tenue">{nombreArchivo ?? "ningún archivo elegido"}</span>
            </div>
            <p id={`${idArchivo}-ayuda`} className={`m-0 text-apoyo ${faltaArchivo || compresion.error ? "text-peligro" : "text-tinta-apagada"}`}>
              {compresion.error ??
                (faltaArchivo
                  ? "elige un archivo jpeg, png, webp o gif."
                  : "jpeg, png, webp o gif. la publicará un administrador.")}
            </p>
          </div>
        ) : (
          <Campo
            etiqueta="dirección de la imagen"
            name="url"
            type="url"
            value={valores.url}
            onChange={manejarCambio}
            error={errores.url}
            ayuda="la publicará un administrador."
            placeholder="https://"
          />
        )}
      </div>

      {esSubida && compresion.comprimiendo && <Cargando texto="comprimiendo la imagen" />}
      {esSubida && compresion.imagen && (
        <figure className="m-0 grid gap-y-3">
          <img src={compresion.imagen.datos} loading="lazy" alt={`vista previa de ${valores.titulo || "la imagen"}`} className="block h-auto max-h-96 w-auto max-w-full" />
          <figcaption className="text-apoyo text-tinta-apagada">
            vista previa, {formatearNumero(compresion.imagen.tamanoKb)} kilobytes en formato {compresion.imagen.formato}
          </figcaption>
        </figure>
      )}
      {!esSubida &&
        PATRON_URL.test(valores.url.trim()) &&
        (urlFallida === valores.url ? (
          <p className="m-0 text-apoyo text-peligro">no se pudo cargar. usa un enlace directo a la imagen.</p>
        ) : (
          <img
            src={valores.url.trim()}
            loading="lazy"
            alt={`vista previa de ${valores.titulo || "la imagen"}`}
            onError={() => setUrlFallida(valores.url)}
            className="block h-auto max-h-96 w-auto max-w-full"
          />
        ))}

      {errorEnvio && <Alerta variante="error">{errorEnvio}</Alerta>}

      <div>
        <Boton type="submit" variante="primario" cargando={enviando} textoCargando="enviando" disabled={compresion.comprimiendo}>
          enviar imagen
        </Boton>
      </div>
    </form>
  );
}
