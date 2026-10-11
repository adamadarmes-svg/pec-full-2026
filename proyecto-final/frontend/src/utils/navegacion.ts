import { RUTAS } from "@/const/rutas";

export interface EstadoRedireccion {
  desde: string;
}

// solo acepto rutas internas para que nadie pueda redirigir a otro dominio
export function rutaDeOrigen(estado: unknown): string {
  if (
    typeof estado === "object" &&
    estado !== null &&
    "desde" in estado &&
    typeof estado.desde === "string" &&
    estado.desde.startsWith("/") &&
    !estado.desde.startsWith("//")
  ) {
    return estado.desde;
  }
  return RUTAS.INICIO;
}
