const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details ?? {};
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se puede conectar con la API. Comprueba tu conexión o vuelve a intentarlo.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || `Error ${response.status}`, response.status, data.details);
  }
  return data;
}

function toQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const expensesApi = {
  list: (filters, signal) => request(`/api/expenses${toQuery(filters)}`, { signal }),
  create: (expense) => request('/api/expenses', { method: 'POST', body: expense }),
  update: (id, expense) => request(`/api/expenses/${id}`, { method: 'PUT', body: expense }),
  remove: (id) => request(`/api/expenses/${id}`, { method: 'DELETE' }),
};
