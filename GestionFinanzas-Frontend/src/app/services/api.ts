/** URL pública del API en Render; puedes sobrescribir con VITE_API_URL (p. ej. en Vercel). */
const DEFAULT_API_BASE = 'https://equipo3-codefactory.onrender.com';

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, '');
}

export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return normalizeBase(fromEnv);
  }
  return normalizeBase(DEFAULT_API_BASE);
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBase()}${p}`;
}

export type UsuarioApi = {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
};

export type CategoriaApi = {
  id: number;
  nombre: string;
  tipo: string;
};

export async function loginUsuario(email: string, password: string): Promise<UsuarioApi> {
  const body = new URLSearchParams({ email, password });
  const res = await fetch(apiUrl('/api/users/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo iniciar sesión');
  }
  return JSON.parse(text) as UsuarioApi;
}

export async function registrarUsuarioApi(input: {
  nombre: string;
  email: string;
  password: string;
}): Promise<UsuarioApi> {
  const res = await fetch(apiUrl('/api/users/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: input.nombre,
      email: input.email,
      password: input.password,
      rol: 'USUARIO'
    })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo registrar el usuario');
  }
  return JSON.parse(text) as UsuarioApi;
}

export async function listarCategoriasApi(): Promise<CategoriaApi[]> {
  const res = await fetch(apiUrl('/api/categories'));
  if (!res.ok) {
    throw new Error('No se pudieron cargar las categorías');
  }
  return res.json();
}

export async function crearCategoriaApi(input: { nombre: string; tipo: string }): Promise<CategoriaApi> {
  const res = await fetch(apiUrl('/api/categories'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: input.nombre, tipo: input.tipo })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo crear la categoría');
  }
  return JSON.parse(text) as CategoriaApi;
}

export async function registrarIngresoApi(body: {
  userId: number;
  categoryId: number;
  monto: number;
  fecha: string;
  descripcion: string;
}): Promise<unknown> {
  const res = await fetch(apiUrl('/api/transactions/income'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: body.userId,
      categoryId: body.categoryId,
      monto: body.monto,
      fecha: body.fecha,
      descripcion: body.descripcion || null
    })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo registrar el ingreso');
  }
  return text ? JSON.parse(text) : null;
}
