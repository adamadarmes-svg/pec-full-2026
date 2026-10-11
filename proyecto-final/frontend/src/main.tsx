import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import "@/index.css";

const raiz = document.getElementById("root");

// sin #root no hay dónde montar la app
if (!raiz) {
  throw new Error("falta #root en index.html");
}

// uso StrictMode para encontrar efectos que no se limpian bien
createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);
