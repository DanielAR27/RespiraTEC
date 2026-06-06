import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTalleres, deleteTaller, toggleTallerStatus } from '../../../api/talleres';

export default function AdminTalleres() {
  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de los Filtros de la Barra Completa
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNivel, setFilterNivel] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [minCupo, setMinCupo] = useState('');

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
        navigate('/admin/talleres', { replace: true, state: {} });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Estados para Eliminar y Alternar Estado
  const [tallerToDelete, setTallerToDelete] = useState(null);
  const [tallerToToggle, setTallerToToggle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Cargar datos desde el Backend al montar el componente
  const fetchTalleres = async () => {
    setLoading(true);
    try {
      const res = await getTalleres();
      setTalleres(res.data || []);
    } catch (err) {
      console.error('Error al cargar talleres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalleres();
  }, []);

  // Función para confirmar y ejecutar la eliminación
  const handleDelete = async () => {
    if (!tallerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTaller(tallerToDelete._id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccessToast(`Se ha eliminado el taller "${tallerToDelete.titulo}" exitosamente`);
      
      setTallerToDelete(null);
      fetchTalleres(); // Recargar tabla
      
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para alternar el estado (activo/inactivo)
  const handleToggleStatus = async () => {
    if (!tallerToToggle) return;
    setIsToggling(true);
    try {
      const res = await toggleTallerStatus(tallerToToggle._id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const nuevoEstado = res.data.activo ? "activado" : "desactivado";
      setSuccessToast(`Se ha ${nuevoEstado} el taller "${tallerToToggle.titulo}" exitosamente`);
      
      setTallerToToggle(null);
      fetchTalleres(); // Recargar tabla
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsToggling(false);
    }
  };

  // LÓGICA DE KPIs (Métricas Globales del Sistema)
  const kpis = useMemo(() => {
    const ahora = new Date();
    return {
      total: talleres.length,
      agotados: talleres.filter(t => t.cupo_disponible === 0).length,
      proximos: talleres.filter(t => new Date(t.fecha_inicio) > ahora).length
    };
  }, [talleres]);

  // MOTOR DE BÚSQUEDA Y FILTRADO EN TIEMPO REAL
  const talleresFiltrados = useMemo(() => {
    return talleres.filter((taller) => {
      // Se formatean las fechas para permitir coincidencias de texto en el buscador
      const fInicioStr = new Date(taller.fecha_inicio).toLocaleDateString('es-CR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).toLowerCase();
      const fFinStr = new Date(taller.fecha_fin).toLocaleDateString('es-CR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).toLowerCase();

      // Concatenar campos de texto para la barra de búsqueda principal
      const matchText = (
        taller.titulo + ' ' +
        taller.instructor + ' ' +
        taller.descripcion + ' ' +
        taller.ubicacion + ' ' +
        taller.nivel + ' ' +
        fInicioStr + ' ' +
        fFinStr
      ).toLowerCase();

      const cumpleBusqueda = matchText.includes(searchQuery.toLowerCase());
      const cumpleNivel = filterNivel === 'todos' || taller.nivel.toLowerCase() === filterNivel.toLowerCase();
      const cumpleEstado = filterEstado === 'todos' 
        ? true 
        : filterEstado === 'activos' ? taller.activo : !taller.activo;
      const cumpleCupo = minCupo === '' || taller.cupo_disponible >= parseInt(minCupo);

      return cumpleBusqueda && cumpleNivel && cumpleEstado && cumpleCupo;
    });
  }, [talleres, searchQuery, filterNivel, filterEstado, minCupo]);

  // Funciones de formato rápido
  const formatearFechaCorta = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
              navigate('/admin/talleres', { replace: true, state: {} });
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
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Talleres</h3>
          <p className="text-3xl font-black text-[#243e7b] mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cupos Agotados</h3>
          <p className="text-3xl font-black text-red-500 mt-1">{kpis.agotados}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Próximos Talleres</h3>
          <p className="text-3xl font-black text-[#5cc0b6] mt-1">{kpis.proximos}</p>
        </div>
      </div>

      {/* ================= COMPONENTE DE CONTROL (BUSCADOR Y FILTROS) ================= */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#243e7b]">Panel de Talleres</h2>
          
          {/* Botón Nuevo Taller */}
          <button 
            onClick={() => navigate('/admin/talleres/new')}
            className="flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer text-sm self-end lg:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Taller
          </button>
        </div>

        {/* Formulario/Barra Grid de Criterios en Tiempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
          
          {/* Input de Texto Global */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por título, instructor, ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Selector de Nivel */}
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
          >
            <option value="todos">Todos los niveles</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
          
          {/* Selector de Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          {/* Filtro Cupo Mínimo */}
          <input
            type="number"
            placeholder="Cupo disponible mín."
            value={minCupo}
            onChange={(e) => setMinCupo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all placeholder-gray-400"
          />
        </div>

        {/* Indicador de Resultados Muestreo */}
        <div className="text-xs font-semibold text-gray-400 pt-1">
          Mostrando <span className="text-[#243e7b]">{talleresFiltrados.length}</span> de <span className="text-gray-600">{talleres.length}</span> resultados registrados
        </div>
      </div>

      {/* ================= SECCIÓN TABLA ================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto">
            
            {/* Cabecera Fija */}
            <thead className="bg-gray-50/70 sticky top-0 backdrop-blur-xs border-b border-gray-100 z-10">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Taller / Instructor</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Nivel</th>
                <th className="hidden md:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Fechas / Ubicación</th>
                <th className="hidden lg:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Cupos</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Estado</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            
            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {talleresFiltrados.length > 0 ? (
                talleresFiltrados.map((taller) => {
                  return (
                    <tr
                      key={taller._id}
                      className="transition-all relative hover:bg-gray-50/80"
                    >
                      {/* Título / Instructor */}
                      <td className="px-4 md:px-6 py-4">
                        <div className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[200px]" title={taller.titulo}>
                          {taller.titulo}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 truncate" title={taller.instructor}>
                          {taller.instructor}
                        </div>
                        <div className="sm:hidden text-[10px] text-gray-400 mt-1">
                          {formatearFechaCorta(taller.fecha_inicio)}
                        </div>
                      </td>
                      
                      {/* Nivel */}
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          taller.nivel === 'Principiante' ? 'bg-green-50 text-green-600' :
                          taller.nivel === 'Intermedio' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {taller.nivel}
                        </span>
                      </td>
                      
                      {/* Fechas / Ubicación */}
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 space-y-0.5">
                        <div className="text-xs text-gray-700 font-medium">
                          {formatearFechaCorta(taller.fecha_inicio)} - {formatearFechaCorta(taller.fecha_fin)}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]" title={taller.ubicacion}>📍 {taller.ubicacion}</div>
                      </td>
                      
                      {/* Cupos */}
                      <td className="hidden lg:table-cell px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${taller.cupo_disponible === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                            {taller.cupo_disponible}
                          </span>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-400">{taller.cupo_maximo}</span>
                        </div>
                      </td>
                      
                      {/* Estado */}
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => setTallerToToggle(taller)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              taller.activo ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            title={taller.activo ? 'Desactivar Taller' : 'Activar Taller'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                taller.activo ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${taller.activo ? 'text-blue-600' : 'text-gray-400'}`}>
                            {taller.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-1.5">
                          <button 
                            title="Consultar Taller" 
                            onClick={() => navigate(`/admin/talleres/view/${taller._id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#243e7b] hover:bg-gray-100 transition-all"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>

                          <button 
                            title="Editar Detalles" 
                            onClick={() => navigate(`/admin/talleres/edit/${taller._id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          >
                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>

                          <button 
                            title="Eliminar Registro" 
                            onClick={() => setTallerToDelete(taller)}
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
                  <td colSpan="6" className="text-center py-10 text-gray-400 font-medium">
                    No se encontraron talleres que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>

      {/* ================= MODAL DE ELIMINACIÓN ================= */}
      {tallerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar Taller?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de eliminar el taller <strong className="text-gray-700">"{tallerToDelete.titulo}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setTallerToDelete(null)}
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
      {tallerToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${tallerToToggle.activo ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿{tallerToToggle.activo ? 'Desactivar' : 'Activar'} Taller?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de {tallerToToggle.activo ? 'desactivar' : 'activar'} el taller <strong className="text-gray-700">"{tallerToToggle.titulo}"</strong>?
                  {tallerToToggle.activo && " Ya no se podrá visualizar de manera pública."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setTallerToToggle(null)}
                disabled={isToggling}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm hover:shadow-md disabled:opacity-70 ${
                  tallerToToggle.activo ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isToggling ? 'Procesando...' : (tallerToToggle.activo ? 'Sí, desactivar' : 'Sí, activar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
