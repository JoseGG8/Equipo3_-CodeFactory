import { LayoutDashboard, TrendingUp, TrendingDown, List, Tag, LogOut, User, Users, PieChart, Target, FileText } from 'lucide-react';
import { VistaApp } from '../types';

interface NavItem {
  id: VistaApp;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Panel Principal', Icon: LayoutDashboard, iconColor: 'text-blue-600', userOnly: true },
  { id: 'nuevo-ingreso', label: 'Registrar Ingreso', Icon: TrendingUp, iconColor: 'text-green-600', userOnly: true },
  { id: 'nuevo-gasto', label: 'Registrar Gasto', Icon: TrendingDown, iconColor: 'text-red-600', userOnly: true },
  { id: 'crear-presupuesto', label: 'Crear Presupuesto', Icon: Target, iconColor: 'text-blue-500', userOnly: true },
  { id: 'consultar-ingresos', label: 'Historial Ingresos', Icon: List, iconColor: 'text-green-500', userOnly: true },
  { id: 'historial-gastos', label: 'Historial Gastos', Icon: List, iconColor: 'text-red-500', userOnly: true },
  { id: 'reporte-gastos', label: 'Reporte y Recomendaciones', Icon: PieChart, iconColor: 'text-orange-500', userOnly: true },
  { id: 'categorias', label: 'Gestionar Categorías', Icon: Tag, iconColor: 'text-purple-600', userOnly: true },
  { id: 'perfil', label: 'Mi Perfil', Icon: User, iconColor: 'text-indigo-600' },
  { id: 'admin-usuarios', label: 'Usuarios', Icon: Users, iconColor: 'text-slate-600', adminOnly: true },
];

interface BarraLateralProps {
  vistaActual: VistaApp;
  onCambiarVista: (vista: VistaApp) => void;
  usuario: { nombre: string; correo: string; rol?: 'usuario' | 'admin' } | null;
  onCerrarSesion: () => void;
}

export function BarraLateral({ vistaActual, onCambiarVista, usuario, onCerrarSesion }: BarraLateralProps) {
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="w-52 min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Usuario */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">{iniciales}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{usuario?.nombre}</p>
            <p className="text-xs text-gray-500 truncate">{usuario?.correo}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon, iconColor, adminOnly, userOnly }) => {
          if (adminOnly && usuario?.rol !== 'admin') return null;
          if (userOnly && usuario?.rol === 'admin') return null;
          
          const activo = vistaActual === id;
          return (
            <button
              key={id}
              onClick={() => onCambiarVista(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                activo
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${activo ? 'text-blue-600' : iconColor}`} />
              <span className="leading-tight">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onCerrarSesion}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}