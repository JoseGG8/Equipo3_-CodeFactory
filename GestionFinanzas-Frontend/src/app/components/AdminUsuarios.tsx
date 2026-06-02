import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { desactivarUsuarioApi, listarUsuariosApi } from '../services/api';
import { Usuario, obtenerUsuarios as obtenerUsuariosLocales } from '../data/usuarios';
import { formatearFechaLarga } from '../utils/formato';

export function AdminUsuarios() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const itemsPorPagina = 5;

  useEffect(() => {
    const cargarUsuarios = async () => {
      if (!usuario) {
        setUsuarios([]);
        return;
      }

      if (usuario.rol !== 'admin') {
        setError('Acceso denegado: Solo los administradores pueden ver esta página.');
        setUsuarios([]);
        return;
      }

      const adminId = Number(usuario.id);
      if (!Number.isFinite(adminId)) {
        setError('ID de administrador inválido.');
        setUsuarios([]);
        return;
      }

      setCargando(true);
      setError(null);
      setWarning(null);

      try {
        const pageResult = await listarUsuariosApi(adminId, 0, 100);
        const usuariosApi = pageResult.content || [];

        if (usuariosApi.length === 0) {
          const locales = obtenerUsuariosLocales();
          if (locales.length > 0) {
            setWarning(
              'No se encontraron usuarios en el backend. Se muestran registros locales almacenados en el navegador.'
            );
            setUsuarios(locales);
            setPagina(1);
            return;
          }
        }

        setUsuarios(
          usuariosApi.map((u) => ({
            id: String(u.id),
            nombre: u.nombre,
            correo: u.email,
            contraseña: '',
            fechaRegistro: new Date().toISOString().split('T')[0],
            rol: u.rol?.toLowerCase() === 'admin' ? 'admin' : 'usuario',
            activo: u.activo !== false,
          }))
        );
        setPagina(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la lista de usuarios.');
      } finally {
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, [usuario]);

  if (!usuario || usuario.rol !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-white shadow-sm border border-red-100 p-8">
        <div className="text-red-700 text-lg font-semibold mb-2">Acceso denegado</div>
        <p className="text-sm text-gray-600">
          Solo los administradores pueden acceder a este panel de gestión de usuarios.
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-white shadow-sm border border-blue-100 p-8">
        <div className="text-blue-700 text-lg font-semibold mb-2">Cargando usuarios...</div>
        <p className="text-sm text-gray-600">Por favor espera mientras se carga la lista de usuarios.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-white shadow-sm border border-amber-100 p-8">
        <div className="text-amber-700 text-lg font-semibold mb-2">No se pudo cargar la lista</div>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const filtrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const paginados = filtrados.slice((pagina - 1) * itemsPorPagina, pagina * itemsPorPagina);

  const handleDesactivarUsuario = async (usuarioToDeactivate: Usuario) => {
    if (!usuarioToDeactivate || !usuarioToDeactivate.id || !usuario) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que quieres desactivar la cuenta de ${usuarioToDeactivate.nombre}? Esta acción no se podrá deshacer.`
    );
    if (!confirmar) {
      return;
    }

    const adminId = Number(usuario.id);
    const userId = Number(usuarioToDeactivate.id);
    if (!Number.isFinite(adminId) || !Number.isFinite(userId)) {
      setError('ID de usuario inválido.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const updated = await desactivarUsuarioApi(adminId, userId);
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === String(updated.id)
            ? { ...u, activo: updated.activo !== false }
            : u
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado de la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-sm text-gray-500 mt-0.5">Administra los usuarios registrados en la plataforma</p>
      </div>

      {warning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warning}
        </div>
      )}

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
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
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
                        {u.fechaRegistro ? formatearFechaLarga(u.fechaRegistro) : 'Sin fecha'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                          {isAdmin ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDesactivarUsuario(u)}
                          disabled={!u.activo}
                          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${u.activo ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
                        >
                          {u.activo ? 'Desactivar' : 'Desactivado'}
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