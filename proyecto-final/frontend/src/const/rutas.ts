// Rutas de la aplicación. Centralizarlas evita escribir cadenas sueltas por
// todo el código: si una URL cambia, se cambia solo aquí.
// Las que llevan id son funciones. Para declarar la ruta en el router se
// llaman con el parámetro: RUTAS.DETALLE(":id").
export const RUTAS = {
  INICIO: "/",
  DETALLE: (id: string) => `/exoplanetas/${id}`,
  NUEVO: "/exoplanetas/nuevo",
  EDITAR: (id: string) => `/exoplanetas/${id}/editar`,
  MIS_REGISTROS: "/mis-registros",
  LOGIN: "/login",
  REGISTRO: "/registro",
  PANEL_ADMIN: "/admin",
} as const;
