import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAsociaciones, deleteAsociacion, toggleAsociacionStatus } from '../../../api/asociaciones';

export default function AdminAsociaciones() {
  const [asociaciones, setAsociaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de los Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Estados y Hooks para redirecciones y notificaciones
  const location = useLocation();
  const navigate = useNavigate();
  const [successToast, setSuccessToast] = useState('');

  // Manejar el Toast de éxito desde location.state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessToast(location.state.successMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const timer = setTimeout(() => {
        setSuccessToast('');
        navigate('/admin/asociaciones', { replace: true, state: {} });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Estados para Eliminar y Alternar Estado
  const [asociacionToDelete, setAsociacionToDelete] = useState(null);
  const [asociacionToToggle, setAsociacionToToggle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Cargar datos desde el Backend al montar el componente
  const fetchAsociaciones = async () => {
    setLoading(true);
    try {
      const res = await getAsociaciones();
      setAsociaciones(res.data || []);
    } catch (err) {
      console.error('Error al cargar asociaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsociaciones();
  }, []);

  // Función para confirmar y ejecutar la eliminación
  const handleDelete = async () => {
    if (!asociacionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAsociacion(asociacionToDelete._id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccessToast(`Se ha eliminado la asociación "${asociacionToDelete.nombre}" exitosamente`);
      
      setAsociacionToDelete(null);
      fetchAsociaciones(); // Recargar tabla
      
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para alternar el estado (activo/inactivo)
  const handleToggleStatus = async () => {
    if (!asociacionToToggle) return;
    setIsToggling(true);
    try {
      const res = await toggleAsociacionStatus(asociacionToToggle._id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const nuevoEstado = res.data.activa ? "activada" : "desactivada";
      setSuccessToast(`Se ha ${nuevoEstado} la asociación "${asociacionToToggle.nombre}" exitosamente`);
      
      setAsociacionToToggle(null);
      fetchAsociaciones(); // Recargar tabla
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsToggling(false);
    }
  };

  // LÓGICA DE KPIs (Métricas Globales del Sistema)
  const kpis = useMemo(() => {
    return {
      total: asociaciones.length,
      activas: asociaciones.filter(a => a.activa).length,
      inactivas: asociaciones.filter(a => !a.activa).length
    };
  }, [asociaciones]);

  // MOTOR DE BÚSQUEDA Y FILTRADO EN TIEMPO REAL
  const asociacionesFiltradas = useMemo(() => {
    return asociaciones.filter((asociacion) => {
      const matchText = (
        asociacion.nombre + ' ' +
        (asociacion.descripcion || '')
      ).toLowerCase();

      const cumpleBusqueda = matchText.includes(searchQuery.toLowerCase());
      const cumpleEstado = filterEstado === 'todos' 
        ? true 
        : filterEstado === 'activas' ? asociacion.activa : !asociacion.activa;

      return cumpleBusqueda && cumpleEstado;
    });
  }, [asociaciones, searchQuery, filterEstado]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Toast de Éxito Superior */}
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
              navigate('/admin/asociaciones', { replace: true, state: {} });
            }}
            className="text-green-800 hover:text-green-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ================= SECCIÓN DE KPIs ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Asociaciones</h3>
          <p className="text-3xl font-black text-[#243e7b] mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Asociaciones Activas</h3>
          <p className="text-3xl font-black text-[#5cc0b6] mt-1">{kpis.activas}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Asociaciones Inactivas</h3>
          <p className="text-3xl font-black text-gray-500 mt-1">{kpis.inactivas}</p>
        </div>
      </div>

      {/* ================= COMPONENTE DE CONTROL (BUSCADOR Y FILTROS) ================= */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#243e7b]">Panel de Asociaciones</h2>
          
          {/* Botón Nueva Asociación */}
          <button 
            onClick={() => navigate('/admin/asociaciones/new')}
            className="flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer text-sm self-end lg:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Crear Asociación
          </button>
        </div>

        {/* Formulario/Barra Grid de Criterios en Tiempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          
          {/* Input de Texto Global */}
          <div className="relative lg:col-span-3">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Selector de Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
          >
            <option value="todos">Todos los estados</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
        </div>

        {/* Indicador de Resultados Muestreo */}
        <div className="text-xs font-semibold text-gray-400 pt-1">
          Mostrando <span className="text-[#243e7b]">{asociacionesFiltradas.length}</span> de <span className="text-gray-600">{asociaciones.length}</span> resultados registrados
        </div>
      </div>

      {/* ================= SECCIÓN TABLA ================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto">
            
            {/* Cabecera Fija */}
            <thead className="bg-gray-50 sticky top-0 border-b border-gray-100 z-10">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Asociación</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Descripción</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Estado</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            
            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {asociacionesFiltradas.length > 0 ? (
                asociacionesFiltradas.map((asociacion) => {
                  return (
                    <tr
                      key={asociacion._id}
                      className="transition-all relative hover:bg-gray-50/80"
                    >
                      {/* Asociación */}
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {asociacion.logo_url ? (
                            <img src={asociacion.logo_url} alt={asociacion.nombre} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#5cc0b6]/20 flex items-center justify-center text-[#5cc0b6] font-bold border border-[#5cc0b6]/30">
                              {asociacion.nombre.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[200px]" title={asociacion.nombre}>
                              {asociacion.nombre}
                            </div>
                            <div className="sm:hidden text-[10px] text-gray-400 mt-1">
                              {asociacion.activa ? 'Activa' : 'Inactiva'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Descripción */}
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <p className="text-xs text-gray-500 truncate max-w-[250px] lg:max-w-[400px]" title={asociacion.descripcion}>
                          {asociacion.descripcion || 'Sin descripción'}
                        </p>
                      </td>
                      
                      {/* Estado */}
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => setAsociacionToToggle(asociacion)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              asociacion.activa ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            title={asociacion.activa ? 'Desactivar Asociación' : 'Activar Asociación'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                asociacion.activa ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${asociacion.activa ? 'text-blue-600' : 'text-gray-400'}`}>
                            {asociacion.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-1.5">
                          <button 
                            title="Consultar Asociación" 
                            onClick={() => navigate(`/admin/asociaciones/view/${asociacion._id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#243e7b] hover:bg-gray-100 transition-all"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>

                          <button 
                            title="Editar Detalles" 
                            onClick={() => navigate(`/admin/asociaciones/edit/${asociacion._id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>

                          <button 
                            title="Eliminar Registro" 
                            onClick={() => setAsociacionToDelete(asociacion)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400 font-medium">
                    No se encontraron asociaciones que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>

      {/* ================= MODAL DE ELIMINACIÓN ================= */}
      {asociacionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar Asociación?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de eliminar la asociación <strong className="text-gray-700">"{asociacionToDelete.nombre}"</strong>? Esta acción no se puede deshacer.
                </p>
                <p className="text-xs text-red-500 mt-2 italic">
                  Recuerda que no podrás eliminarla si tiene usuarios afiliados actualmente.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setAsociacionToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE ACTIVAR/DESACTIVAR ================= */}
      {asociacionToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${asociacionToToggle.activa ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿{asociacionToToggle.activa ? 'Desactivar' : 'Activar'} Asociación?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de {asociacionToToggle.activa ? 'desactivar' : 'activar'} la asociación <strong className="text-gray-700">"{asociacionToToggle.nombre}"</strong>?
                  {asociacionToToggle.activa && " Ya no se podrá visualizar de manera pública."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setAsociacionToToggle(null)}
                disabled={isToggling}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm hover:shadow-md disabled:opacity-70 ${
                  asociacionToToggle.activa ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isToggling ? 'Procesando...' : (asociacionToToggle.activa ? 'Sí, desactivar' : 'Sí, activar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
