import { useState, useEffect } from 'react';

export default function FiltroBusqueda({
  onFilter,
  categorias = [],
  ubicaciones = [],
  mostrarFecha = true,
  mostrarCategoria = true,
  mostrarUbicacion = true,
  placeholderTexto = 'Buscar...',
  labelCategoria = 'Categoría',
  labelUbicacion = 'Ubicación',
}) {
  const [texto, setTexto]             = useState('');
  const [fechaDesde, setFechaDesde]   = useState('');
  const [fechaHasta, setFechaHasta]   = useState('');
  const [categoria, setCategoria]     = useState('');
  const [ubicacion, setUbicacion]     = useState('');

  useEffect(() => {
    onFilter({ texto, fechaDesde, fechaHasta, categoria, ubicacion });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, fechaDesde, fechaHasta, categoria, ubicacion]);

  const limpiar = () => {
    setTexto('');
    setFechaDesde('');
    setFechaHasta('');
    setCategoria('');
    setUbicacion('');
  };

  const hayFiltros = texto || fechaDesde || fechaHasta || categoria || ubicacion;

  return (
    <div className="bg-white p-6 md:p-7 rounded-3xl shadow-sm border border-gray-100 space-y-5">
      {/* Buscador principal */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholderTexto}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#5cc0b6] focus:ring-4 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400 font-medium shadow-inner"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Grid de filtros avanzados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {mostrarFecha && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all"
              />
            </div>
          </>
        )}

        {mostrarCategoria && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{labelCategoria}</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {mostrarUbicacion && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{labelUbicacion}</label>
            <select
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#5cc0b6] focus:ring-2 focus:ring-[#5cc0b6]/20 transition-all"
            >
              <option value="">Todas</option>
              {ubicaciones.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hayFiltros && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={limpiar}
            className="text-xs font-bold text-[#5cc0b6] hover:text-[#243e7b] transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
