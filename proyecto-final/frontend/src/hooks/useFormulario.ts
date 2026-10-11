import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

export type ErroresFormulario<T> = Partial<Record<keyof T, string>>;

type ElementoCampo = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// enlazo cada campo por su name para no escribir un manejador por campo
export function useFormulario<T extends object>(
  valoresIniciales: T,
  validar?: (valores: T) => ErroresFormulario<T>
) {
  // un solo objeto para que el hook sirva a cualquier formulario
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario<T>>({});

  // uso refs para que las funciones no cambien en cada render
  const inicialesRef = useRef(valoresIniciales);
  const validarRef = useRef(validar);
  useEffect(() => {
    validarRef.current = validar;
  });

  const manejarCambio = useCallback((evento: ChangeEvent<ElementoCampo>) => {
    const campo = evento.target;
    let valor: string | number | boolean | undefined = campo.value;
    // convierto checkbox y números para no mandar textos a la api
    if (campo instanceof HTMLInputElement && campo.type === "checkbox") {
      valor = campo.checked;
    } else if (campo instanceof HTMLInputElement && campo.type === "number") {
      valor = campo.value === "" ? undefined : campo.valueAsNumber;
    }

    setValores((previos) => ({ ...previos, [campo.name]: valor }));
    // borro el error al corregir el campo para no esperar a validar otra vez
    setErrores((previos) => ({ ...previos, [campo.name]: undefined }));
  }, []);

  // para los campos que no son un input normal
  const establecerValor = useCallback(<K extends keyof T>(clave: K, valor: T[K]) => {
    setValores((previos) => ({ ...previos, [clave]: valor }));
    setErrores((previos) => ({ ...previos, [clave]: undefined }));
  }, []);

  // sin argumento vuelve al inicio y con argumento carga otros valores
  const reiniciar = useCallback((nuevosValores?: T) => {
    setValores(nuevosValores ?? inicialesRef.current);
    setErrores({});
  }, []);

  // devuelvo true si está bien para usarlo directo en el submit
  const validarFormulario = useCallback((): boolean => {
    const validacion = validarRef.current;
    if (!validacion) return true;
    const nuevosErrores = validacion(valores);
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((mensaje) => !mensaje);
  }, [valores]);

  return { valores, errores, manejarCambio, establecerValor, reiniciar, validar: validarFormulario };
}
