import { useEffect, useState } from "react";

// lo hice para no lanzar una petición por cada tecla
export function useDiferido<T>(valor: T, esperaMs = 300): T {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDiferido(valor), esperaMs);
    // cada cambio cancela la espera anterior
    return () => clearTimeout(temporizador);
  }, [valor, esperaMs]);

  return diferido;
}
