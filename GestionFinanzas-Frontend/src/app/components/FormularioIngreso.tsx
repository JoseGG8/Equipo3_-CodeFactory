import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Tag, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { listarCategoriasApi, registrarIngresoApi } from '../services/api';

interface FormularioIngresoProps {
  userId: string;
}

export function FormularioIngreso({ userId }: FormularioIngresoProps) {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [cargandoCats, setCargandoCats] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const todas = await listarCategoriasApi();
        const lista = todas
          .filter((c) => c.tipo.toUpperCase() === 'INGRESO')
          .map((c) => ({ id: c.id, nombre: c.nombre }));
        if (!cancelado) setCategorias(lista);
      } catch (err) {
        if (!cancelado) {
          const mensaje = err instanceof Error ? err.message : 'Error al cargar categorías';
          toast.error('Categorías', { description: mensaje });
          setCategorias([]);
        }
      } finally {
        if (!cancelado) setCargandoCats(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uid = Number(userId);
    if (!userId || Number.isNaN(uid)) {
      toast.error('Sesión', { description: 'Vuelve a iniciar sesión.' });
      return;
    }

    const montoNumerico = Number.parseFloat(monto);
    if (!monto || montoNumerico <= 0) {
      toast.error('Error de validación', {
        description: 'El monto debe ser mayor que cero'
      });
      return;
    }

    if (!categoriaId) {
      toast.error('Error de validación', {
        description: 'Debes seleccionar una categoría'
      });
      return;
    }

    const catId = Number(categoriaId);
    if (Number.isNaN(catId)) {
      toast.error('Error de validación', { description: 'Categoría no válida' });
      return;
    }

    setEnviando(true);
    try {
      await registrarIngresoApi({
        userId: uid,
        categoryId: catId,
        monto: montoNumerico,
        fecha,
        descripcion
      });
      toast.success('Ingreso guardado', {
        description: 'La transacción fue registrada correctamente'
      });
      setMonto('');
      setFecha(new Date().toISOString().split('T')[0]);
      setCategoriaId('');
      setDescripcion('');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo registrar el ingreso';
      toast.error('Error', { description: mensaje });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrar nuevo ingreso</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monto *
            </div>
          </label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha *
            </div>
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoría *
            </div>
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
            disabled={cargandoCats || categorias.length === 0}
          >
            <option value="">
              {cargandoCats
                ? 'Cargando categorías…'
                : categorias.length === 0
                  ? 'No hay categorías de ingreso. Crea una primero.'
                  : 'Selecciona una categoría'}
            </option>
            {categorias.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción (opcional)
            </div>
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Agrega una descripción..."
          />
        </div>

        <button
          type="submit"
          disabled={enviando || cargandoCats}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {enviando ? 'Guardando…' : 'Registrar ingreso'}
        </button>
      </form>
    </div>
  );
}
