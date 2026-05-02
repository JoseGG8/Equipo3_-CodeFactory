import { useState } from 'react';
import { Tag, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

type TipoTab = 'ingreso' | 'gasto';

export function GestionCategorias() {
  const { categoriasIngreso, categoriasGasto, agregarCategoria, eliminarCategoria } = useApp();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso');
  const [tabActiva, setTabActiva] = useState<TipoTab>('ingreso');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre de la categoría es obligatorio',
      });
      return;
    }

    const lista = tipo === 'ingreso' ? categoriasIngreso : categoriasGasto;
    const existe = lista.some(
      (c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase()
    );

    if (existe) {
      toast.error('Categoría duplicada', {
        description: `Ya existe una categoría de ${tipo} con ese nombre`,
      });
      return;
    }

    // TODO: Reemplazar con llamada REST a Spring Boot
    agregarCategoria({ nombre: nombre.trim(), tipo });

    toast.success('Categoría creada', {
      description: `La categoría "${nombre.trim()}" fue creada exitosamente`,
    });

    setNombre('');
  };

  const handleEliminar = (id: string, nombreCat: string) => {
    if (confirmandoEliminar === id) {
      eliminarCategoria(id);
      toast.success('Categoría eliminada', {
        description: `"${nombreCat}" fue eliminada correctamente`,
      });
      setConfirmandoEliminar(null);
    } else {
      setConfirmandoEliminar(id);
      setTimeout(() => setConfirmandoEliminar(null), 3000);
    }
  };

  const categoriasActivas = tabActiva === 'ingreso' ? categoriasIngreso : categoriasGasto;

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Categorías</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Crea y administra las categorías para tus ingresos y gastos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel: Crear nueva categoría */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            Crear Nueva Categoría
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre de la categoría *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Ej: Salario, Alimentación, etc."
              />
            </div>

            {/* Tipo (radio buttons) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de categoría *
              </label>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="ingreso"
                    checked={tipo === 'ingreso'}
                    onChange={() => setTipo('ingreso')}
                    className="w-4 h-4 text-green-600 accent-green-600"
                  />
                  <span className="text-sm text-gray-700">Ingreso</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="gasto"
                    checked={tipo === 'gasto'}
                    onChange={() => setTipo('gasto')}
                    className="w-4 h-4 text-red-600 accent-red-600"
                  />
                  <span className="text-sm text-gray-700">Gasto</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Crear Categoría
            </button>
          </form>
        </div>

        {/* Panel: Categorías existentes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            Categorías Existentes
          </h2>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
            <button
              onClick={() => setTabActiva('ingreso')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tabActiva === 'ingreso'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Ingresos ({categoriasIngreso.length})
            </button>
            <button
              onClick={() => setTabActiva('gasto')}
              className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                tabActiva === 'gasto'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Gastos ({categoriasGasto.length})
            </button>
          </div>

          {/* Lista */}
          {categoriasActivas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                No hay categorías de {tabActiva === 'ingreso' ? 'ingresos' : 'gastos'}.
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {categoriasActivas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        tabActiva === 'ingreso' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-gray-700">{cat.nombre}</span>
                  </div>
                  <button
                    onClick={() => handleEliminar(cat.id, cat.nombre)}
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                      confirmandoEliminar === cat.id
                        ? 'bg-red-100 text-red-600'
                        : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                    }`}
                    title={confirmandoEliminar === cat.id ? 'Clic para confirmar' : 'Eliminar categoría'}
                  >
                    {confirmandoEliminar === cat.id ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
