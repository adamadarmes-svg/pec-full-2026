const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const mensaje = data?.mensaje || data?.error || "Error al conectar con la API";
    throw new Error(mensaje);
  }

  return data;
}

export function getExoplanets(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.tipoPlaneta) params.set("tipoPlaneta", filtros.tipoPlaneta);
  if (filtros.buscar) params.set("buscar", filtros.buscar);

  const query = params.toString();
  return request(`/api/exoplanets${query ? `?${query}` : ""}`);
}

export function createExoplanet(data) {
  return request("/api/exoplanets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateExoplanet(id, data) {
  return request(`/api/exoplanets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteExoplanet(id) {
  return request(`/api/exoplanets/${id}`, {
    method: "DELETE",
  });
}

export function getExoplanet(id) {
  return request(`/api/exoplanets/${id}`);
}