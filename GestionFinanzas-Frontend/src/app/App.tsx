import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { PantallaInicial } from './components/PantallaInicial';
import { FormularioRegistro } from './components/FormularioRegistro';
import { FormularioLogin } from './components/FormularioLogin';
import { FormularioIngreso } from './components/FormularioIngreso';
import { FormularioGasto } from './components/FormularioGasto';
import { FormularioCategoria } from './components/FormularioCategoria';
import { Dashboard } from './components/Dashboard';
import { HistorialIngresos } from './components/HistorialIngresos';
import { GestionCategorias } from './components/GestionCategorias';
import { BarraLateral } from './components/BarraLateral';
import { Toaster, toast } from 'sonner';
import { crearCategoriaApi } from './services/api';
import { VistaApp } from './types';

type Vista = 'inicial' | 'registro' | 'login';

function AppContent() {
  const { usuario, iniciarSesion, cerrarSesion, estaAutenticado } = useAuth();
  const [vista, setVista] = useState<Vista>('inicial');
  const [vistaApp, setVistaApp] = useState<VistaApp>('dashboard');
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
        <AppProvider key={catsVersion} userId={usuario?.id ?? ''}>
          <div className="w-full max-w-6xl flex bg-gray-50">
            <BarraLateral
              vistaActual={vistaApp}
              onCambiarVista={setVistaApp}
              usuario={usuario ? { nombre: usuario.nombre, correo: usuario.correo } : null}
              onCerrarSesion={cerrarSesion}
            />

            <main className="flex-1 p-6">
              {vistaApp === 'dashboard' && <Dashboard />}
              {vistaApp === 'nuevo-ingreso' && usuario && <FormularioIngreso userId={usuario.id} />}
              {vistaApp === 'nuevo-gasto' && usuario && <FormularioGasto userId={usuario.id} />}
              {vistaApp === 'consultar-ingresos' && <HistorialIngresos />}
              {/* La UI existe, pero no hay item en la barra lateral aún */}
              {vistaApp === 'categorias' && <GestionCategorias />}

              {/* Compat: mantenemos la pantalla simple de crear categoría (por si la necesitan) */}
              {vistaApp === 'categorias' && (
                <div className="mt-6 max-w-2xl">
                  <FormularioCategoria onAgregarCategoria={agregarCategoria} />
                </div>
              )}
            </main>
          </div>
        </AppProvider>
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