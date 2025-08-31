const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
}

export async function login(email: string, password: string) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login fallido');
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

// Automatizaciones API helpers
export async function getAutomatizaciones() {
  const res = await apiFetch('/automatizaciones');
  if (!res.ok) throw new Error('Error al obtener automatizaciones');
  return res.json();
}

export async function crearAutomatizacion(nombre?: string, tipo?: string, parametros?: Record<string, any>) {
  const body: any = {};
  if (nombre) body.nombre = nombre;
  if (tipo) body.tipo = tipo;
  if (parametros) body.parametros = parametros;
  const res = await apiFetch('/automatizaciones', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Error al crear automatización');
  return res.json();
}

export async function eliminarAutomatizacion(id: number) {
  const res = await apiFetch(`/automatizaciones/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar automatización');
  return res.json();
}

export async function ejecutarAutomatizacion(id: number) {
  const res = await apiFetch(`/automatizaciones/${id}/ejecutar`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Error al ejecutar automatización');
  return res.json();
}
