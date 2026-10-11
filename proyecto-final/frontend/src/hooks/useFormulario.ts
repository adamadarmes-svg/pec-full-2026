import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

export type ErroresFormulario<T> = Partial<Record<keyof T, string>>;

type ElementoCampo = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Formulario controlado genérico. Cada campo se enlaza por su atributo name,
// que debe coincidir con una clave de los valores iniciales.
export function useFormulario<T extends object>(
  valoresIniciales: T,
  validar?: (valores: T) => ErroresFormulario<T>
) {
  // Un solo objeto con todos los valores en vez de un useState por campo
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario<T>>({});

  // Valores iniciales y validación en refs: quien llama suele pasar objetos y
  // funciones nuevos en cada render, y así las funciones devueltas son estables
  const inicialesRef = useRef(valoresIniciales);
  const validarRef = useRef(validar);
  useEffect(() => {
    validarRef.current = validar;
  });

  const manejarCambio = useCallback((evento: ChangeEvent<ElementoCampo>) => {
    const campo = evento.target;
    let valor: string | number | boolean | undefined = campo.value;
    // Los checkbox guardan un booleano y los numéricos un número (o undefined
    // si están vacíos), para no arrastrar cadenas hasta la API
    if (campo instanceof HTMLInputElement && campo.type === "checkbox") {
      valor = campo.checked;
    } else if (campo instanceof HTMLInputElement && campo.type === "number") {
      valor = campo.value === "" ? undefined : campo.valueAsNumber;
    }

    setValores((previos) => ({ ...previos, [campo.name]: valor }));
    // Al corregir un campo se borra su error, sin esperar a volver a validar
    setErrores((previos) => ({ ...previos, [campo.name]: undefined }));
  }, []);

  // Para campos que no salen de un input nativo (select propio, archivo...)
  const establecerValor = useCallback(<K extends keyof T>(clave: K, valor: T[K]) => {
    setValores((previos) => ({ ...previos, [clave]: valor }));
    setErrores((previos) => ({ ...previos, [clave]: undefined }));
  }, []);

  // Sin argumento vuelve a los valores iniciales; con argumento carga otros
  // (por ejemplo, los de un registro que se va a editar)
  const reiniciar = useCallback((nuevosValores?: T) => {
    setValores(nuevosValores ?? inicialesRef.current);
    setErrores({});
  }, []);

  // Devuelve true si no hay errores, para usarlo directamente en el submit
  const validarFormulario = useCallback((): boolean => {
    const validacion = validarRef.current;
    if (!validacion) return true;
    const nuevosErrores = validacion(valores);
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((mensaje) => !mensaje);
  }, [valores]);

  return { valores, errores, manejarCambio, establecerValor, reiniciar, validar: validarFormulario };
}
