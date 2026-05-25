import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAsociacionById } from '../../../api/asociaciones';
import { 
  solicitarAfiliacion, 
  getMisAsociaciones, 
  eliminarAfiliacion,
  getAfiliacionesAsociacion
} from '../../../api/afiliaciones';

export default function AsociacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [asociacion, setAsociacion] = useState(null);
  const [miAfiliacion, setMiAfiliacion] = useState(null);
  const [miembros, setMiembros] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [afiliacionLoading, setAfiliacionLoading] = useState(true);
  const [miembrosLoading, setMiembrosLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de UI
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [modalSolicitudOpen, setModalSolicitudOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalAbandonarOpen, setModalAbandonarOpen] = useState(false);

  // Cargar datos de la asociación
  const fetchAsociacion = async () => {
    try {
      setLoading(true);
      const res = await getAsociacionById(id);
      setAsociacion(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información de la asociación.');
    } finally {
      setLoading(false);
    }
  };

  // Revisar si el usuario ya tiene una afiliación
  const checkAfiliacion = async () => {
    try {
      setAfiliacionLoading(true);
      const res = await getMisAsociaciones();
      const misAfil = res.data || [];
      const currentAfiliacion = misAfil.find(a => 
        (a.asociacion._id || a.asociacion) === id
      );
      setMiAfiliacion(currentAfiliacion || null);
      
      // Si está aprobada, cargar los miembros
      if (currentAfiliacion && currentAfiliacion.estado === 'aprobada') {
        fetchMiembros();
      }
    } catch (err) {
      console.error('Error al revisar afiliaciones:', err);
    } finally {
      setAfiliacionLoading(false);
    }
  };

  // Cargar miembros si el usuario tiene permiso (es miembro aprobado)
  const fetchMiembros = async () => {
    try {
      setMiembrosLoading(true);
      const res = await getAfiliacionesAsociacion(id);
      // Se filtran solo los aprobados para la vista pública de miembros
      const aprobados = (res.data || []).filter(m => m.estado === 'aprobada');
      setMiembros(aprobados);
    } catch (err) {
      console.error('Error al cargar miembros:', err);
    } finally {
      setMiembrosLoading(false);
    }
  };

  useEffect(() => {
    fetchAsociacion();
    checkAfiliacion();
  }, [id]);

  useEffect(() => {
    if (toast.message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        setToast({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  // Manejadores de acciones
  const handleSolicitar = async () => {
    try {
      setActionLoading(true);
      await solicitarAfiliacion(id);
      setToast({ type: 'success', message: '¡Solicitud enviada exitosamente! Estamos a la espera de su revisión.' });
      setModalSolicitudOpen(false);
      await checkAfiliacion(); // Recargar estado
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al solicitar membresía' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!miAfiliacion) return;
    try {
      setActionLoading(true);
      await eliminarAfiliacion(miAfiliacion._id);
      setToast({ type: 'success', message: 'Tu solicitud ha sido cancelada.' });
      setModalCancelarOpen(false);
      await checkAfiliacion(); // Recargar estado
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al cancelar la solicitud' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbandonar = async () => {
    if (!miAfiliacion) return;
    try {
      setActionLoading(true);
      await eliminarAfiliacion(miAfiliacion._id);
      setModalAbandonarOpen(false);
      navigate('/mis-asociaciones', { 
        state: { 
          successMessage: `Se ha retirado de la asociación "${asociacion.nombre}" exitosamente` 
        } 
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al abandonar la asociación' });
      setModalAbandonarOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const getCooldownStatus = () => {
    if (!miAfiliacion || miAfiliacion.estado !== 'rechazada') return { active: false, remainingHours: 0 };
    const ahora = new Date();
    const fechaRechazo = new Date(miAfiliacion.updatedAt);
    const diferenciaHoras = (ahora - fechaRechazo) / (1000 * 60 * 60);
    const remainingHours = Math.ceil(24 - diferenciaHoras);
    return {
      active: diferenciaHoras < 24,
      remainingHours: remainingHours > 0 ? remainingHours : 0
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  if (error || !asociacion) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops</h2>
          <p className="text-gray-500">{error || 'Asociación no encontrada'}</p>
          <button 
            onClick={() => navigate('/asociaciones')}
            className="mt-6 px-6 py-2 bg-[#243e7b] text-white rounded-lg font-medium"
          >
            Volver a Asociaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Botón Volver */}
        <button 
          onClick={() => navigate('/asociaciones')}
          className="flex items-center text-gray-500 hover:text-[#243e7b] transition-colors font-medium mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la lista
        </button>

        {/* Toast Alert del largo de la caja y encima de la caja */}
        {toast.message && (
          <div className={`border-l-4 shadow-lg rounded-r-lg p-4 flex items-center justify-between mb-6 animate-fadeIn ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-800 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-green-800' : 'bg-red-500'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-lg font-bold">!</span>
                )}
              </div>
              <p className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast({ type: '', message: '' })}
              className={`transition-colors ${toast.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-905'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Tarjeta Principal de Información */}
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
                  {asociacion.nombre.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Contenido de texto alineado a la derecha del logo en desktop, abajo en mobile */}
            <div className="sm:mt-0 sm:ml-40 pt-4 flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#243e7b] mb-2">{asociacion.nombre}</h1>
                {asociacion.categoria && (
                  <span className="inline-block px-3 py-1 bg-teal-50 text-[#5cc0b6] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    {asociacion.categoria}
                  </span>
                )}
              </div>

              {/* Zona de Botón de Afiliación */}
              {!afiliacionLoading && (
                <div className="flex-shrink-0">
                  {!miAfiliacion ? (
                    <button
                      onClick={() => setModalSolicitudOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-[#5cc0b6] hover:bg-[#4aa89e] text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Solicitar ser miembro
                    </button>
                  ) : miAfiliacion.estado === 'pendiente' ? (
                    <button
                      onClick={() => setModalCancelarOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar solicitud
                    </button>
                  ) : miAfiliacion.estado === 'aprobada' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="px-6 py-3 bg-[#243e7b]/10 text-[#243e7b] rounded-xl font-bold border border-[#243e7b]/20 flex items-center justify-center w-full sm:w-auto">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Eres {miAfiliacion.rol_asociacion === 'representante' ? 'Representante' : 'Miembro'}
                      </div>
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
                  ) : (
                    // Si es rechazada
                    <div className="flex flex-col items-center sm:items-end gap-2">
                      {getCooldownStatus().active ? (
                        <>
                          <div className="px-6 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold flex items-center justify-center cursor-not-allowed">
                            Solicitud Rechazada
                          </div>
                          <span className="text-2xs font-semibold text-gray-400">
                            Podrás volver a postularte en {getCooldownStatus().remainingHours} {getCooldownStatus().remainingHours === 1 ? 'hora' : 'horas'}
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => setModalSolicitudOpen(true)}
                          className="w-full sm:w-auto px-6 py-3 bg-[#5cc0b6] hover:bg-[#4aa89e] text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Volver a solicitar
                        </button>
                      )}
                    </div>
                  )}
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

        {/* Lista de Miembros (Solo visible para miembros aprobados) */}
        {miAfiliacion?.estado === 'aprobada' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <h3 className="text-xl font-bold text-[#243e7b] mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Miembros de la Asociación
            </h3>

            {miembrosLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5cc0b6]"></div>
              </div>
            ) : miembros.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {miembros.map((miembro) => (
                  <div key={miembro._id} className="flex items-center p-4 border border-gray-100 rounded-2xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-[#243e7b] text-white overflow-hidden flex items-center justify-center font-bold text-lg mr-3 shrink-0">
                      {miembro.usuario?.foto_perfil ? (
                        <img 
                          src={miembro.usuario.foto_perfil} 
                          alt={miembro.usuario.nombre || 'Usuario'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        miembro.usuario?.nombre?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 truncate" title={miembro.usuario?.nombre}>
                        {miembro.usuario?.nombre || 'Usuario Desconocido'}
                      </p>
                      <p className="text-xs text-[#5cc0b6] font-medium uppercase tracking-wide">
                        {miembro.rol_asociacion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">Aún no hay miembros registrados en esta asociación.</p>
            )}
          </div>
        )}

      </main>

      {/* Modal de Solicitud */}
      {modalSolicitudOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideDownModal">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-teal-50 text-[#5cc0b6] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Unirse a la asociación?</h3>
                <p className="text-gray-550 mt-2 text-sm leading-relaxed">
                  ¿Estás seguro que deseas solicitar ser miembro de <strong className="text-gray-700">{asociacion.nombre}</strong>?<br/>
                  Tu solicitud será revisada por un representante de la asociación.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setModalSolicitudOpen(false)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button 
                onClick={handleSolicitar}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#5cc0b6] hover:bg-[#4aa89e] transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sí, solicitar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelar Solicitud */}
      {modalCancelarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideDownModal">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Cancelar solicitud?</h3>
                <p className="text-gray-550 mt-2 text-sm leading-relaxed">
                  ¿Estás seguro de cancelar tu solicitud pendiente para unirte a <strong className="text-gray-700">{asociacion.nombre}</strong>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setModalCancelarOpen(false)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, volver
              </button>
              <button 
                onClick={handleCancelar}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sí, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  ¿Está seguro de abandonar esta asociación? Perderá el acceso de miembro a <strong className="text-gray-700">{asociacion.nombre}</strong>.
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

      {/* Estilos CSS Inline de Micro-animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDownToast {
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
        .animate-slideDownToast {
          animation: slideDownToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideDownModal {
          animation: slideDownModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
