export interface Transaccion {
  id: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  categoriaId: string;
  categoriaNombre: string;
  descripcion: string;
  tipo: 'ingreso' | 'gasto';
}

// Datos simulados — se reemplazarán por llamadas REST a Spring Boot
export const TRANSACCIONES_SIMULADAS: Transaccion[] = [
  // ── INGRESOS ──
  {
    id: 'i-1', monto: 5000000, fecha: '2026-05-01',
    categoriaId: 'ing-1', categoriaNombre: 'Salario',
    descripcion: 'Pago mensual mayo 2026', tipo: 'ingreso',
  },
  {
    id: 'i-2', monto: 5000000, fecha: '2026-04-27',
    categoriaId: 'ing-1', categoriaNombre: 'Salario',
    descripcion: 'Pago mensual abril 2026', tipo: 'ingreso',
  },
  {
    id: 'i-3', monto: 800000, fecha: '2026-04-24',
    categoriaId: 'ing-2', categoriaNombre: 'Freelance',
    descripcion: 'Proyecto diseño web cliente ABC', tipo: 'ingreso',
  },
  {
    id: 'i-4', monto: 1500000, fecha: '2026-04-19',
    categoriaId: 'ing-5', categoriaNombre: 'Bonificación',
    descripcion: 'Bono de productividad Q1', tipo: 'ingreso',
  },
  {
    id: 'i-5', monto: 250000, fecha: '2026-04-10',
    categoriaId: 'ing-3', categoriaNombre: 'Inversiones',
    descripcion: 'Rendimiento fondo de inversión', tipo: 'ingreso',
  },
  {
    id: 'i-6', monto: 5000000, fecha: '2026-03-28',
    categoriaId: 'ing-1', categoriaNombre: 'Salario',
    descripcion: 'Pago mensual marzo 2026', tipo: 'ingreso',
  },
  {
    id: 'i-7', monto: 650000, fecha: '2026-03-15',
    categoriaId: 'ing-2', categoriaNombre: 'Freelance',
    descripcion: 'Consultoría técnica empresa XYZ', tipo: 'ingreso',
  },
  {
    id: 'i-8', monto: 5000000, fecha: '2026-02-28',
    categoriaId: 'ing-1', categoriaNombre: 'Salario',
    descripcion: 'Pago mensual febrero 2026', tipo: 'ingreso',
  },
  {
    id: 'i-9', monto: 300000, fecha: '2026-02-10',
    categoriaId: 'ing-3', categoriaNombre: 'Inversiones',
    descripcion: 'Dividendos acciones', tipo: 'ingreso',
  },

  // ── GASTOS ──
  {
    id: 'g-1', monto: 350000, fecha: '2026-04-27',
    categoriaId: 'gas-1', categoriaNombre: 'Alimentación',
    descripcion: 'Supermercado semanal', tipo: 'gasto',
  },
  {
    id: 'g-2', monto: 180000, fecha: '2026-04-25',
    categoriaId: 'gas-2', categoriaNombre: 'Transporte',
    descripcion: 'Abono mensual transporte', tipo: 'gasto',
  },
  {
    id: 'g-3', monto: 1200000, fecha: '2026-04-01',
    categoriaId: 'gas-3', categoriaNombre: 'Vivienda',
    descripcion: 'Arriendo mensual', tipo: 'gasto',
  },
  {
    id: 'g-4', monto: 280000, fecha: '2026-04-15',
    categoriaId: 'gas-4', categoriaNombre: 'Servicios',
    descripcion: 'Pago servicios públicos', tipo: 'gasto',
  },
  {
    id: 'g-5', monto: 150000, fecha: '2026-04-20',
    categoriaId: 'gas-7', categoriaNombre: 'Entretenimiento',
    descripcion: 'Cine y restaurante', tipo: 'gasto',
  },
  {
    id: 'g-6', monto: 95000, fecha: '2026-04-12',
    categoriaId: 'gas-5', categoriaNombre: 'Salud',
    descripcion: 'Consulta médica', tipo: 'gasto',
  },
  {
    id: 'g-7', monto: 320000, fecha: '2026-03-28',
    categoriaId: 'gas-1', categoriaNombre: 'Alimentación',
    descripcion: 'Mercado mensual', tipo: 'gasto',
  },
  {
    id: 'g-8', monto: 160000, fecha: '2026-03-20',
    categoriaId: 'gas-2', categoriaNombre: 'Transporte',
    descripcion: 'Gasolina y parqueadero', tipo: 'gasto',
  },
  {
    id: 'g-9', monto: 1200000, fecha: '2026-03-01',
    categoriaId: 'gas-3', categoriaNombre: 'Vivienda',
    descripcion: 'Arriendo mensual', tipo: 'gasto',
  },
  {
    id: 'g-10', monto: 260000, fecha: '2026-03-15',
    categoriaId: 'gas-4', categoriaNombre: 'Servicios',
    descripcion: 'Facturas servicios públicos', tipo: 'gasto',
  },
  {
    id: 'g-11', monto: 380000, fecha: '2026-02-25',
    categoriaId: 'gas-1', categoriaNombre: 'Alimentación',
    descripcion: 'Supermercado y fruver', tipo: 'gasto',
  },
  {
    id: 'g-12', monto: 1200000, fecha: '2026-02-01',
    categoriaId: 'gas-3', categoriaNombre: 'Vivienda',
    descripcion: 'Arriendo mensual', tipo: 'gasto',
  },
  {
    id: 'g-13', monto: 245000, fecha: '2026-02-18',
    categoriaId: 'gas-4', categoriaNombre: 'Servicios',
    descripcion: 'Pago servicios', tipo: 'gasto',
  },
];
