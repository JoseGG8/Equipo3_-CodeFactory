import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, MoreVertical } from 'lucide-react';
import { Usuario, obtenerUsuarios } from '../data/usuarios';
import { formatearFechaLarga } from '../utils/formato';

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    setUsuarios(obtenerUsuarios());
  }, []);

  const filtrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const paginados = filtrados.slice((pagina - 1) * itemsPorPagina, pagina * itemsPorPagina);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-sm text-gray-500 mt-0.5">Administra los usuarios registrados en la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 font-medium mb-1">Total Usuarios</p>
            <p className="text-2xl font-bold text-indigo-700">{usuarios.length}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Usuario</th>
                <th className="px-6 py-3 font-medium">Registro</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginados.map((u) => {
                  const isAdmin = u.rol === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{u.nombre}</p>
                            <p className="text-xs text-gray-500">{u.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatearFechaLarga(u.fechaRegistro)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                          {isAdmin ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-medium">{(pagina - 1) * itemsPorPagina + 1}</span> a <span className="font-medium">{Math.min(pagina * itemsPorPagina, filtrados.length)}</span> de <span className="font-medium">{filtrados.length}</span> usuarios
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}