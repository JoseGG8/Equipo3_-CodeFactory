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

export type TransactionTypeApi = 'INGRESO' | 'GASTO';

export type TransaccionApi = {
  id: number;
  monto: number;
  descripcion?: string | null;
  fecha: string; // ISO
  tipo: TransactionTypeApi;
  usuario: { id: number };
  categoria: { id: number };
};

export function toIsoStartOfDay(dateYmd: string): string {
  return dateYmd.includes('T') ? dateYmd : `${dateYmd}T00:00:00`;
}

export function toIsoEndOfDay(dateYmd: string): string {
  return dateYmd.includes('T') ? dateYmd : `${dateYmd}T23:59:59`;
}

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
  // El backend recibe una Transaction completa (usuario/categoria embebidos) en /api/transactions/register
  const fechaIso = toIsoStartOfDay(body.fecha);
  const res = await fetch(apiUrl('/api/transactions/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monto: body.monto,
      fecha: fechaIso,
      descripcion: body.descripcion || null,
      tipo: 'INGRESO',
      usuario: { id: body.userId },
      categoria: { id: body.categoryId }
    })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo registrar el ingreso');
  }
  return text ? JSON.parse(text) : null;
}

export async function registrarGastoApi(body: {
  userId: number;
  categoryId: number;
  monto: number;
  fecha: string;
  descripcion: string;
}): Promise<unknown> {
  const fechaIso = toIsoStartOfDay(body.fecha);
  const res = await fetch(apiUrl('/api/transactions/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monto: body.monto,
      fecha: fechaIso,
      descripcion: body.descripcion || null,
      tipo: 'GASTO',
      usuario: { id: body.userId },
      categoria: { id: body.categoryId }
    })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || 'No se pudo registrar el gasto');
  }
  return text ? JSON.parse(text) : null;
}

export async function obtenerHistoricoTransaccionesApi(input: {
  userId: number;
  tipo?: TransactionTypeApi;
  inicioYmd: string;
  finYmd: string;
}): Promise<TransaccionApi[]> {
  const params = new URLSearchParams({
    inicio: toIsoStartOfDay(input.inicioYmd),
    fin: toIsoEndOfDay(input.finYmd),
  });
  if (input.tipo) params.set('tipo', input.tipo);

  const res = await fetch(apiUrl(`/api/transactions/${input.userId}/transactions/history?${params.toString()}`));
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo consultar el histórico');
  return text ? (JSON.parse(text) as TransaccionApi[]) : [];
}

export async function obtenerBalanceApi(input: {
  userId: number;
  inicioYmd: string;
  finYmd: string;
}): Promise<number> {
  const params = new URLSearchParams({
    inicio: toIsoStartOfDay(input.inicioYmd),
    fin: toIsoEndOfDay(input.finYmd),
  });

  const res = await fetch(apiUrl(`/api/transactions/user/${input.userId}/balance?${params.toString()}`));
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo calcular el balance');
  const n = Number(text);
  return Number.isFinite(n) ? n : (JSON.parse(text) as number);
}

export async function obtenerTasaAhorroApi(input: {
  userId: number;
  inicioYmd: string;
  finYmd: string;
}): Promise<number> {
  const params = new URLSearchParams({
    inicio: toIsoStartOfDay(input.inicioYmd),
    fin: toIsoEndOfDay(input.finYmd),
  });

  const res = await fetch(apiUrl(`/api/transactions/${input.userId}/transactions/ahorro?${params.toString()}`));
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo calcular la tasa de ahorro');
  const n = Number(text);
  return Number.isFinite(n) ? n : (JSON.parse(text) as number);
}

// -- DASHBOARD --

export type DashboardSummaryApi = {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  transaccionesRecientes: TransaccionApi[];
};

export async function obtenerDashboardApi(input: {
  userId: number;
  inicioYmd: string;
  finYmd: string;
}): Promise<DashboardSummaryApi> {
  const params = new URLSearchParams({
    inicio: toIsoStartOfDay(input.inicioYmd),
    fin: toIsoEndOfDay(input.finYmd),
  });

  const res = await fetch(apiUrl(`/api/dashboard/${input.userId}?${params.toString()}`));
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo cargar el dashboard');
  return JSON.parse(text) as DashboardSummaryApi;
}

// -- PRESUPUESTOS --

export type PresupuestoApi = {
  id: number;
  montoTotal: number;
  nombre: string;
  mes: number;
  año: number;
  usuario: { id: number };
};

export type PresupuestoProgressApi = {
  id: number;
  nombre: string;
  montoTotal: number;
  gastado: number;
  porcentaje: number;
};

export async function crearPresupuestoApi(body: {
  montoTotal: number;
  nombre: string;
  mes: number;
  año: number;
  userId: number;
}): Promise<PresupuestoApi> {
  const res = await fetch(apiUrl('/api/budgets/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      montoTotal: body.montoTotal,
      nombre: body.nombre,
      mes: body.mes,
      año: body.año,
      usuario: { id: body.userId }
    })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo crear el presupuesto');
  return JSON.parse(text) as PresupuestoApi;
}

export async function obtenerPresupuestosProgressApi(userId: number): Promise<PresupuestoProgressApi[]> {
  const res = await fetch(apiUrl(`/api/budgets/user/${userId}/progress`));
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudieron cargar los presupuestos');
  return text ? (JSON.parse(text) as PresupuestoProgressApi[]) : [];
}

export async function editarPresupuestoApi(id: number, body: { montoTotal: number; nombre: string }): Promise<PresupuestoApi> {
  const res = await fetch(apiUrl(`/api/budgets/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'No se pudo actualizar el presupuesto');
  return JSON.parse(text) as PresupuestoApi;
}

export async function eliminarPresupuestoApi(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/budgets/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'No se pudo eliminar el presupuesto');
  }
}
