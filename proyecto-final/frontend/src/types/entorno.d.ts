/// <reference types="vite/client" />

// la dejé opcional para que typescript me obligue a comprobarla
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
