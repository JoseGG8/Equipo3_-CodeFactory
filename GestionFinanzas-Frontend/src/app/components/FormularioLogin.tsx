import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { loginUsuario } from '../services/api';

interface FormularioLoginProps {
  onLoginExitoso: (usuario: { id: string; nombre: string; correo: string }) => void;
  onVolverAtras: () => void;
}

const CLAVE_INTENTOS = 'intentos_login';
const CLAVE_TIEMPO_BLOQUEO = 'tiempo_bloqueo';
const TIEMPO_BLOQUEO = 30 * 60 * 1000; // 30 minutos

export function FormularioLogin({ onLoginExitoso, onVolverAtras }: FormularioLoginProps) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [estaBloqueado, setEstaBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Verificar estado de bloqueo al cargar
  useEffect(() => {
    const tiempoBloqueo = localStorage.getItem(CLAVE_TIEMPO_BLOQUEO);
    const intentos = localStorage.getItem(CLAVE_INTENTOS);

    if (intentos) {
      setIntentosFallidos(parseInt(intentos));
    }

    if (tiempoBloqueo) {
      const tiempoTranscurrido = Date.now() - parseInt(tiempoBloqueo);
      const tiempoRestanteMs = TIEMPO_BLOQUEO - tiempoTranscurrido;

      if (tiempoRestanteMs > 0) {
        setEstaBloqueado(true);
        setTiempoRestante(Math.ceil(tiempoRestanteMs / 1000));
      } else {
        // Desbloquear si el tiempo ha pasado
        localStorage.removeItem(CLAVE_TIEMPO_BLOQUEO);
        localStorage.removeItem(CLAVE_INTENTOS);
        setIntentosFallidos(0);
      }
    }
  }, []);

  // Contador para tiempo de bloqueo
  useEffect(() => {
    if (!estaBloqueado || tiempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          // Desbloquear
          setEstaBloqueado(false);
          setIntentosFallidos(0);
          localStorage.removeItem(CLAVE_TIEMPO_BLOQUEO);
          localStorage.removeItem(CLAVE_INTENTOS);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estaBloqueado, tiempoRestante]);

  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (estaBloqueado) {
      toast.error('Cuenta bloqueada', {
        description: `Por seguridad, espera ${formatearTiempo(tiempoRestante)} para intentar nuevamente.`
      });
      return;
    }

    if (!correo.trim() || !contraseña.trim()) {
      toast.error('Error de validación', {
        description: 'Por favor, completa todos los campos'
      });
      return;
    }

    setEnviando(true);
    try {
      const u = await loginUsuario(correo.trim().toLowerCase(), contraseña);

      toast.success('¡Bienvenido!', {
        description: `Has iniciado sesión correctamente, ${u.nombre}`
      });

      localStorage.removeItem(CLAVE_INTENTOS);
      localStorage.removeItem(CLAVE_TIEMPO_BLOQUEO);
      setIntentosFallidos(0);

      onLoginExitoso({
        id: String(u.id),
        nombre: u.nombre,
        correo: u.email
      });
    } catch {
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);
      localStorage.setItem(CLAVE_INTENTOS, nuevosIntentos.toString());

      if (nuevosIntentos >= 5) {
        setEstaBloqueado(true);
        setTiempoRestante(TIEMPO_BLOQUEO / 1000);
        localStorage.setItem(CLAVE_TIEMPO_BLOQUEO, Date.now().toString());

        toast.error('Cuenta bloqueada', {
          description: 'Has superado el límite de intentos. La cuenta ha sido bloqueada por 30 minutos.',
          duration: 5000
        });
      } else {
        const intentosRestantes = 5 - nuevosIntentos;
        toast.error('Credenciales incorrectas', {
          description: `Correo o contraseña incorrectos. Te quedan ${intentosRestantes} intento${intentosRestantes === 1 ? '' : 's'}.`
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 max-w-md w-full">
      {/* Botón volver */}
      <button
        onClick={onVolverAtras}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver</span>
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Iniciar Sesión</h2>
        <p className="text-sm text-gray-600 mt-2">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      {/* Alerta de bloqueo */}
      {estaBloqueado && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Cuenta temporalmente bloqueada</p>
              <p className="text-xs text-red-700 mt-1">
                Por seguridad, tu cuenta ha sido bloqueada tras 5 intentos fallidos.
                Podrás intentar nuevamente en: <span className="font-semibold">{formatearTiempo(tiempoRestante)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de intentos */}
      {!estaBloqueado && intentosFallidos > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Advertencia de seguridad</p>
              <p className="text-xs text-yellow-700 mt-1">
                {intentosFallidos} intento{intentosFallidos === 1 ? '' : 's'} fallido{intentosFallidos === 1 ? '' : 's'}.
                Te quedan {5 - intentosFallidos} intento{5 - intentosFallidos === 1 ? '' : 's'} antes del bloqueo.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo electrónico
            </div>
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={estaBloqueado}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="ejemplo@correo.com"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña
            </div>
          </label>
          <div className="relative">
            <input
              type={mostrarContraseña ? 'text' : 'password'}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              disabled={estaBloqueado}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarContraseña(!mostrarContraseña)}
              disabled={estaBloqueado}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {mostrarContraseña ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={estaBloqueado || enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <LogIn className="w-5 h-5" />
          {estaBloqueado ? 'Cuenta bloqueada' : enviando ? 'Entrando…' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="mt-6 text-xs text-center text-gray-500">
        El acceso se valida contra el servidor desplegado. Si aún no tienes cuenta, regístrate primero.
      </p>
    </div>
  );
}
