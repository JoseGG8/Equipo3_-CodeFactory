import { User, Mail, Shield, Calendar, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatearFechaLarga } from '../utils/formato';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Perfil() {
  const { usuario } = useAuth();

  if (!usuario) return null;

  const iniciales = usuario.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona tu información personal y preferencias</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 relative">
          <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1740252117012-bb53ad05e370?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXIlMjBwbGFjZWhvbGRlciUyMHBlcnNvbnxlbnwxfHx8fDE3ODAwOTE5MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Avatar del usuario"
              className="w-full h-full object-cover"
            />
          </div>
          {usuario.rol === 'admin' && (
            <div className="absolute bottom-[4.5rem] right-0 bg-purple-600 rounded-full p-2 border-2 border-white shadow-sm z-10" title="Administrador">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{usuario.nombre}</h2>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{usuario.rol === 'admin' ? 'Administrador' : 'Usuario General'}</p>
          </div>
        </div>

        {/* Info Details */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Nombre Completo</span>
              </div>
              <p className="text-base text-gray-900 font-semibold">{usuario.nombre}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Correo Electrónico</span>
              </div>
              <p className="text-base text-gray-900 font-semibold">{usuario.correo}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Fecha de Registro</span>
              </div>
              <p className="text-base text-gray-900 font-semibold">{formatearFechaLarga(usuario.fechaRegistro)}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Estado de la cuenta</span>
              </div>
              <p className="text-base text-blue-700 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Activa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}