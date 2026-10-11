/// <reference types="vite/client" />

// Variables de entorno que expone Vite (solo las que empiezan por VITE_).
// Se declara opcional porque puede faltar en un despliegue mal configurado,
// y así TypeScript obliga a comprobarla antes de usarla (ver const/config.ts).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
