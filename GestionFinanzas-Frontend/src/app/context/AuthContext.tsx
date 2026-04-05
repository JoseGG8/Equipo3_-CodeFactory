import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../data/usuarios';

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TIEMPO_INACTIVIDAD = 10 * 60 * 1000; // 10 minutos en milisegundos
const CLAVE_SESION = 'sesion_usuario';
const CLAVE_ULTIMA_ACTIVIDAD = 'ultima_actividad';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Restaurar sesión al cargar
  useEffect(() => {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);
    const ultimaActividad = localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD);

    if (sesionGuardada && ultimaActividad) {
      const tiempoTranscurrido = Date.now() - parseInt(ultimaActividad);

      // Verificar si la sesión ha expirado
      if (tiempoTranscurrido < TIEMPO_INACTIVIDAD) {
        setUsuario(JSON.parse(sesionGuardada));
        actualizarUltimaActividad();
      } else {
        // Sesión expirada
        limpiarSesion();
      }
    }
  }, []);

  // Monitorear actividad del usuario
  useEffect(() => {
    if (!usuario) return;

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const manejarActividad = () => {
      actualizarUltimaActividad();
    };

    // Agregar listeners
    eventos.forEach(evento => {
      window.addEventListener(evento, manejarActividad);
    });

    // Verificar inactividad cada minuto
    const intervalo = setInterval(() => {
      const ultimaActividad = localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD);
      if (ultimaActividad) {
        const tiempoTranscurrido = Date.now() - parseInt(ultimaActividad);
        if (tiempoTranscurrido >= TIEMPO_INACTIVIDAD) {
          cerrarSesion();
        }
      }
    }, 60000); // Verificar cada minuto

    return () => {
      eventos.forEach(evento => {
        window.removeEventListener(evento, manejarActividad);
      });
      clearInterval(intervalo);
    };
  }, [usuario]);

  const actualizarUltimaActividad = () => {
    localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, Date.now().toString());
  };

  const limpiarSesion = () => {
    localStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_ULTIMA_ACTIVIDAD);
  };

  const iniciarSesion = (usuarioAutenticado: Usuario) => {
    // Guardar sesión en localStorage
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioAutenticado));
    actualizarUltimaActividad();
    setUsuario(usuarioAutenticado);
  };

  const cerrarSesion = () => {
    limpiarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado: !!usuario
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
