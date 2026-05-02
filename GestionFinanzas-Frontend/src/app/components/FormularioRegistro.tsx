import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  correoYaRegistrado,
  registrarUsuario,
  validarContraseña,
  validarCorreo,
  REGLAS_CONTRASEÑA
} from '../data/usuarios';

interface FormularioRegistroProps {
  onRegistroExitoso: (usuario: { nombre: string; correo: string }) => void;
  onVolverAtras: () => void;
}

export function FormularioRegistro({ onRegistroExitoso, onVolverAtras }: FormularioRegistroProps) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false);

  // Estados para validación en tiempo real
  const [correoTocado, setCorreoTocado] = useState(false);
  const [contraseñaTocada, setContraseñaTocada] = useState(false);

  // Validación de contraseña en tiempo real
  const validacionContraseña = validarContraseña(contraseña);
  const contraseñaValida = validacionContraseña.valida;

  // Validación de correo
  const correoValido = validarCorreo(correo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: campos obligatorios
    if (!nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre es obligatorio'
      });
      return;
    }

    if (!correo.trim()) {
      toast.error('Error de validación', {
        description: 'El correo electrónico es obligatorio'
      });
      return;
    }

    // Validación: formato de correo
    if (!correoValido) {
      toast.error('Error de validación', {
        description: 'El formato del correo electrónico no es válido'
      });
      return;
    }

    // Validación: correo no registrado previamente
    if (correoYaRegistrado(correo)) {
      toast.error('Correo ya registrado', {
        description: 'Este correo electrónico ya está en uso. Por favor, utiliza otro.'
      });
      return;
    }

    // Validación: contraseña
    if (!contraseñaValida) {
      toast.error('Contraseña inválida', {
        description: 'La contraseña no cumple con los requisitos de seguridad'
      });
      return;
    }

    // Validación: confirmación de contraseña
    if (contraseña !== confirmarContraseña) {
      toast.error('Error de validación', {
        description: 'Las contraseñas no coinciden'
      });
      return;
    }

    // Registrar el usuario
    const nuevoUsuario = registrarUsuario({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      contraseña
    });

    // Notificar éxito
    toast.success('¡Registro exitoso!', {
      description: `Bienvenido ${nuevoUsuario.nombre}. Tu cuenta ha sido creada.`
    });

    // Callback al componente padre
    onRegistroExitoso({
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo
    });

    // Limpiar formulario
    setNombre('');
    setCorreo('');
    setContraseña('');
    setConfirmarContraseña('');
    setCorreoTocado(false);
    setContraseñaTocada(false);
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
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Crear Cuenta</h2>
        <p className="text-sm text-gray-600 mt-2">
          Regístrate para comenzar a gestionar tus finanzas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre completo *
            </div>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo electrónico *
            </div>
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={() => setCorreoTocado(true)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
              correoTocado && correo
                ? correoValido
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="ejemplo@correo.com"
          />
          {correoTocado && correo && !correoValido && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Formato de correo inválido
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña *
            </div>
          </label>
          <div className="relative">
            <input
              type={mostrarContraseña ? 'text' : 'password'}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              onBlur={() => setContraseñaTocada(true)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent pr-10 ${
                contraseñaTocada && contraseña
                  ? contraseñaValida
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarContraseña(!mostrarContraseña)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarContraseña ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Requisitos de contraseña */}
          {contraseñaTocada && contraseña && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-gray-700">Requisitos de seguridad:</p>
              <ul className="space-y-1">
                <li className={`text-xs flex items-center gap-1 ${
                  contraseña.length >= REGLAS_CONTRASEÑA.longitudMinima ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {contraseña.length >= REGLAS_CONTRASEÑA.longitudMinima ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Mínimo {REGLAS_CONTRASEÑA.longitudMinima} caracteres
                </li>
                <li className={`text-xs flex items-center gap-1 ${
                  /[A-Z]/.test(contraseña) ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {/[A-Z]/.test(contraseña) ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Una letra mayúscula
                </li>
                <li className={`text-xs flex items-center gap-1 ${
                  /[a-z]/.test(contraseña) ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {/[a-z]/.test(contraseña) ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Una letra minúscula
                </li>
                <li className={`text-xs flex items-center gap-1 ${
                  /[0-9]/.test(contraseña) ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {/[0-9]/.test(contraseña) ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Un número
                </li>
                <li className={`text-xs flex items-center gap-1 ${
                  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña) ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña) ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Un carácter especial (!@#$%...)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar contraseña *
            </div>
          </label>
          <div className="relative">
            <input
              type={mostrarConfirmarContraseña ? 'text' : 'password'}
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent pr-10 ${
                confirmarContraseña && contraseña
                  ? contraseña === confirmarContraseña
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarContraseña(!mostrarConfirmarContraseña)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarConfirmarContraseña ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmarContraseña && contraseña !== confirmarContraseña && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 mt-6"
        >
          <UserPlus className="w-5 h-5" />
          Crear Cuenta
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Al registrarte, aceptas nuestros términos y condiciones
      </p>
    </div>
  );
}