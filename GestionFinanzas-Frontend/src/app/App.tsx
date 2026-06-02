import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { PantallaInicial } from "./components/PantallaInicial";
import { FormularioTransaccion } from "./components/FormularioTransaccion";
import { FormularioRegistro } from "./components/FormularioRegistro";
import { FormularioLogin } from "./components/FormularioLogin";
import { FormularioCategoria } from "./components/FormularioCategoria";
import { Dashboard } from "./components/Dashboard";
import { HistorialIngresos } from "./components/HistorialIngresos";
import { GestionCategorias } from "./components/GestionCategorias";
import { BarraLateral } from "./components/BarraLateral";
import { Perfil } from "./components/Perfil";
import { AdminUsuarios } from "./components/AdminUsuarios";
import { HistorialGastos } from "./components/HistorialGastos";
import { FormularioPresupuesto } from "./components/FormularioPresupuesto";
import { ReporteGastos } from "./components/ReporteGastos";
import { Toaster, toast } from "sonner";
import { crearCategoriaApi } from "./services/api";
import { VistaApp } from "./types";

type Vista = "inicial" | "registro" | "login";

function AppContent() {
  const {
    usuario,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado,
  } = useAuth();
  const [vista, setVista] = useState<Vista>("inicial");
  const [vistaApp, setVistaApp] = useState<VistaApp>(
    usuario?.rol === "admin" ? "admin-usuarios" : "dashboard",
  );
  const [catsVersion, setCatsVersion] = useState(0);

  useEffect(() => {
    if (usuario) {
      if (
        usuario.rol === "admin" &&
        vistaApp !== "admin-usuarios" &&
        vistaApp !== "perfil"
      ) {
        setVistaApp("admin-usuarios");
      } else if (
        usuario.rol !== "admin" &&
        vistaApp === "admin-usuarios"
      ) {
        setVistaApp("dashboard");
      }
    }
  }, [usuario, vistaApp]);

  const agregarCategoria = async (nuevaCategoria: {
    nombre: string;
    tipo: string;
  }) => {
    try {
      await crearCategoriaApi(nuevaCategoria);
      toast.success("Categoría creada", {
        description: `«${nuevaCategoria.nombre}» (${nuevaCategoria.tipo})`,
      });
      setCatsVersion((v) => v + 1);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "Error al crear la categoría";
      toast.error("No se pudo crear la categoría", {
        description: mensaje,
      });
      throw err;
    }
  };

  const handleRegistroExitoso = (usuarioNuevo: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  }) => {
    iniciarSesion({
      id: usuarioNuevo.id,
      nombre: usuarioNuevo.nombre,
      correo: usuarioNuevo.email,
      contraseña: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      rol:
        usuarioNuevo.rol?.toLowerCase() === "admin"
          ? "admin"
          : "usuario",
    });
  };

  const handleLoginExitoso = (usuarioAutenticado: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  }) => {
    const isAdmin =
      usuarioAutenticado.rol?.toLowerCase() === "admin";
    iniciarSesion({
      id: usuarioAutenticado.id,
      nombre: usuarioAutenticado.nombre,
      correo: usuarioAutenticado.email,
      contraseña: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      rol: isAdmin ? "admin" : "usuario",
    });
    setVistaApp(isAdmin ? "admin-usuarios" : "dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Toaster position="bottom-right" richColors />

      {!estaAutenticado ? (
        // Mostrar pantallas de autenticación
        <>
          {vista === "inicial" && (
            <PantallaInicial
              onSeleccionarRegistro={() => setVista("registro")}
              onSeleccionarLogin={() => setVista("login")}
            />
          )}

          {vista === "registro" && (
            <FormularioRegistro
              onRegistroExitoso={handleRegistroExitoso}
              onVolverAtras={() => setVista("inicial")}
            />
          )}

          {vista === "login" && (
            <FormularioLogin
              onLoginExitoso={handleLoginExitoso}
              onVolverAtras={() => setVista("inicial")}
            />
          )}
        </>
      ) : (
        // Mostrar aplicación de gestión financiera (protegida)
        <AppProvider
          key={catsVersion}
          userId={usuario?.id ?? ""}
        >
          <div className="w-full max-w-6xl flex bg-gray-50">
            <BarraLateral
              vistaActual={vistaApp}
              onCambiarVista={setVistaApp}
              usuario={
                usuario
                  ? {
                      nombre: usuario.nombre,
                      correo: usuario.correo,
                      rol: usuario.rol,
                    }
                  : null
              }
              onCerrarSesion={cerrarSesion}
            />

            <main className="flex-1 p-6">
              {vistaApp === "dashboard" && (
                <Dashboard onCambiarVista={setVistaApp} />
              )}
              {vistaApp === "nuevo-transaccion" && usuario && (
                <FormularioTransaccion userId={usuario.id} />
              )}
              {vistaApp === "nuevo-ingreso" && usuario && (
                <FormularioTransaccion userId={usuario.id} />
              )}
              {vistaApp === "nuevo-gasto" && usuario && (
                <FormularioTransaccion userId={usuario.id} />
              )}
              {vistaApp === "consultar-ingresos" && (
                <HistorialIngresos />
              )}
              {vistaApp === "historial-gastos" && (
                <HistorialGastos />
              )}
              {vistaApp === "reporte-gastos" && (
                <ReporteGastos />
              )}
              {vistaApp === "crear-presupuesto" && (
                <FormularioPresupuesto />
              )}
              {vistaApp === "perfil" && <Perfil />}
              {vistaApp === "admin-usuarios" && (
                <AdminUsuarios />
              )}
              {/* La UI existe, pero no hay item en la barra lateral aún */}
              {vistaApp === "categorias" && (
                <GestionCategorias />
              )}

              {/* Compat: mantenemos la pantalla simple de crear categoría (por si la necesitan) */}
              {vistaApp === "categorias" && (
                <div className="mt-6 max-w-2xl">
                  <FormularioCategoria
                    onAgregarCategoria={agregarCategoria}
                  />
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