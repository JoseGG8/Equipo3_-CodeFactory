import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatearMoneda, formatearFechaCorta, primerDiaMes, ultimoDiaMes } from '../utils/formato';
import { Transaccion } from '../data/transacciones';

type Periodo = 'este-mes' | 'ultimo-mes' | 'este-año' | 'personalizado';

const COLORES_CATEGORIAS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-teal-500',
];

function obtenerRango(periodo: Periodo, desde: string, hasta: string): { desde: string; hasta: string } {
  const hoy = new Date();
  if (periodo === 'este-mes') {
    return { desde: primerDiaMes(hoy), hasta: ultimoDiaMes(hoy) };
  }
  if (periodo === 'ultimo-mes') {
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    return { desde: primerDiaMes(mesAnterior), hasta: ultimoDiaMes(mesAnterior) };
  }
  if (periodo === 'este-año') {
    return {
      desde: `${hoy.getFullYear()}-01-01`,
      hasta: `${hoy.getFullYear()}-12-31`,
    };
  }
  return { desde, hasta };
}

function enRango(fecha: string, desde: string, hasta: string): boolean {
  return fecha >= desde && fecha <= hasta;
}

export function Dashboard() {
  const { ingresos, gastos, transacciones } = useApp();

  const [periodo, setPeriodo] = useState<Periodo>('este-mes');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const rango = useMemo(
    () => obtenerRango(periodo, fechaDesde, fechaHasta),
    [periodo, fechaDesde, fechaHasta]
  );

  const ingresosFiltrados = useMemo(
    () => ingresos.filter((t) => enRango(t.fecha, rango.desde, rango.hasta)),
    [ingresos, rango]
  );
  const gastosFiltrados = useMemo(
    () => gastos.filter((t) => enRango(t.fecha, rango.desde, rango.hasta)),
    [gastos, rango]
  );

  const totalIngresos = ingresosFiltrados.reduce((s, t) => s + t.monto, 0);
  const totalGastos = gastosFiltrados.reduce((s, t) => s + t.monto, 0);
  const balance = totalIngresos - totalGastos;
  const tasaAhorro = totalIngresos > 0 ? ((balance / totalIngresos) * 100) : 0;

  // Actividad reciente (últimas 6 transacciones de todos los tiempos)
  const actividadReciente = useMemo(
    () =>
      [...transacciones]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, 6),
    [transacciones]
  );

  // Top categorías de gastos en el período
  const topCategorias = useMemo(() => {
    const mapa: Record<string, number> = {};
    gastosFiltrados.forEach((g) => {
      mapa[g.categoriaNombre] = (mapa[g.categoriaNombre] || 0) + g.monto;
    });
    const sorted = Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return sorted.map(([nombre, monto]) => ({
      nombre,
      monto,
      porcentaje: totalGastos > 0 ? Math.round((monto / totalGastos) * 100) : 0,
    }));
  }, [gastosFiltrados, totalGastos]);

  const labelPeriodo: Record<Periodo, string> = {
    'este-mes': 'Este mes',
    'ultimo-mes': 'Último mes',
    'este-año': 'Este año',
    personalizado: 'Personalizado',
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Panel Principal</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen de tu situación financiera</p>
      </div>

      {/* Filtro de período */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 flex items-center gap-1.5 mr-1">
            <Calendar className="w-4 h-4" /> Período:
          </span>
          {(['este-mes', 'ultimo-mes', 'este-año', 'personalizado'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodo === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {labelPeriodo[p]}
            </button>
          ))}
          {periodo === 'personalizado' && (
            <div className="flex items-center gap-2 mt-2 w-full sm:w-auto sm:mt-0">
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance General */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 font-medium mb-1">Balance General</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {formatearMoneda(balance)}
          </p>
          <p className="text-xs text-blue-500 mt-1">Del período seleccionado</p>
        </div>

        {/* Total Ingresos */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mb-1">Total Ingresos</p>
          <p className="text-xl font-bold text-green-700">{formatearMoneda(totalIngresos)}</p>
          <p className="text-xs text-green-500 mt-1">
            {ingresosFiltrados.length} registro{ingresosFiltrados.length !== 1 ? 's' : ''} en el período
          </p>
        </div>

        {/* Total Gastos */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-600 font-medium mb-1">Total Gastos</p>
          <p className="text-xl font-bold text-red-700">{formatearMoneda(totalGastos)}</p>
          <p className="text-xs text-red-500 mt-1">
            {gastosFiltrados.length} registro{gastosFiltrados.length !== 1 ? 's' : ''} en el período
          </p>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
        {actividadReciente.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No hay transacciones registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {actividadReciente.map((t: Transaccion) => (
              <div key={t.id} className="border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors p-3">
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {t.tipo === 'ingreso' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.categoriaNombre}</p>
                    <p className="text-xs text-gray-400">{formatearFechaCorta(t.fecha)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${
                      t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(t.monto)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
