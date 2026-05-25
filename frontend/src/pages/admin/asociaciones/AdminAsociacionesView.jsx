import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAfiliacionesAsociacion, eliminarAfiliacion } from '../../../api/afiliaciones';
import { API_URL } from '../../../api/config';
import { useAuth } from '../../../context/AuthContext';

export default function AdminAsociacionesView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [asociacion, setAsociacion] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [miAfiliacion, setMiAfiliacion] = useState(null);
  const [modalAbandonarOpen, setModalAbandonarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorToast, setErrorToast] = useState('');

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

      // Se obtienen miembros (solo aprobados)
      const afilRes = await getAfiliacionesAsociacion(id);
      if (afilRes.success) {
        const aprobados = afilRes.data.filter(a => a.estado === 'aprobada');
        setMiembros(aprobados);
        
        // Buscar afiliación del usuario actual
        const currentAfil = afilRes.data.find(a => 
          (a.usuario?._id === user?.id || a.usuario === user?.id) && a.estado === 'aprobada'
        );
        setMiAfiliacion(currentAfil || null);
      }
    } catch (error) {
      setErrorToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandonar = async () => {
    if (!miAfiliacion) return;
    setActionLoading(true);
    try {
      await eliminarAfiliacion(miAfiliacion._id);
      setModalAbandonarOpen(false);
      navigate('/mis-asociaciones', { 
        state: { 
          successMessage: `Se ha retirado de la asociación "${asociacion.nombre}" exitosamente` 
        } 
      });
    } catch (error) {
      setErrorToast(error.message || 'Error al abandonar la asociación');
      setModalAbandonarOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-[#5cc0b6]">Cargando...</div>;
  }

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(user?.role === 'admin' ? '/admin/asociaciones' : '/mis-asociaciones')}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Consulta de Asociación</h1>
            <p className="text-gray-500 text-sm mt-1">Vista detallada y miembros actuales.</p>
          </div>
        </div>
        
      </div>

      {/* Toast de Error */}
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

      {/* Información de la Asociación (Limpia) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Portada / Header Color */}
        <div className="h-32 bg-gradient-to-r from-[#243e7b]/10 to-[#5cc0b6]/10"></div>
        
        <div className="px-6 sm:px-10 pb-10 pt-24 sm:pt-0 relative">
          {/* Logo Flotante */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0 w-32 h-32 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2">
            {asociacion.logo_url ? (
              <img 
                src={asociacion.logo_url} 
                alt={asociacion.nombre} 
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#243e7b] to-[#5cc0b6] rounded-xl flex items-center justify-center text-white text-4xl font-black">
                {asociacion.nombre?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </div>

          {/* Contenido de texto alineado a la derecha del logo en desktop, abajo en mobile */}
          <div className="sm:mt-0 sm:ml-40 pt-4 flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#243e7b] mb-2">{asociacion.nombre}</h1>
              {asociacion.tipo && (
                <span className="inline-block px-3 py-1 bg-teal-50 text-[#5cc0b6] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  {asociacion.tipo}
                </span>
              )}
            </div>

            {/* Botón Abandonar si es miembro */}
            {miAfiliacion && (
              <div className="flex-shrink-0">
                <button
                  onClick={() => setModalAbandonarOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Abandonar asociación
                </button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Sobre Nosotros</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {asociacion.descripcion || 'Esta asociación aún no ha proporcionado una descripción detallada.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-8 border-t border-gray-200 pt-8">
        
        {/* Tabla de Miembros (Solo Lectura) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#243e7b] mb-4">Miembros y Representantes</h3>
          {miembros.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Esta asociación aún no tiene miembros registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 bg-gray-50/50">
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold text-right">Rol en Asociación</th>
                  </tr>
                </thead>
                <tbody>
                  {miembros.map(miembro => (
                    <tr key={miembro._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                      <td className="py-3 px-4 text-right">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${miembro.rol_asociacion === 'representante' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {miembro.rol_asociacion.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal de Abandonar Asociación */}
      {modalAbandonarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideDownModal">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Abandonar asociación?</h3>
                <p className="text-gray-550 mt-2 text-sm leading-relaxed">
                  ¿Está seguro de abandonar esta asociación? Perderá el acceso de miembro a <strong className="text-gray-700">{asociacion?.nombre}</strong>.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setModalAbandonarOpen(false)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button 
                onClick={handleAbandonar}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sí, abandonar'
                )}
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDownModal {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideDownModal {
          animation: slideDownModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  );
}
