import { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Target, AlertTriangle, Inbox } from 'lucide-react';
import { formatearMoneda, formatearFechaCorta, primerDiaMes, ultimoDiaMes } from '../utils/formato';
import { VistaApp } from '../types';
import { useAuth } from '../context/AuthContext';
import { obtenerDashboardApi, obtenerPresupuestosProgressApi, DashboardSummaryApi, PresupuestoProgressApi } from '../services/api';

type Periodo = 'este-mes' | 'ultimo-mes' | 'este-año' | 'personalizado';

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

interface DashboardProps {
  onCambiarVista: (vista: VistaApp) => void;
}

export function Dashboard({ onCambiarVista }: DashboardProps) {
  const { usuario } = useAuth();

  const [periodo, setPeriodo] = useState<Periodo>('este-mes');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [resumen, setResumen] = useState<DashboardSummaryApi | null>(null);
  const [presupuestoActual, setPresupuestoActual] = useState<PresupuestoProgressApi | null>(null);
  const [cargando, setCargando] = useState(false);

  const rango = useMemo(
    () => obtenerRango(periodo, fechaDesde, fechaHasta),
    [periodo, fechaDesde, fechaHasta]
  );

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;

    const cargarDatos = async () => {
      if (!rango.desde || !rango.hasta) return;
      setCargando(true);
      try {
        const [dashRes, presRes] = await Promise.all([
          obtenerDashboardApi({ userId: Number(usuario.id), inicioYmd: rango.desde, finYmd: rango.hasta }),
          obtenerPresupuestosProgressApi(Number(usuario.id))
        ]);

        if (!cancelado) {
          setResumen(dashRes);
          
          // Buscar si hay un presupuesto para el mes actual del rango
          const mesRango = rango.desde.substring(0, 7); // YYYY-MM
          const [anioStr, mesStr] = mesRango.split('-');
          const presMes = presRes.find(p => p.nombre.includes(mesStr) || p.nombre.toLowerCase().includes('presupuesto')); // Ajuste simple, dependiendo de cómo guardan el presupuesto. Idealmente BudgetDTO tendría el mes/año.
          
          setPresupuestoActual(presMes || null);
        }
      } catch (err) {
        console.error('Error cargando dashboard', err);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarDatos();

    return () => { cancelado = true; };
  }, [usuario, rango]);

  const balance = resumen?.balanceTotal || 0;
  const esBalanceNegativo = balance < 0;
  const actividadReciente = resumen?.ultimasTransacciones || [];

  const totalIngresos = actividadReciente
    .filter((t: any) => t.tipo === 'INGRESO')
    .reduce((acc: number, t: any) => acc + t.monto, 0);

  const totalGastos = actividadReciente
    .filter((t: any) => t.tipo === 'GASTO')
    .reduce((acc: number, t: any) => acc + t.monto, 0);

  const labelPeriodo: Record<Periodo, string> = {
    'este-mes': 'Este mes',
    'ultimo-mes': 'Último mes',
    'este-año': 'Este año',
    personalizado: 'Personalizado',
  };

  // Presupuesto logic
  const mesActual = rango.desde.substring(0, 7); // YYYY-MM
  const totalGastoPresupuesto = presupuestoActual?.gastado || 0;
  const porcentajeUso = presupuestoActual?.porcentaje || 0;
  const excedePresupuesto = porcentajeUso > 100;
  const restante = presupuestoActual ? presupuestoActual.montoTotal - totalGastoPresupuesto : 0;

  const sinRegistros = totalIngresos === 0 && totalGastos === 0 && actividadReciente.length === 0;

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

      {sinRegistros && !presupuestoActual ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Aún no hay actividad</h2>
          <p className="text-gray-500 mt-2 max-w-md">No tienes ingresos, gastos ni presupuesto en el período seleccionado. Comienza a registrar tus finanzas para ver el balance y progreso de tu presupuesto.</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onCambiarVista('crear-presupuesto')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Definir Presupuesto
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen - Balance Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance General */}
            <div className={`${esBalanceNegativo ? 'bg-red-50 border-red-200 ring-2 ring-red-500/20' : 'bg-blue-50 border-blue-100'} border rounded-xl p-5 relative overflow-hidden transition-all`}>
              {esBalanceNegativo && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ALERTA
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${esBalanceNegativo ? 'bg-red-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                  <DollarSign className={`w-5 h-5 ${esBalanceNegativo ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
              </div>
              <p className={`text-sm ${esBalanceNegativo ? 'text-red-600' : 'text-blue-600'} font-medium mb-1`}>Balance Disponible</p>
              <p className={`text-3xl font-bold ${esBalanceNegativo ? 'text-red-700' : 'text-blue-700'}`}>
                {formatearMoneda(balance)}
              </p>
              <p className={`text-xs ${esBalanceNegativo ? 'text-red-500' : 'text-blue-500'} mt-1.5`}>
                {esBalanceNegativo ? 'Tus gastos superan tus ingresos' : 'Balance saludable del período'}
              </p>
            </div>

            {/* Total Ingresos */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">{formatearMoneda(totalIngresos)}</p>
            </div>

            {/* Total Gastos */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Gastos</p>
              <p className="text-2xl font-bold text-gray-900">{formatearMoneda(totalGastos)}</p>
            </div>
          </div>

          {/* Progreso del presupuesto */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Progreso del Presupuesto
              </h2>
              {!presupuestoActual && (
                <button
                  onClick={() => onCambiarVista('crear-presupuesto')}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  Definir Presupuesto
                </button>
              )}
            </div>

            {presupuestoActual ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{formatearMoneda(totalGastoPresupuesto)}</p>
                    <p className="text-sm text-gray-500 mt-1">Gastado de {formatearMoneda(presupuestoActual.montoTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${excedePresupuesto ? 'text-red-600' : 'text-green-600'}`}>
                      {excedePresupuesto ? '-' + formatearMoneda(Math.abs(restante)) : formatearMoneda(restante)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{excedePresupuesto ? 'Excedente' : 'Restante'}</p>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-500 ease-in-out ${excedePresupuesto ? 'bg-red-500' : porcentajeUso > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className={`${excedePresupuesto ? 'text-red-600' : porcentajeUso > 80 ? 'text-orange-600' : 'text-green-600'}`}>
                    {porcentajeUso.toFixed(1)}% utilizado
                  </span>
                  {excedePresupuesto && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" /> Has superado tu límite
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Aún no has definido un presupuesto para el mes de {mesActual}.</p>
              </div>
            )}
          </div>

          {/* Actividad reciente */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
            {actividadReciente.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No hay transacciones registradas en absoluto.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {actividadReciente.map((t: any) => (
                  <div key={t.id} className="border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors p-3">
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          t.tipo === 'INGRESO' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {t.tipo === 'INGRESO' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{t.descripcion || 'Sin descripción'}</p>
                        <p className="text-xs text-gray-400">{formatearFechaCorta(t.fecha)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          t.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {t.tipo === 'INGRESO' ? '+' : '-'}{formatearMoneda(t.monto)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}