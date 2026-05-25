import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMisAsociaciones } from '../../api/afiliaciones';

export default function MisAsociaciones() {
  const navigate = useNavigate();
  const location = useLocation();
  const [misAsociaciones, setMisAsociaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchAsociaciones();
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessToast(location.state.successMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        setSuccessToast('');
        navigate('/mis-asociaciones', { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const fetchAsociaciones = async () => {
    setLoading(true);
    try {
      const res = await getMisAsociaciones();
      if (res.success) {
        setMisAsociaciones(res.data);
      }
    } catch (error) {
      console.error("Error cargando asociaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#5cc0b6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando tus asociaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn relative">
      
      {/* Toast de Éxito */}
      {successToast && (
        <div className="bg-green-50 border-l-4 border-green-800 shadow-lg rounded-r-lg p-4 flex items-center justify-between animate-fade-in-down mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-bold text-sm">{successToast}</p>
          </div>
          <button
            onClick={() => {
              setSuccessToast('');
              navigate('/mis-asociaciones', { replace: true, state: {} });
            }}
            className="text-green-800 hover:text-green-900 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Mis Asociaciones</h1>
        <p className="text-gray-500 text-sm mt-1">Consulta tus asociaciones e historial de solicitudes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden mt-6">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#9ce694]"></div>
        
        {misAsociaciones.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-bold text-lg">Aún no tienes asociaciones ni solicitudes.</p>
            <p className="text-sm text-gray-400 mt-2">Explora la sección de asociaciones para unirte a una.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {misAsociaciones.map((afiliacion) => (
              <div key={afiliacion._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-50 shadow-sm flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {afiliacion.asociacion?.logo_url ? (
                        <img src={afiliacion.asociacion.logo_url} alt={afiliacion.asociacion.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-gray-400">
                          {afiliacion.asociacion?.nombre?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#243e7b] text-base truncate" title={afiliacion.asociacion?.nombre}>
                        {afiliacion.asociacion?.nombre || 'Asociación Desconocida'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        Fecha: {new Date(afiliacion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Estado Solicitud</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        afiliacion.estado === 'aprobada' ? 'bg-[#9ce694]/20 text-green-700' :
                        afiliacion.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {afiliacion.estado.charAt(0).toUpperCase() + afiliacion.estado.slice(1)}
                      </span>
                    </div>

                    {afiliacion.estado === 'aprobada' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Rol</span>
                        <span className="text-sm font-bold text-gray-700">
                          {afiliacion.rol_asociacion === 'representante' ? 'Representante' : 'Miembro'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones si está aprobada */}
                {afiliacion.estado === 'aprobada' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(afiliacion.rol_asociacion === 'representante' ? `/asociaciones/edit/${afiliacion.asociacion._id}` : `/asociaciones/view/${afiliacion.asociacion._id}`)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 ${
                        afiliacion.rol_asociacion === 'representante' 
                          ? 'bg-[#243e7b] hover:bg-[#1a2f60] text-white' 
                          : 'bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white'
                      }`}
                    >
                      {afiliacion.rol_asociacion === 'representante' ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Gestionar Asociación
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Consultar Asociación
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
