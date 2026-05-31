import { useState, useMemo } from 'react';
import { PieChart as PieChartIcon, Lightbulb, AlertTriangle, Calendar, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formato';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORES = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

export function ReporteGastos() {
  const { gastos, ingresos, presupuestos } = useApp();

  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  });

  const datosAnteriores = useMemo(() => {
    const [year, month] = mesSeleccionado.split('-');
    let y = parseInt(year);
    let m = parseInt(month) - 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    const mesAnteriorStr = `${y}-${String(m).padStart(2, '0')}`;
    
    const gastosAnt = gastos.filter(t => t.fecha.startsWith(mesAnteriorStr));
    const ingresosAnt = ingresos.filter(t => t.fecha.startsWith(mesAnteriorStr));
    
    const totGastos = gastosAnt.reduce((s, t) => s + t.monto, 0);
    const totIngresos = ingresosAnt.reduce((s, t) => s + t.monto, 0);
    
    return {
      gastosMesAnterior: gastosAnt,
      totalGastos: totGastos,
      totalIngresos: totIngresos,
      balance: totIngresos - totGastos,
      tieneDatos: gastosAnt.length > 0 || ingresosAnt.length > 0
    };
  }, [mesSeleccionado, gastos, ingresos]);

  // Generar todos los meses del año actual
  const mesesDisponibles = useMemo(() => {
    const meses = [];
    const añoActual = new Date().getFullYear();
    for (let i = 1; i <= 12; i++) {
      meses.push(`${añoActual}-${String(i).padStart(2, '0')}`);
    }
    return meses.sort((a, b) => b.localeCompare(a));
  }, []);

  const gastosDelMes = useMemo(() => {
    return gastos.filter((t) => t.fecha.startsWith(mesSeleccionado));
  }, [gastos, mesSeleccionado]);

  const totalFiltrado = gastosDelMes.reduce((s, t) => s + t.monto, 0);

  const presupuestoDelMes = useMemo(() => presupuestos.find(p => p.mes === mesSeleccionado), [presupuestos, mesSeleccionado]);
  const montoPresupuesto = presupuestoDelMes ? presupuestoDelMes.monto : 0;
  const porcentajePresupuesto = montoPresupuesto > 0 ? (totalFiltrado / montoPresupuesto) * 100 : 0;
  const presupuestoExcedido = montoPresupuesto > 0 && totalFiltrado > montoPresupuesto;

  // Datos para gráfico
  const datosGrafico = useMemo(() => {
    const mapa: Record<string, number> = {};
    gastosDelMes.forEach(g => {
      mapa[g.categoriaNombre] = (mapa[g.categoriaNombre] || 0) + g.monto;
    });
    
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, fill: COLORES[index % COLORES.length] }));
  }, [gastosDelMes]);

  // Recomendaciones
  const recomendaciones = useMemo(() => {
    const recs = [];
    
    // Recomendación basada en datos del mes anterior
    if (!datosAnteriores.tieneDatos) {
      recs.push({
        tipo: 'info',
        titulo: 'Falta información',
        mensaje: 'No hay información de ingresos ni gastos del mes anterior para comparar.'
      });
    } else {
      if (datosAnteriores.balance === 0) {
        recs.push({
          tipo: 'info',
          titulo: 'Sin ahorros',
          mensaje: 'El mes anterior tus gastos fueron exactamente iguales a tus ingresos. No se registró ahorro.'
        });
      } else if (datosAnteriores.balance < 0) {
        recs.push({
          tipo: 'alerta',
          titulo: 'Balance negativo',
          mensaje: `Tus gastos superaron a tus ingresos el mes pasado por ${formatearMoneda(Math.abs(datosAnteriores.balance))}. Considera ajustar tu presupuesto este mes para recuperarte.`
        });
      } else {
        recs.push({
          tipo: 'idea',
          titulo: '¡Felicidades!',
          mensaje: `El mes anterior lograste un balance positivo de ${formatearMoneda(datosAnteriores.balance)}. Mantener tus gastos por debajo de tus ingresos es clave para tu salud financiera y te permite hacer crecer tus ahorros mes a mes.`
        });
      }
    }

    if (datosGrafico.length > 0) {
      const topCat = datosGrafico[0];
      const porcentaje = (topCat.value / totalFiltrado) * 100;
      
      // Comparación de categoría con el mes anterior
      const gastoAnteriorEnTopCat = datosAnteriores.gastosMesAnterior.filter(g => g.categoriaNombre === topCat.name).reduce((s, g) => s + g.monto, 0);
      
      if (gastoAnteriorEnTopCat > 0) {
        const diferencia = topCat.value - gastoAnteriorEnTopCat;
        if (diferencia > 0) {
          recs.push({
            tipo: 'alerta',
            titulo: 'Aumento en categoría principal',
            mensaje: `Tus gastos en "${topCat.name}" aumentaron ${formatearMoneda(diferencia)} comparado con el mes anterior.`
          });
        } else if (diferencia < 0) {
          recs.push({
            tipo: 'idea',
            titulo: 'Reducción de gastos',
            mensaje: `¡Bien hecho! Has reducido tus gastos en "${topCat.name}" por ${formatearMoneda(Math.abs(diferencia))} respecto al mes pasado.`
          });
        }
      }

      if (porcentaje > 60) {
        recs.push({
          tipo: 'alerta',
          titulo: 'Gasto concentrado',
          mensaje: `Tu categoría "${topCat.name}" representa el ${porcentaje.toFixed(1)}% de tus gastos de este mes. Considera diversificar o reducir este gasto.`
        });
      } else if (porcentaje > 40) {
        recs.push({
          tipo: 'info',
          titulo: 'Atención a categoría',
          mensaje: `Estás gastando bastante en "${topCat.name}". Revisa si hay oportunidades de ahorro allí.`
        });
      }
    }
    
    if (totalFiltrado === 0) {
      const fechaActual = new Date();
      const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
      
      if (mesSeleccionado === mesActual) {
        recs.push({
          tipo: 'idea',
          titulo: 'Ahorro perfecto',
          mensaje: 'Aún no tienes gastos este mes. ¡Excelente momento para definir una meta de ahorro!'
        });
      }
    }

    return recs;
  }, [datosGrafico, totalFiltrado, mesSeleccionado, datosAnteriores]);

  const formatearMes = (yyyyMm: string) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y selector de mes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reporte de Gastos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analiza tus gastos por categoría y mes, con recomendaciones financieras</p>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer appearance-none capitalize font-medium shadow-sm"
          >
            {mesesDisponibles.map(m => (
              <option key={m} value={m}>{formatearMes(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen del Presupuesto */}
      {presupuestoDelMes && (
        <div className={`p-6 rounded-xl border ${presupuestoExcedido ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className={`text-lg font-semibold ${presupuestoExcedido ? 'text-red-800' : 'text-gray-800'} flex items-center gap-2`}>
                <Target className="w-5 h-5" />
                Presupuesto Mensual
              </h2>
              <p className={`text-sm mt-1 ${presupuestoExcedido ? 'text-red-600' : 'text-gray-500'}`}>
                {presupuestoExcedido 
                  ? '¡Has excedido tu presupuesto mensual establecido!' 
                  : 'Mantienes tus gastos bajo control este mes.'}
              </p>
            </div>
            
            <div className="flex items-end gap-4 text-right">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Gastado</p>
                <p className={`text-2xl font-bold ${presupuestoExcedido ? 'text-red-700' : 'text-gray-900'}`}>
                  {formatearMoneda(totalFiltrado)}
                </p>
              </div>
              <div className="text-gray-400 text-xl font-light pb-1">/</div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Presupuesto</p>
                <p className="text-xl font-semibold text-gray-700">
                  {formatearMoneda(montoPresupuesto)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                porcentajePresupuesto > 100 ? 'bg-red-500' : 
                porcentajePresupuesto > 80 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(porcentajePresupuesto, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs font-medium text-gray-500">
            {porcentajePresupuesto.toFixed(1)}% consumido
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-orange-500" />
            Gastos por Categoría
          </h2>
          
          {datosGrafico.length > 0 ? (
            <>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosGrafico}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {datosGrafico.map((entry, index) => (
                        <Cell key={`pie-cell-${index}-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatearMoneda(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Total del mes</span>
                <span className="text-xl font-bold text-gray-900">{formatearMoneda(totalFiltrado)}</span>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {(() => {
                const fechaActual = new Date();
                const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
                if (mesSeleccionado > mesActual) {
                  return 'Aún no hay gastos registrados para este mes porque es un mes en el futuro.';
                } else if (mesSeleccionado < mesActual) {
                  return 'No hay gastos registrados en este mes pasado.';
                } else {
                  return 'Aún no tienes gastos este mes.';
                }
              })()}
            </div>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Recomendaciones Financieras
          </h2>
          {recomendaciones.map((rec, i) => (
            <div key={i} className={`p-5 rounded-xl border ${
              rec.tipo === 'alerta' ? 'bg-red-50 border-red-100' : 
              rec.tipo === 'info' ? 'bg-amber-50 border-amber-100' : 
              'bg-blue-50 border-blue-100'
            }`}>
              <div className="flex items-start gap-4">
                {rec.tipo === 'alerta' ? (
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className={`w-6 h-6 flex-shrink-0 mt-0.5 ${rec.tipo === 'info' ? 'text-amber-500' : 'text-blue-500'}`} />
                )}
                <div>
                  <h4 className={`text-base font-semibold mb-1 ${
                    rec.tipo === 'alerta' ? 'text-red-800' : 
                    rec.tipo === 'info' ? 'text-amber-800' : 
                    'text-blue-800'
                  }`}>{rec.titulo}</h4>
                  <p className={`text-sm leading-relaxed ${
                    rec.tipo === 'alerta' ? 'text-red-600' : 
                    rec.tipo === 'info' ? 'text-amber-700' : 
                    'text-blue-700'
                  }`}>{rec.mensaje}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}