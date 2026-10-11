// lo creo una vez porque crear un Intl.NumberFormat en cada render es caro
const formateador = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

export function formatearNumero(valor: number): string {
  return formateador.format(valor);
}

const formateadorFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

export function formatearFecha(iso: string): string {
  return formateadorFecha.format(new Date(iso));
}

// el backend guarda "Desconocido" con mayúscula, aquí lo enseño en minúscula
export function textoCredito(credito: string | undefined): string {
  return !credito || credito === "Desconocido" ? "autor desconocido" : `crédito: ${credito}`;
}

export function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${formatearNumero(cantidad)} ${cantidad === 1 ? singular : plural}`;
}
