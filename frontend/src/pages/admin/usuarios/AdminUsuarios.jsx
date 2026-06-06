import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getTodosUsuarios, updateRolUsuario, deleteUsuario } from '../../../api/usuarios';

export default function AdminUsuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('todos');
  const [toast, setToast] = useState({ type: '', message: '' });

  // Modales
  const [detailModal, setDetailModal] = useState({ open: false, user: null });
  const [roleModal, setRoleModal] = useState({ open: false, userId: null, userName: '', currentRole: '', newRole: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });

  // Peticiones
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getTodosUsuarios(''); // Obtiene todos los registros
      if (res.success) {
        setUsuarios(res.data || []);
      }
    } catch (error) {
      showToast('error', error.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usr => {
      // Texto (nombre o email)
      const matchText = (usr.nombre + ' ' + usr.email).toLowerCase();
      const cumpleBusqueda = matchText.includes(searchQuery.toLowerCase());
      
      // Filtro Rol
      const cumpleRol = filterRole === 'todos' || usr.role === filterRole;
      
      // Filtro Fecha
      let cumpleFecha = true;
      if (filterFecha !== 'todos') {
        const fechaReg = new Date(usr.createdAt);
        const hoy = new Date();
        if (filterFecha === 'hoy') {
          cumpleFecha = fechaReg.toDateString() === hoy.toDateString();
        } else if (filterFecha === 'mes') {
          const unMesAtras = new Date();
          unMesAtras.setMonth(hoy.getMonth() - 1);
          cumpleFecha = fechaReg >= unMesAtras;
        } else if (filterFecha === 'ano') {
          const unAnoAtras = new Date();
          unAnoAtras.setFullYear(hoy.getFullYear() - 1);
          cumpleFecha = fechaReg >= unAnoAtras;
        }
      }

      return cumpleBusqueda && cumpleRol && cumpleFecha;
    });
  }, [usuarios, searchQuery, filterRole, filterFecha]);

  const handleOpenRoleModal = (userToModify, targetRole) => {
    if (userToModify._id === currentUser.id) {
      showToast('error', 'No puedes cambiar tu propio rol administrativo');
      return;
    }
    setRoleModal({
      open: true,
      userId: userToModify._id,
      userName: userToModify.nombre,
      currentRole: userToModify.role,
      newRole: targetRole
    });
  };

  const handleConfirmRoleChange = async () => {
    try {
      const res = await updateRolUsuario(roleModal.userId, roleModal.newRole);
      if (res.success) {
        showToast('success', `Rol de ${roleModal.userName} cambiado a ${roleModal.newRole === 'admin' ? 'Administrador' : 'Usuario'}`);
        // Actualizar la lista local
        setUsuarios(prev => prev.map(u => u._id === roleModal.userId ? { ...u, role: roleModal.newRole } : u));
      }
    } catch (error) {
      showToast('error', error.message || 'Error al actualizar el rol');
    } finally {
      setRoleModal({ open: false, userId: null, userName: '', currentRole: '', newRole: '' });
    }
  };

  const handleOpenDeleteModal = (userToDelete) => {
    if (userToDelete._id === currentUser.id) {
      showToast('error', 'No puedes eliminar tu propio usuario');
      return;
    }
    setDeleteModal({
      open: true,
      userId: userToDelete._id,
      userName: userToDelete.nombre
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteUsuario(deleteModal.userId);
      if (res.success) {
        showToast('success', `Usuario ${deleteModal.userName} eliminado con éxito`);
        setUsuarios(prev => prev.filter(u => u._id !== deleteModal.userId));
      }
    } catch (error) {
      showToast('error', error.message || 'Error al eliminar usuario');
    } finally {
      setDeleteModal({ open: false, userId: null, userName: '' });
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <>
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* COMPONENTE DE CONTROL (BUSCADOR Y FILTROS) */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#243e7b]">Panel de Usuarios</h2>
            <p className="text-gray-500 text-sm mt-1">Supervisa las cuentas, administra roles globales y visualiza perfiles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre o correo electrónico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario Regular</option>
          </select>
          
          <select
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
          >
            <option value="todos">Cualquier fecha</option>
            <option value="hoy">Registrados Hoy</option>
            <option value="mes">Último mes</option>
            <option value="ano">Último año</option>
          </select>

        </div>

        <div className="text-xs font-semibold text-gray-400 pt-1">
          Mostrando <span className="text-[#243e7b]">{usuariosFiltrados.length}</span> de <span className="text-gray-600">{usuarios.length}</span> usuarios registrados
        </div>
      </div>

      {/* Listado de usuarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-[#5cc0b6] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Buscando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-medium">
            <p>No se encontraron usuarios que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto">
              <thead className="bg-gray-50/70 sticky top-0 backdrop-blur-xs border-b border-gray-100 z-10">
                <tr>
                  <th className="py-4 px-4 md:px-6 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Usuario</th>
                  <th className="hidden sm:table-cell py-4 px-4 md:px-6 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Email</th>
                  <th className="hidden md:table-cell py-4 px-4 md:px-6 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Rol</th>
                  <th className="hidden lg:table-cell py-4 px-4 md:px-6 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Registro</th>
                  <th className="py-4 px-4 md:px-6 text-xs font-bold text-[#243e7b] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#243e7b]">
                {usuariosFiltrados.map((usr) => {
                  const isSelf = usr._id === currentUser.id;
                  return (
                    <tr key={usr._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                            {usr.foto_perfil ? (
                              <img src={usr.foto_perfil} alt={usr.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-gray-400">{getInitials(usr.nombre)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[200px]">
                              {usr.nombre}
                              {isSelf && (
                                <span className="bg-gray-150 text-gray-600 text-2xs px-1.5 py-0.5 rounded font-black uppercase">Tú</span>
                              )}
                            </p>
                            <div className="sm:hidden text-[10px] text-gray-400 mt-1 truncate max-w-[150px]">
                              {usr.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-gray-600 font-medium">{usr.email}</td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4">
                        {isSelf ? (
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">
                            Administrador
                          </span>
                        ) : (
                          <select
                            value={usr.role}
                            onChange={(e) => handleOpenRoleModal(usr, e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-2.5 outline-none focus:border-[#5cc0b6] transition cursor-pointer"
                          >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                          </select>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-4 md:px-6 py-4 text-gray-400 text-xs">
                        {new Date(usr.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-1.5">
                          <button
                            onClick={() => setDetailModal({ open: true, user: usr })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#243e7b] hover:bg-gray-100 transition-all"
                            title="Ver Perfil Detallado"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          
                          <button
                            onClick={() => handleOpenDeleteModal(usr)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg transition-all ${isSelf ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            title={isSelf ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>

    {/* Toast Alert Centrado Arriba */}
    {toast.message && (
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-xl shadow-xl border-l-4 flex items-center justify-between gap-4 animate-slideDown bg-white border border-gray-150/70 w-max max-w-md ${
        toast.type === 'success' ? 'border-l-green-500 text-green-800' : 'border-l-red-500 text-red-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold flex-shrink-0 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <p className="text-sm font-bold whitespace-nowrap">{toast.message}</p>
        </div>
        <button onClick={() => setToast({ type: '', message: '' })} className="text-gray-400 hover:text-gray-600 text-base leading-none">
          &times;
        </button>
      </div>
    )}

    {/* Modal 1: Detalles del Usuario */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slideDown relative">
            <button
              onClick={() => setDetailModal({ open: false, user: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mb-6 mt-2">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                {detailModal.user.foto_perfil ? (
                  <img src={detailModal.user.foto_perfil} alt={detailModal.user.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{getInitials(detailModal.user.nombre)}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#243e7b]">{detailModal.user.nombre}</h3>
                <p className="text-sm text-gray-500 font-medium">{detailModal.user.email}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-semibold ${
                  detailModal.user.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {detailModal.user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <span className="block text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Teléfono</span>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {detailModal.user.telefono || <span className="text-gray-450 font-normal italic">No especificado</span>}
                </p>
              </div>

              <div>
                <span className="block text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Residencia</span>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {detailModal.user.residencia || <span className="text-gray-450 font-normal italic">No especificado</span>}
                </p>
              </div>

              <div>
                <span className="block text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Miembro Desde</span>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {new Date(detailModal.user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailModal({ open: false, user: null })}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmar Cambio de Rol */}
      {roleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideDown">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Confirmar cambio de rol?</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  ¿Estás seguro de cambiar el rol de <strong className="text-gray-700">{roleModal.userName}</strong> de{' '}
                  <span className="font-semibold">{roleModal.currentRole === 'admin' ? 'Administrador' : 'Usuario'}</span> a{' '}
                  <span className="font-semibold">{roleModal.newRole === 'admin' ? 'Administrador' : 'Usuario'}</span>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setRoleModal({ open: false, userId: null, userName: '', currentRole: '', newRole: '' })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                No, cancelar
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#5cc0b6] hover:bg-[#4bb0a6] transition-colors shadow-sm hover:shadow-md"
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Confirmar Eliminación en Cascades */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideDown">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar usuario definitivamente?</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  ¿Estás seguro de eliminar permanentemente a <strong className="text-gray-700">{deleteModal.userName}</strong>?{' '}
                  <span className="text-red-500 font-semibold block mt-1">Esta acción no se puede deshacer y eliminará todas sus afiliaciones.</span>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                No, cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS Inline de Micro-animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideDownModal {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDownModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
