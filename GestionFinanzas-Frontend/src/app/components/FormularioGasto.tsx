import { useState } from 'react';
import { DollarSign, Calendar, Tag, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formato';
import { registrarGastoApi } from '../services/api';

export function FormularioGasto({ userId }: { userId: string }) {
  const { categoriasGasto, agregarGasto, balanceTotal } = useApp();

  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');

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

    const categoriaSeleccionada = categoriasGasto.find((c) => c.id === categoriaId);

    try {
      await registrarGastoApi({
        userId: Number(userId),
        categoryId: Number(categoriaId),
        monto: montoNumerico,
        fecha,
        descripcion,
      });

      agregarGasto({
        monto: montoNumerico,
        fecha,
        categoriaId,
        categoriaNombre: categoriaSeleccionada?.nombre ?? categoriaId,
        descripcion,
        tipo: 'gasto',
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo registrar el gasto';
      toast.error('Error al registrar', { description: mensaje });
      return;
    }

    toast.success('Gasto registrado', {
      description: `Se registró un gasto de ${formatearMoneda(montoNumerico)} en "${categoriaSeleccionada?.nombre}"`,
    });

    setMonto('');
    setFecha(new Date().toISOString().split('T')[0]);
    setCategoriaId('');
    setDescripcion('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Balance actual */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-0.5">Balance Actual</p>
        <p className={`text-2xl font-bold ${balanceTotal >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {formatearMoneda(balanceTotal)}
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">Registrar Nuevo Gasto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="0.00"
            />
          </div>

          {/* Fecha */}
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Categoría */}
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
              disabled={categoriasGasto.length === 0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriasGasto.length === 0
                  ? 'No hay categorías disponibles. Primero crea una categoría.'
                  : 'Selecciona una categoría'}
              </option>
              {categoriasGasto.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-colors"
              rows={3}
              placeholder="Agrega una descripción..."
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Registrar Gasto
          </button>
        </form>
      </div>
    </div>
  );
}
