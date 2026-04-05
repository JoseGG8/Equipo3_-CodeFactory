import { useState } from 'react';
import { DollarSign, Calendar, Tag, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FormularioIngresoProps {
  onAgregarIngreso: (ingreso: {
    monto: number;
    fecha: string;
    categoria: string;
    descripcion: string;
  }) => void;
}

export function FormularioIngreso({ onAgregarIngreso }: FormularioIngresoProps) {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // TODO: Reemplazar con categorías del backend cuando se integre
  // const categorias = obtenerCategoriasDelBackend();
  const categorias: { id: string; nombre: string }[] = [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const montoNumerico = parseFloat(monto);

    // Validación: el monto debe ser mayor que cero
    if (!monto || montoNumerico <= 0) {
      toast.error('Error de validación', {
        description: 'El monto debe ser mayor que cero'
      });
      return;
    }

    // Validación: la categoría es obligatoria
    if (!categoria) {
      toast.error('Error de validación', {
        description: 'Debes seleccionar una categoría'
      });
      return;
    }

    // Guardar el ingreso
    onAgregarIngreso({
      monto: montoNumerico,
      fecha,
      categoria,
      descripcion
    });

    // Limpiar formulario
    setMonto('');
    setFecha(new Date().toISOString().split('T')[0]);
    setCategoria('');
    setDescripcion('');

    // Mensaje de confirmación
    toast.success('Ingreso guardado', {
      description: `La transacción fue registrada en la categoría "${categoria}"`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrar Nuevo Ingreso</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
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

        {/* Fecha */}
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

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoría *
            </div>
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
            disabled={categorias.length === 0}
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

        {/* Descripción */}
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

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar Ingreso
        </button>
      </form>
    </div>
  );
}