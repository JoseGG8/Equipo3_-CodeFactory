import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  crearPresupuestoApi,
  obtenerPresupuestosProgressApi,
  editarPresupuestoApi,
  eliminarPresupuestoApi,
  PresupuestoProgressApi,
} from '../services/api';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';

export function Presupuestos() {
  const { usuario } = useAuth();
  const [presupuestos, setPresupuestos] = useState<PresupuestoProgressApi[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [mes, setMes] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMonto, setEditMonto] = useState('');

  const cargarPresupuestos = async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const lista = await obtenerPresupuestosProgressApi(Number(usuario.id));
      setPresupuestos(lista);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los presupuestos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, [usuario]);

  const resetCrear = () => {
    setNombre('');
    setMonto('');
    setMes('');
    setError('');
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usuario) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }
    if (!mes) {
      setError('Selecciona mes y año.');
      return;
    }

    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    if (mes < mesActual) {
      setError('El mes no puede ser anterior al actual.');
      return;
    }

    const [anioStr, mesStr] = mes.split('-');
    const nuevoNombre = nombre.trim() || `Presupuesto ${mes}`;

    setCargando(true);
    try {
      await crearPresupuestoApi({
        montoTotal: montoNum,
        nombre: nuevoNombre,
        mes: Number(mesStr),
        año: Number(anioStr),
        userId: Number(usuario.id),
      });
      toast.success('Presupuesto creado');
      resetCrear();
      await cargarPresupuestos();
    } catch (err: any) {
      setError(err?.message || 'Error al crear el presupuesto');
    } finally {
      setCargando(false);
    }
  };

  const prepararEdicion = (presupuesto: PresupuestoProgressApi) => {
    setEditandoId(presupuesto.id);
    setEditNombre(presupuesto.nombre);
    setEditMonto(String(presupuesto.montoTotal));
    setError('');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditMonto('');
    setError('');
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (editandoId === null) return;

    const montoNum = parseFloat(editMonto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }
    if (!editNombre.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }

    setCargando(true);
    try {
      await editarPresupuestoApi(editandoId, {
        montoTotal: montoNum,
        nombre: editNombre.trim(),
      });
      toast.success('Presupuesto actualizado');
      cancelarEdicion();
      await cargarPresupuestos();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el presupuesto');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este presupuesto? Esta acción no se puede deshacer.')) {
      return;
    }
    setCargando(true);
    try {
      await eliminarPresupuestoApi(id);
      toast.success('Presupuesto eliminado');
      if (editandoId === id) cancelarEdicion();
      await cargarPresupuestos();
    } catch (err: any) {
      toast.error(err?.message || 'Error al eliminar el presupuesto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Presupuestos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Crea, edita o elimina presupuestos y revisa su avance en barras de progreso.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear nuevo presupuesto</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Presupuesto Mercado - Mayo"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes y año *</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto mensual *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Crear presupuesto
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de presupuestos</h2>
          {cargando ? (
            <p className="text-sm text-gray-500">Cargando presupuestos...</p>
          ) : presupuestos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay presupuestos. Crea uno para empezar.</p>
          ) : (
            <div className="space-y-4">
              {presupuestos.map((pres) => {
                const porcentaje = Math.min(100, pres.porcentaje);
                return (
                  <div key={pres.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">{pres.nombre}</p>
                        <p className="text-xl font-semibold text-gray-900">{presupuestoAmountFormat(pres.montoTotal)}</p>
                        <p className="text-xs text-gray-500 mt-1">Gastado: {presupuestoAmountFormat(pres.gastado)}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => prepararEdicion(pres)}
                          className="rounded-lg bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="inline h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(pres.id)}
                          className="rounded-lg bg-white border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="inline h-3.5 w-3.5" /> Borrar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                        <span>Uso</span>
                        <span>{pres.porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${pres.porcentaje > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editandoId !== null && (
        <div className="bg-white border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Editar presupuesto</h2>
              <p className="text-sm text-gray-500">Actualiza el nombre o el monto total del presupuesto seleccionado.</p>
            </div>
            <button
              type="button"
              onClick={cancelarEdicion}
              className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleEditar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto total *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editMonto}
                onChange={(e) => setEditMonto(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              <Pencil className="h-4 w-4" /> Guardar cambios
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function presupuestoAmountFormat(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
