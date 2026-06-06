import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEventos, deleteEvento, toggleEventoStatus } from '../../../api/eventos';

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de los Filtros de la Barra Completa
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [maxPrecio, setMaxPrecio] = useState('');
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
        navigate('/admin/eventos', { replace: true, state: {} });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Estados para Eliminar y Alternar Estado
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventoToToggle, setEventoToToggle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Cargar datos desde el Backend al montar el componente
  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await getEventos();
      setEventos(res.data || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  // Función para confirmar y ejecutar la eliminación
  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvento(eventToDelete._id);

      // Desplaza la vista al inicio para mostrar la notificación correctamente
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccessToast(`Se ha eliminado el evento "${eventToDelete.titulo}" exitosamente`);

      setEventToDelete(null);
      fetchEventos(); // Recargar tabla

      // Auto ocultar el toast tras 5 segundos (igual que el otro toast)
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para alternar el estado (activo/inactivo)
  const handleToggleStatus = async () => {
    if (!eventoToToggle) return;
    setIsToggling(true);
    try {
      const res = await toggleEventoStatus(eventoToToggle._id);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      const nuevoEstado = res.data.activo ? "activado" : "desactivado";
      setSuccessToast(`Se ha ${nuevoEstado} el evento "${eventoToToggle.titulo}" exitosamente`);

      setEventoToToggle(null);
      fetchEventos(); // Recargar tabla
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
      total: eventos.length,
      agotados: eventos.filter(e => e.cupo_disponible === 0).length,
      proximos: eventos.filter(e => new Date(e.fecha_inicio) > ahora).length
    };
  }, [eventos]);

  // MOTOR DE BÚSQUEDA Y FILTRADO EN TIEMPO REAL
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      // Se formatean las fechas para permitir coincidencias de texto en el buscador (ej: "mayo", "2026")
      const fInicioStr = new Date(evento.fecha_inicio).toLocaleDateString('es-CR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).toLowerCase();
      const fFinStr = new Date(evento.fecha_fin).toLocaleDateString('es-CR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).toLowerCase();

      // Concatenar campos de texto para la barra de búsqueda principal
      const matchText = (
        evento.titulo + ' ' +
        evento.descripcion + ' ' +
        evento.ubicacion + ' ' +
        evento.tipo + ' ' +
        fInicioStr + ' ' +
        fFinStr
      ).toLowerCase();

      const cumpleBusqueda = matchText.includes(searchQuery.toLowerCase());
      const cumpleTipo = filterTipo === 'todos' || evento.tipo === filterTipo;
      const cumpleEstado = filterEstado === 'todos'
        ? true
        : filterEstado === 'activos' ? evento.activo : !evento.activo;
      const cumplePrecio = maxPrecio === '' || evento.precio <= parseFloat(maxPrecio);
      const cumpleCupo = minCupo === '' || evento.cupo_disponible >= parseInt(minCupo);

      return cumpleBusqueda && cumpleTipo && cumpleEstado && cumplePrecio && cumpleCupo;
    });
  }, [eventos, searchQuery, filterTipo, filterEstado, maxPrecio, minCupo]);

  // Funciones de formato rápido
  const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return precio === 0 ? 'Gratis' : `₡${precio.toLocaleString('es-CR')}`;
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
                navigate('/admin/eventos', { replace: true, state: {} });
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
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Eventos</h3>
            <p className="text-3xl font-black text-[#243e7b] mt-1">{kpis.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cupos Agotados</h3>
            <p className="text-3xl font-black text-red-500 mt-1">{kpis.agotados}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 transition-all hover:shadow-md">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Próximos Eventos</h3>
            <p className="text-3xl font-black text-[#5cc0b6] mt-1">{kpis.proximos}</p>
          </div>
        </div>

        {/* ================= COMPONENTE DE CONTROL (BUSCADOR Y FILTROS) ================= */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#243e7b]">Panel de Eventos</h2>

            {/* Botón Nuevo Evento */}
            <button
              onClick={() => navigate('/admin/eventos/new')}
              className="flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer text-sm self-end lg:self-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Evento
            </button>
          </div>

          {/* Formulario/Barra Grid de Criterios en Tiempo Real */}
          {/* Formulario/Barra Grid de Criterios en Tiempo Real */}
          {/* Cambiamos a lg:grid-cols-6 para tener un control más fino del espacio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">

            {/* Input de Texto Global - Le decimos que abarque 2 columnas en pantallas grandes (lg:col-span-2) */}
            <div className="relative lg:col-span-2">
              <input
                type="text"
                placeholder="Buscar por título, lugar, fecha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Selector de Tipo (Ocupa 1 columna) */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
            >
              <option value="todos">Todos los tipos</option>
              <option value="gratis">Gratis</option>
              <option value="pago_interno">Pago Interno</option>
              <option value="pago_terceros">Pago de Terceros</option>
            </select>

            {/* Selector de Estado (Ocupa 1 columna) */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>

            {/* Filtro Precio Máximo (Ocupa 1 columna) */}
            <input
              type="number"
              placeholder="Precio máximo (₡)"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all placeholder-gray-400"
            />

            {/* Filtro Cupo Mínimo */}
            <input
              type="number"
              placeholder="Mínimo disponible"
              value={minCupo}
              onChange={(e) => setMinCupo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 text-gray-700 transition-all placeholder-gray-400"
            />


          </div>

          {/* Indicador de Resultados Muestreo */}
          <div className="text-xs font-semibold text-gray-400 pt-1">
            Mostrando <span className="text-[#243e7b]">{eventosFiltrados.length}</span> de <span className="text-gray-600">{eventos.length}</span> resultados registrados
          </div>
        </div>

        {/* ================= SECCIÓN TABLA CON SCROLL SEGURO ================= */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">

          {/* Contenedor con scroll vertical asignado sin afectar cabeceras */}
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto">

              {/* Cabecera Fija */}
              <thead className="bg-gray-50/70 sticky top-0 backdrop-blur-xs border-b border-gray-100 z-10">
                <tr>
                  {/* Título: Siempre visible */}
                  <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Título</th>

                  {/* Tipo: Oculto en celular, visible desde tablet (sm) */}
                  <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Tipo</th>

                  {/* Precio: Oculto en celular y tablet pequeña, visible desde escritorio (md) */}
                  <th className="hidden md:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Precio</th>

                  {/* Fechas: Oculto en celular, visible desde tablet (sm) */}
                  <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Inicio / Ubicación</th>

                  {/* Cupos: Oculto hasta pantallas grandes (lg) */}
                  <th className="hidden lg:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Cupos</th>

                  {/* Estado: Oculto en celular */}
                  <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider">Estado</th>

                  {/* Acciones: Siempre visible */}
                  <th className="px-4 md:px-6 py-4 text-xs font-bold text-[#243e7b] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>

              {/* Cuerpo de la Tabla */}
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {eventosFiltrados.length > 0 ? (
                  eventosFiltrados.map((evento) => {
                    return (
                      <tr
                        key={evento._id}
                        className="transition-all relative hover:bg-gray-50/80"
                      >
                        {/* Título (Siempre visible) */}
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[200px]" title={evento.titulo}>
                            {evento.titulo}
                          </div>
                          {/* Pequeño subtítulo solo para móvil para no perder contexto */}
                          <div className="sm:hidden text-[10px] text-gray-400 mt-1">
                            {formatearFecha(evento.fecha_inicio)}
                          </div>
                        </td>

                        {/* Tipo (Oculto en celular) */}
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${evento.tipo === 'gratis' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {evento.tipo.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Precio (Oculto hasta md) */}
                        <td className="hidden md:table-cell px-4 md:px-6 py-4 font-mono text-xs">
                          {formatearPrecio(evento.precio)}
                        </td>

                        {/* Fechas / Ubicación (Oculto en celular) */}
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4 space-y-0.5">
                          <div className="text-xs text-gray-700 font-medium">{formatearFecha(evento.fecha_inicio)}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]" title={evento.ubicacion}>📍 {evento.ubicacion}</div>
                        </td>

                        {/* Cupos (Oculto hasta lg) */}
                        <td className="hidden lg:table-cell px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${evento.cupo_disponible === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                              {evento.cupo_disponible}
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">{evento.cupo_maximo}</span>
                          </div>
                        </td>

                        {/* Estado (Toggle) */}
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => setEventoToToggle(evento)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${evento.activo ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              title={evento.activo ? 'Desactivar Evento' : 'Activar Evento'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${evento.activo ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                              />
                            </button>
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${evento.activo ? 'text-blue-600' : 'text-gray-400'}`}>
                              {evento.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>

                        {/* Botones de Acciones (Siempre visibles) */}
                        <td className="px-4 md:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-1.5">
                            {/* Consultar / Ver (Ojo) */}
                            <button
                              title="Consultar Evento"
                              onClick={() => navigate(`/admin/eventos/view/${evento._id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#243e7b] hover:bg-gray-100 transition-all"
                            >
                              <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>

                            {/* Editar (Lápiz) */}
                            <button
                              title="Editar Detalles"
                              onClick={() => navigate(`/admin/eventos/edit/${evento._id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            >
                              <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>

                            {/* Eliminar (Tacho de Basura) */}
                            <button
                              title="Eliminar Registro"
                              onClick={() => setEventToDelete(evento)}
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
                    <td colSpan="7" className="text-center py-10 text-gray-400 font-medium">
                      No se encontraron eventos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>
      </main>

      {/* ================= MODAL DE ELIMINACIÓN ================= */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar Evento?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de eliminar el evento <strong className="text-gray-700">"{eventToDelete.titulo}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEventToDelete(null)}
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
      {eventoToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-down">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${eventoToToggle.activo ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿{eventoToToggle.activo ? 'Desactivar' : 'Activar'} Evento?</h3>
                <p className="text-gray-500 mt-2">
                  ¿Estás seguro de {eventoToToggle.activo ? 'desactivar' : 'activar'} el evento <strong className="text-gray-700">"{eventoToToggle.titulo}"</strong>?
                  {eventoToToggle.activo && " Ya no se podrá visualizar de manera pública."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEventoToToggle(null)}
                disabled={isToggling}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm hover:shadow-md disabled:opacity-70 ${eventoToToggle.activo ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isToggling ? 'Procesando...' : (eventoToToggle.activo ? 'Sí, desactivar' : 'Sí, activar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}