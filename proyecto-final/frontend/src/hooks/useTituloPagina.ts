import { useEffect } from "react";

// cambio el título porque en una app de una página el navegador no lo hace solo
export function useTituloPagina(titulo: string) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | exoarchive` : "exoarchive";
  }, [titulo]);
}
