// las centralicé para no repetir cadenas por todo el código
export const RUTAS = {
  INICIO: "/",
  DETALLE: (id: string) => `/exoplanetas/${id}`,
  NUEVO: "/exoplanetas/nuevo",
  EDITAR: (id: string) => `/exoplanetas/${id}/editar`,
  MIS_REGISTROS: "/mis-registros",
  LOGIN: "/login",
  REGISTRO: "/registro",
  PANEL_ADMIN: "/moderacion",
} as const;
