import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AsociacionForm from '../../../components/forms/AsociacionForm';
import { updateAsociacion } from '../../../api/asociaciones';
import { 
  getAfiliacionesAsociacion, 
  responderSolicitud, 
  eliminarAfiliacion, 
  agregarRepresentanteDirecto 
} from '../../../api/afiliaciones';
import { buscarUsuarios } from '../../../api/usuarios';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../api/config';

export default function AdminAsociacionesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [asociacion, setAsociacion] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorToast, setErrorToast] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Buscador de usuarios
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'aceptar', 'rechazar', 'expulsar'
  const [selectedAfiliacion, setSelectedAfiliacion] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (errorToast) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        setErrorToast('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  useEffect(() => {
    if (successToast) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        setSuccessToast('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Se obtienen los datos de la asociación
      const asocRes = await fetch(`${API_URL}/asociaciones`, { credentials: 'include' });
      if (!asocRes.ok) throw new Error('Error al obtener asociación');
      const asocData = await asocRes.json();
      const currentAsoc = asocData.data.find(a => a._id === id);
      if (!currentAsoc) throw new Error('Asociación no encontrada');
      setAsociacion(currentAsoc);

      // Se obtienen miembros y solicitudes
      const afilRes = await getAfiliacionesAsociacion(id);
      if (afilRes.success) {
        const afiliaciones = afilRes.data;
        setMiembros(afiliaciones.filter(a => a.estado === 'aprobada'));
        setSolicitudes(afiliaciones.filter(a => a.estado === 'pendiente'));
      }
    } catch (error) {
      setErrorToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAsociacion = async (formData) => {
    setIsSubmitting(true);
    setErrorToast('');
    try {
      const response = await updateAsociacion(id, formData);
      if (response.success) {
        setSuccessToast(`Se actualizó la asociación exitosamente.`);
        setAsociacion(response.data);
      }
    } catch (error) {
      setErrorToast(error.message || 'Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await buscarUsuarios(searchQuery);
      setSearchResults(res.data || []);
    } catch (error) {
      setErrorToast('Error al buscar usuarios');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRepresentative = async (usuarioId) => {
    if (!window.confirm('¿Añadir a este usuario como representante?')) return;
    try {
      await agregarRepresentanteDirecto(usuarioId, id);
      setSuccessToast('Representante añadido exitosamente');
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      fetchData();
    } catch (error) {
      setErrorToast(error.message);
    }
  };

  const openModal = (action, afiliacion) => {
    setModalAction(action);
    setSelectedAfiliacion(afiliacion);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAfiliacion) return;
    try {
      if (modalAction === 'aceptar') {
        await responderSolicitud(selectedAfiliacion._id, 'aprobada');
        setSuccessToast('Solicitud aprobada.');
      } else if (modalAction === 'rechazar') {
        await responderSolicitud(selectedAfiliacion._id, 'rechazada');
        setSuccessToast('Solicitud rechazada.');
      } else if (modalAction === 'expulsar') {
        await eliminarAfiliacion(selectedAfiliacion._id);
        setSuccessToast('Miembro eliminado de la asociación.');
      }
      fetchData();
    } catch (error) {
      setErrorToast(error.message);
    } finally {
      setModalOpen(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-[#5cc0b6]">Cargando...</div>;
  }

  return (
    <>
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate(user?.role === 'admin' ? '/admin/asociaciones' : '/mis-asociaciones')}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Editar Asociación</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los detalles, miembros y solicitudes.</p>
        </div>
      </div>

      {/* Toasts */}
      {errorToast && (
        <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-r-lg p-4 flex items-center justify-between mb-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-lg font-bold">!</span>
            </div>
            <p className="text-gray-800 font-medium text-sm">{errorToast}</p>
          </div>
          <button 
            onClick={() => setErrorToast('')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {successToast && (
        <div className="bg-green-50 border-l-4 border-green-800 shadow-lg rounded-r-lg p-4 flex items-center justify-between mb-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-bold text-sm">{successToast}</p>
          </div>
          <button 
            onClick={() => setSuccessToast('')}
            className="text-green-800 hover:text-green-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Formulario Principal */}
      <AsociacionForm 
        initialData={asociacion}
        onSubmit={handleUpdateAsociacion}
        onCancel={() => navigate(user?.role === 'admin' ? '/admin/asociaciones' : '/mis-asociaciones')}
        isSubmitting={isSubmitting}
        submitText="Actualizar Datos"
      />

      <div className="mt-12 space-y-8 border-t border-gray-200 pt-8">
        
        {/* Sección: Buscar y Añadir Representante (Solo Admin Global) */}
        {user?.role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#243e7b] mb-4">Añadir Representante</h3>
            <form onSubmit={handleSearchUser} className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por correo o nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    setHasSearched(false);
                    setSearchResults([]);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] outline-none"
              />
              <button 
                type="submit" 
                disabled={isSearching}
                title="Buscar"
                className="bg-[#243e7b] hover:bg-[#1a2f60] text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-100 rounded-xl divide-y divide-gray-100">
                {searchResults.map(u => (
                  <div key={u._id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-150 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {u.foto_perfil ? (
                          <img src={u.foto_perfil} alt={u.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-extrabold text-gray-500">{getInitials(u.nombre)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.nombre}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddRepresentative(u._id)}
                      className="text-[#5cc0b6] hover:text-[#4ab0a6] font-bold text-sm bg-teal-50 px-3 py-1 rounded-lg"
                    >
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            )}
            {hasSearched && searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-gray-500 mt-2">No se encontraron usuarios que coincidan con la búsqueda.</p>
            )}
          </div>
        )}

        {/* Tabla de Solicitudes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#243e7b] mb-4">Solicitudes Pendientes</h3>
          {solicitudes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No hay solicitudes pendientes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Fecha Solicitud</th>
                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map(solicitud => (
                    <tr key={solicitud._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-150 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                            {solicitud.usuario?.foto_perfil ? (
                              <img src={solicitud.usuario.foto_perfil} alt={solicitud.usuario.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-extrabold text-gray-500">{getInitials(solicitud.usuario?.nombre)}</span>
                            )}
                          </div>
                          <span className="text-gray-800 font-medium">{solicitud.usuario?.nombre || 'Desconocido'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{solicitud.usuario?.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(solicitud.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button 
                          onClick={() => openModal('aceptar', solicitud)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Aceptar
                        </button>
                        <button 
                          onClick={() => openModal('rechazar', solicitud)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tabla de Miembros */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#243e7b] mb-4">Miembros y Representantes</h3>
          {miembros.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No hay miembros aprobados aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Rol</th>
                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {miembros.map(miembro => (
                    <tr key={miembro._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-150 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                            {miembro.usuario?.foto_perfil ? (
                              <img src={miembro.usuario.foto_perfil} alt={miembro.usuario.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-extrabold text-gray-500">{getInitials(miembro.usuario?.nombre)}</span>
                            )}
                          </div>
                          <span className="text-gray-800 font-medium">{miembro.usuario?.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{miembro.usuario?.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${miembro.rol_asociacion === 'representante' ? 'bg-[#243e7b] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {miembro.rol_asociacion.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* Permitir expulsar solo si el que expulsa es admin global o es un representante expulsando a un miembro */}
                        {(user?.role === 'admin' || (miembro.rol_asociacion === 'miembro' && user?.id !== miembro.usuario?._id)) && (
                          <button 
                            onClick={() => openModal('expulsar', miembro)}
                            className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1"
                          >
                            Expulsar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>

      {/* Modal de Confirmación */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                modalAction === 'aceptar' 
                  ? 'bg-green-100 text-green-600' 
                  : modalAction === 'expulsar' 
                    ? 'bg-red-100 text-red-500' 
                    : 'bg-yellow-100 text-yellow-500'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {modalAction === 'aceptar' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  )}
                </svg>
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">
                {modalAction === 'aceptar' && '¿Aceptar solicitud?'}
                {modalAction === 'rechazar' && '¿Rechazar solicitud?'}
                {modalAction === 'expulsar' && '¿Expulsar miembro?'}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {modalAction === 'aceptar' && (
                  <>¿Estás seguro de aceptar la solicitud de afiliación de <strong className="text-gray-700">{selectedAfiliacion?.usuario?.nombre}</strong>?</>
                )}
                {modalAction === 'rechazar' && (
                  <>¿Estás seguro de rechazar la solicitud de afiliación de <strong className="text-gray-700">{selectedAfiliacion?.usuario?.nombre}</strong>?</>
                )}
                {modalAction === 'expulsar' && (
                  <>¿Estás seguro de que deseas expulsar a <strong className="text-gray-700">{selectedAfiliacion?.usuario?.nombre}</strong> de la asociación? <span className="text-red-500 font-semibold block mt-1">Esta acción es definitiva y perderá su afiliación.</span></>
                )}
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAction}
                className={`px-4 py-2 rounded-xl font-bold text-white transition-colors shadow-sm ${
                  modalAction === 'aceptar' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
