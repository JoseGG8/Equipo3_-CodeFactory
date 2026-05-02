import { useState, useMemo } from 'react';
import { DollarSign, Calendar, Search, SlidersHorizontal, Inbox } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatearMoneda, formatearFechaLarga, primerDiaMes, ultimoDiaMes } from '../utils/formato';

type OrdenCriterio = 'fecha-desc' | 'fecha-asc' | 'monto-desc' | 'monto-asc';

const OPCIONES_ORDEN: { valor: OrdenCriterio; etiqueta: string }[] = [
  { valor: 'fecha-desc', etiqueta: 'Fecha (Más reciente)' },
  { valor: 'fecha-asc', etiqueta: 'Fecha (Más antiguo)' },
  { valor: 'monto-desc', etiqueta: 'Monto (Mayor)' },
  { valor: 'monto-asc', etiqueta: 'Monto (Menor)' },
];

function obtenerFiltroInicial() {
  const hoy = new Date();
  return {
    desde: primerDiaMes(hoy),
    hasta: ultimoDiaMes(hoy),
  };
}

export function HistorialIngresos() {
  const { ingresos } = useApp();

  const filtroInicial = obtenerFiltroInicial();
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<OrdenCriterio>('fecha-desc');
  const [fechaDesde, setFechaDesde] = useState(filtroInicial.desde);
  const [fechaHasta, setFechaHasta] = useState(filtroInicial.hasta);
  const [filtroActivo, setFiltroActivo] = useState<'este-mes' | 'ultimo-mes' | 'este-año' | 'todos' | 'personalizado'>('este-mes');

  const aplicarFiltroRapido = (tipo: typeof filtroActivo) => {
    setFiltroActivo(tipo);
    const hoy = new Date();
    if (tipo === 'este-mes') {
      setFechaDesde(primerDiaMes(hoy));
      setFechaHasta(ultimoDiaMes(hoy));
    } else if (tipo === 'ultimo-mes') {
      const anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      setFechaDesde(primerDiaMes(anterior));
      setFechaHasta(ultimoDiaMes(anterior));
    } else if (tipo === 'este-año') {
      setFechaDesde(`${hoy.getFullYear()}-01-01`);
      setFechaHasta(`${hoy.getFullYear()}-12-31`);
    } else if (tipo === 'todos') {
      setFechaDesde('2000-01-01');
      setFechaHasta('2099-12-31');
    }
  };

  const ingresosFiltrados = useMemo(() => {
    return ingresos
      .filter((t) => {
        const enRango = t.fecha >= fechaDesde && t.fecha <= fechaHasta;
        const coincideBusqueda =
          busqueda === '' ||
          t.categoriaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        return enRango && coincideBusqueda;
      })
      .sort((a, b) => {
        if (orden === 'fecha-desc') return b.fecha.localeCompare(a.fecha);
        if (orden === 'fecha-asc') return a.fecha.localeCompare(b.fecha);
        if (orden === 'monto-desc') return b.monto - a.monto;
        if (orden === 'monto-asc') return a.monto - b.monto;
        return 0;
      });
  }, [ingresos, busqueda, orden, fechaDesde, fechaHasta]);

  const totalFiltrado = ingresosFiltrados.reduce((s, t) => s + t.monto, 0);

  const etiquetasFiltro = {
    'este-mes': 'Este mes',
    'ultimo-mes': 'Último mes',
    'este-año': 'Este año',
    todos: 'Todos',
    personalizado: 'Personalizado',
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Historial de Ingresos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visualiza y analiza todos tus ingresos registrados</p>
      </div>

      {/* Tarjeta de resumen */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-green-600 font-medium mb-1">Total de Ingresos</p>
          <p className="text-3xl font-bold text-green-700">{formatearMoneda(totalFiltrado)}</p>
          <p className="text-sm text-green-500 mt-1">
            {ingresosFiltrados.length} ingreso{ingresosFiltrados.length !== 1 ? 's' : ''} registrado{ingresosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Filtros de período */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 flex items-center gap-1.5 mr-1">
            <Calendar className="w-4 h-4" /> Período:
          </span>
          {(['este-mes', 'ultimo-mes', 'este-año', 'todos', 'personalizado'] as const).map((p) => (
            <button
              key={p}
              onClick={() => aplicarFiltroRapido(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroActivo === p
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {etiquetasFiltro[p]}
            </button>
          ))}
        </div>
        {filtroActivo === 'personalizado' && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
      </div>

      {/* Buscar y ordenar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por categoría o descripción..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenCriterio)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer appearance-none"
          >
            {OPCIONES_ORDEN.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de ingresos */}
      {ingresosFiltrados.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aún no hay ingresos guardados para mostrar</p>
          <p className="text-sm text-gray-400 mt-1">
            {busqueda ? 'Intenta con otro término de búsqueda.' : 'Registra tu primer ingreso para verlo aquí.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ingresosFiltrados.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-green-200 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-gray-800">
                    {formatearMoneda(t.monto)}
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {t.categoriaNombre}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                  <Calendar className="w-3 h-3" />
                  {formatearFechaLarga(t.fecha)}
                </div>
                {t.descripcion && (
                  <p className="text-xs text-gray-500 truncate">{t.descripcion}</p>
                )}
              </div>

              {/* Monto positivo */}
              <span className="text-green-600 font-semibold text-sm whitespace-nowrap flex-shrink-0">
                +{formatearMoneda(t.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
