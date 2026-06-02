import { useEffect, useState } from 'react';
import { DollarSign, Calendar, Tag, FileText, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formato';
import { obtenerPresupuestosProgressApi, registrarTransaccionApi, PresupuestoProgressApi } from '../services/api';

export function FormularioTransaccion({ userId }: { userId: string }) {
  const { categoriasIngreso, categoriasGasto, agregarIngreso, agregarGasto, balanceTotal } = useApp();
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [presupuestoId, setPresupuestoId] = useState('');
  const [presupuestos, setPresupuestos] = useState<PresupuestoProgressApi[]>([]);
  const [cargandoPresupuestos, setCargandoPresupuestos] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setCargandoPresupuestos(true);
    obtenerPresupuestosProgressApi(Number(userId))
      .then((lista) => setPresupuestos(lista))
      .catch(() => setPresupuestos([]))
      .finally(() => setCargandoPresupuestos(false));
  }, [userId]);

  const categorias = tipo === 'ingreso' ? categoriasIngreso : categoriasGasto;
  const presupuestoSeleccionado = presupuestos.find((p) => String(p.id) === presupuestoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const montoNumerico = parseFloat(monto);
    if (!monto || isNaN(montoNumerico) || montoNumerico <= 0) {
      toast.error('Error de validación', {
        description: 'El monto debe ser mayor que cero',
      });
      return;
    }

    if (!categoriaId) {
      toast.error('Error de validación', {
        description: 'Debes seleccionar una categoría',
      });
      return;
    }

    if (tipo === 'gasto' && presupuestoId && !presupuestoSeleccionado) {
      toast.error('Error de validación', {
        description: 'Selecciona un presupuesto válido o deja el campo vacío',
      });
      return;
    }

    const categoriaSeleccionada = categorias.find((c) => c.id === categoriaId);

    try {
      await registrarTransaccionApi({
        userId: Number(userId),
        categoryId: Number(categoriaId),
        monto: montoNumerico,
        fecha,
        descripcion,
        tipo: tipo === 'ingreso' ? 'INGRESO' : 'GASTO',
        presupuestoId: presupuestoId ? Number(presupuestoId) : undefined,
      });

      const nuevaTransaccion = {
        monto: montoNumerico,
        fecha,
        categoriaId,
        categoriaNombre: categoriaSeleccionada?.nombre ?? categoriaId,
        descripcion,
        tipo,
        presupuestoId: presupuestoId || undefined,
        presupuestoNombre: presupuestoSeleccionado?.nombre,
      } as const;

      if (tipo === 'ingreso') {
        agregarIngreso(nuevaTransaccion);
      } else {
        agregarGasto(nuevaTransaccion);
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo registrar la transacción';
      toast.error('Error al registrar', { description: mensaje });
      return;
    }

    toast.success('Transacción registrada', {
      description: tipo === 'ingreso'
        ? `Se registró un ingreso de ${formatearMoneda(montoNumerico)} en "${categoriaSeleccionada?.nombre}"`
        : `Se registró un gasto de ${formatearMoneda(montoNumerico)} en "${categoriaSeleccionada?.nombre}"${presupuestoSeleccionado ? ` con presupuesto "${presupuestoSeleccionado.nombre}"` : ''}`,
    });

    setMonto('');
    setFecha(new Date().toISOString().split('T')[0]);
    setCategoriaId('');
    setDescripcion('');
    setPresupuestoId('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-0.5">Balance General</p>
        <p className={`text-2xl font-bold ${balanceTotal >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {formatearMoneda(balanceTotal)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">Registrar Transacción</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTipo('ingreso')}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tipo === 'ingreso'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="w-4 h-4" /> Ingreso
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTipo('gasto')}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tipo === 'gasto'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2 justify-center">
              <TrendingDown className="w-4 h-4" /> Gasto
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Monto *
              </div>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Fecha *
              </div>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-gray-400" />
                Categoría *
              </div>
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={categorias.length === 0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="">
                {categorias.length === 0
                  ? 'No hay categorías disponibles. Primero crea una categoría.'
                  : 'Selecciona una categoría'}
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {tipo === 'gasto' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Presupuesto (opcional)
                </div>
              </label>
              <select
                value={presupuestoId}
                onChange={(e) => setPresupuestoId(e.target.value)}
                disabled={cargandoPresupuestos || presupuestos.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">
                  {cargandoPresupuestos
                    ? 'Cargando presupuestos...'
                    : presupuestos.length === 0
                    ? 'No hay presupuestos disponibles'
                    : 'Selecciona un presupuesto'}
                </option>
                {presupuestos.map((pres) => (
                  <option key={pres.id} value={pres.id}>
                    {pres.nombre} - {formatearMoneda(pres.montoTotal)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Asigna este gasto a un presupuesto mensual cuando corresponda.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-400" />
                Descripción (opcional)
              </div>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
              rows={3}
              placeholder="Agrega una descripción..."
            />
          </div>

          <button
            type="submit"
            className={`w-full ${tipo === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Registrar Transacción
          </button>
        </form>
      </div>
    </div>
  );
}
