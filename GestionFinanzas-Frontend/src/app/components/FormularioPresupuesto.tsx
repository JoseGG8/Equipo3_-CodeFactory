import { useState, useEffect } from 'react';
import { Target, Calendar, DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { crearPresupuestoApi, obtenerPresupuestosProgressApi, PresupuestoProgressApi } from '../services/api';

export function FormularioPresupuesto() {
  const { usuario } = useAuth();
  const [presupuestos, setPresupuestos] = useState<PresupuestoProgressApi[]>([]);
  const [monto, setMonto] = useState('');
  const [mes, setMes] = useState(''); // YYYY-MM
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    obtenerPresupuestosProgressApi(Number(usuario.id))
      .then(setPresupuestos)
      .catch(console.error);
  }, [usuario]);

  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario) {
      setError('Debes iniciar sesión.');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }

    if (!mes) {
      setError('Debes seleccionar un mes y año.');
      return;
    }

    if (mes < mesActual) {
      const fechaFormateada = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      setError(`El mes y año no pueden ser anterior a ${fechaFormateada}.`);
      return;
    }

    const [anioStr, mesStr] = mes.split('-');
    
    // Verificar si ya existe para ese mes (validación simple del lado del cliente)
    const existe = presupuestos.find((p) => p.nombre.includes(mesStr));
    if (existe) {
      setError('Ya existe un presupuesto para este mes. Modifica el existente o elige otro mes.');
      return;
    }

    setCargando(true);
    try {
      await crearPresupuestoApi({
        montoTotal: montoNum,
        nombre: `Presupuesto ${mes}`,
        mes: Number(mesStr),
        año: Number(anioStr),
        userId: Number(usuario.id)
      });

      toast.success('Presupuesto guardado', {
        description: 'El presupuesto ha sido definido exitosamente.'
      });
      
      setMonto('');
      setMes('');
      
      // Actualizar la lista
      const presUpdated = await obtenerPresupuestosProgressApi(Number(usuario.id));
      setPresupuestos(presUpdated);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el presupuesto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Información del presupuesto */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 font-medium mb-1">Presupuestos Definidos</p>
          <p className="text-3xl font-bold text-blue-700">{presupuestos.length}</p>
          <p className="text-sm text-blue-500 mt-1">
            Manten un control de tus gastos mensuales
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">Definir Nuevo Presupuesto</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Monto Mensual *
              </div>
            </label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Mes y Año *
              </div>
            </label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">El presupuesto aplicará para todo el mes seleccionado.</p>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {cargando ? 'Guardando...' : 'Guardar Presupuesto'}
          </button>
        </form>
      </div>
    </div>
  );
}