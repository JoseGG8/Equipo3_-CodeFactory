import { useState } from 'react';
import { Tag, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FormularioCategoriaProps {
  onAgregarCategoria: (categoria: { nombre: string; tipo: string }) => void | Promise<void>;
}

export function FormularioCategoria({ onAgregarCategoria }: FormularioCategoriaProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'INGRESO' | 'GASTO' | ''>('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre de la categoría es obligatorio'
      });
      return;
    }

    if (!tipo) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un tipo de categoría'
      });
      return;
    }

    setEnviando(true);
    try {
      await Promise.resolve(
        onAgregarCategoria({
          nombre: nombre.trim(),
          tipo
        })
      );
      setNombre('');
      setTipo('');
    } catch {
      // El padre ya mostró el error
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Crear nueva categoría</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Nombre de la categoría *
            </div>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Transporte, Salario, Comida"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Tipo *
            </div>
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'INGRESO' | 'GASTO' | '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="">Seleccione un tipo</option>
            <option value="INGRESO">INGRESO</option>
            <option value="GASTO">GASTO</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {enviando ? 'Guardando…' : 'Crear categoría'}
        </button>
      </form>
    </div>
  );
}
