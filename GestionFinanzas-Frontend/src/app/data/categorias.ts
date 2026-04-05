// Tipos de transacciones
export type TipoTransaccion = 'ingreso' | 'gasto';

// Interface para las categorías
export interface Categoria {
  id: string;
  nombre: string;
  tipo: TipoTransaccion;
  icono?: string;
}

// Categorías para ingresos
export const CATEGORIAS_INGRESOS: Categoria[] = [
  { id: 'ing-1', nombre: 'Salario', tipo: 'ingreso', icono: '💼' },
  { id: 'ing-2', nombre: 'Freelance', tipo: 'ingreso', icono: '💻' },
  { id: 'ing-3', nombre: 'Inversiones', tipo: 'ingreso', icono: '📈' },
  { id: 'ing-4', nombre: 'Venta', tipo: 'ingreso', icono: '🏷️' },
  { id: 'ing-5', nombre: 'Bonificación', tipo: 'ingreso', icono: '🎁' },
  { id: 'ing-6', nombre: 'Renta', tipo: 'ingreso', icono: '🏠' },
  { id: 'ing-7', nombre: 'Intereses', tipo: 'ingreso', icono: '💰' },
  { id: 'ing-8', nombre: 'Otro', tipo: 'ingreso', icono: '📋' }
];

// Categorías para gastos
export const CATEGORIAS_GASTOS: Categoria[] = [
  { id: 'gas-1', nombre: 'Alimentación', tipo: 'gasto', icono: '🍽️' },
  { id: 'gas-2', nombre: 'Transporte', tipo: 'gasto', icono: '🚗' },
  { id: 'gas-3', nombre: 'Vivienda', tipo: 'gasto', icono: '🏠' },
  { id: 'gas-4', nombre: 'Servicios', tipo: 'gasto', icono: '💡' },
  { id: 'gas-5', nombre: 'Salud', tipo: 'gasto', icono: '⚕️' },
  { id: 'gas-6', nombre: 'Educación', tipo: 'gasto', icono: '📚' },
  { id: 'gas-7', nombre: 'Entretenimiento', tipo: 'gasto', icono: '🎬' },
  { id: 'gas-8', nombre: 'Ropa', tipo: 'gasto', icono: '👕' },
  { id: 'gas-9', nombre: 'Tecnología', tipo: 'gasto', icono: '💻' },
  { id: 'gas-10', nombre: 'Mascotas', tipo: 'gasto', icono: '🐾' },
  { id: 'gas-11', nombre: 'Otro', tipo: 'gasto', icono: '📋' }
];

// Función auxiliar para obtener categorías por tipo
export function obtenerCategoriasPorTipo(tipo: TipoTransaccion): Categoria[] {
  return tipo === 'ingreso' ? CATEGORIAS_INGRESOS : CATEGORIAS_GASTOS;
}

// Función para encontrar una categoría por nombre
export function buscarCategoriaPorNombre(nombre: string, tipo: TipoTransaccion): Categoria | undefined {
  const categorias = obtenerCategoriasPorTipo(tipo);
  return categorias.find(cat => cat.nombre === nombre);
}
