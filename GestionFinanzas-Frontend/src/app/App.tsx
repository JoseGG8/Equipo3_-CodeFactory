import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PantallaInicial } from './components/PantallaInicial';
import { FormularioRegistro } from './components/FormularioRegistro';
import { FormularioLogin } from './components/FormularioLogin';
import { FormularioIngreso } from './components/FormularioIngreso';
import { FormularioCategoria } from './components/FormularioCategoria';
import { Toaster, toast } from 'sonner';
import { Plus, Layers } from 'lucide-react';
import { crearCategoriaApi } from './services/api';

type Vista = 'inicial' | 'registro' | 'login';
type VistaApp = 'ingresos' | 'categoria';

function AppContent() {
  const { usuario, iniciarSesion, estaAutenticado } = useAuth();
  const [vista, setVista] = useState<Vista>('inicial');
  const [vistaApp, setVistaApp] = useState<VistaApp>('ingresos');
  const [catsVersion, setCatsVersion] = useState(0);

  const agregarCategoria = async (nuevaCategoria: { nombre: string; tipo: string }) => {
    try {
      await crearCategoriaApi(nuevaCategoria);
      toast.success('Categoría creada', {
        description: `«${nuevaCategoria.nombre}» (${nuevaCategoria.tipo})`
      });
      setCatsVersion((v) => v + 1);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear la categoría';
      toast.error('No se pudo crear la categoría', { description: mensaje });
      throw err;
    }
  };

  const handleRegistroExitoso = (usuarioNuevo: { id: string; nombre: string; correo: string }) => {
    iniciarSesion({
      id: usuarioNuevo.id,
      nombre: usuarioNuevo.nombre,
      correo: usuarioNuevo.correo,
      contraseña: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
  };

  const handleLoginExitoso = (usuarioAutenticado: { id: string; nombre: string; correo: string }) => {
    iniciarSesion({
      id: usuarioAutenticado.id,
      nombre: usuarioAutenticado.nombre,
      correo: usuarioAutenticado.correo,
      contraseña: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Toaster position="bottom-right" richColors />

      {!estaAutenticado ? (
        // Mostrar pantallas de autenticación
        <>
          {vista === 'inicial' && (
            <PantallaInicial
              onSeleccionarRegistro={() => setVista('registro')}
              onSeleccionarLogin={() => setVista('login')}
            />
          )}

          {vista === 'registro' && (
            <FormularioRegistro
              onRegistroExitoso={handleRegistroExitoso}
              onVolverAtras={() => setVista('inicial')}
            />
          )}

          {vista === 'login' && (
            <FormularioLogin
              onLoginExitoso={handleLoginExitoso}
              onVolverAtras={() => setVista('inicial')}
            />
          )}
        </>
      ) : (
        // Mostrar aplicación de gestión financiera (protegida)
        <div className="w-full max-w-5xl">
          {/* Barra de usuario con botones de navegación */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bienvenido,</p>
                <p className="text-lg font-semibold text-gray-800">{usuario?.nombre}</p>
                <p className="text-xs text-gray-500">{usuario?.correo}</p>
              </div>
              
              {/* Botones de navegación */}
              <div className="flex gap-3">
                <button
                  onClick={() => setVistaApp('ingresos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    vistaApp === 'ingresos'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Ingresos
                </button>
                <button
                  onClick={() => setVistaApp('categoria')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    vistaApp === 'categoria'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Crear Categoría
                </button>
              </div>
            </div>
          </div>

          {/* Formulario activo */}
          <div className="max-w-2xl mx-auto">
            {vistaApp === 'ingresos' && usuario && (
              <FormularioIngreso key={catsVersion} userId={usuario.id} />
            )}
            {vistaApp === 'categoria' && (
              <FormularioCategoria onAgregarCategoria={agregarCategoria} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}