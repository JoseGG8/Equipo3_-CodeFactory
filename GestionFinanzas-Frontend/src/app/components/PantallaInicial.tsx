import { LogIn, UserPlus } from 'lucide-react';

interface PantallaInicialProps {
  onSeleccionarRegistro: () => void;
  onSeleccionarLogin: () => void;
}

export function PantallaInicial({ onSeleccionarRegistro, onSeleccionarLogin }: PantallaInicialProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Gestor Financiero
        </h1>
        <p className="text-sm text-gray-600">
          Administra tus finanzas personales de manera inteligente
        </p>
      </div>

      <div className="space-y-4">
        {/* Botón Iniciar Sesión */}
        <button
          onClick={onSeleccionarLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Iniciar Sesión
        </button>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Botón Crear Cuenta */}
        <button
          onClick={onSeleccionarRegistro}
          className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-md border-2 border-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Crear Cuenta Nueva
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Al continuar, aceptas nuestros términos y condiciones de uso
      </p>
    </div>
  );
}
