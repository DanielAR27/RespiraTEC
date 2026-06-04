import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTalleres } from '../../../api/talleres';
import FiltroBusqueda from '../../../components/FiltroBusqueda';

const NIVEL_COLOR = {
  Principiante: 'bg-green-100 text-green-700',
  Intermedio:   'bg-yellow-100 text-yellow-700',
  Avanzado:     'bg-red-100 text-red-700',
};

const formatearFecha = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });

const FILTROS_INICIALES = { texto: '', fechaDesde: '', fechaHasta: '', categoria: '', ubicacion: '' };

export default function Talleres() {
  const [talleres, setTalleres]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtros, setFiltros]         = useState(FILTROS_INICIALES);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await getTalleres();
        setTalleres((res.data || []).filter(t => t.activo));
      } catch (err) {
        console.error('Error al cargar talleres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const handleFilter = useCallback((nuevos) => setFiltros(nuevos), []);

  const categorias = useMemo(
    () => [...new Set(talleres.map(t => t.nivel).filter(Boolean))],
    [talleres]
  );
  const ubicaciones = useMemo(
    () => [...new Set(talleres.map(t => t.ubicacion).filter(Boolean))],
    [talleres]
  );

  const talleresFiltrados = useMemo(() => {
    const q = filtros.texto.toLowerCase();
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta + 'T23:59:59') : null;

    return talleres.filter((t) => {
      const matchTexto = !q || `${t.titulo} ${t.instructor} ${t.descripcion} ${t.ubicacion}`.toLowerCase().includes(q);
      const inicio = new Date(t.fecha_inicio);
      const fin    = new Date(t.fecha_fin);
      const matchDesde = !desde || fin >= desde;
      const matchHasta = !hasta || inicio <= hasta;
      const matchCat   = !filtros.categoria || t.nivel === filtros.categoria;
      const matchUbi   = !filtros.ubicacion || t.ubicacion === filtros.ubicacion;
      return matchTexto && matchDesde && matchHasta && matchCat && matchUbi;
    });
  }, [talleres, filtros]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">

      {/* Cabecera */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#243e7b] tracking-tight mb-4">
          Talleres Disponibles
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Aprende nuevas habilidades y amplía tu formación. Encuentra el taller que mejor se adapte a tus intereses y nivel.
        </p>
      </div>

      {/* Buscador avanzado */}
      <FiltroBusqueda
        onFilter={handleFilter}
        categorias={categorias}
        ubicaciones={ubicaciones}
        mostrarFecha
        mostrarCategoria
        mostrarUbicacion
        placeholderTexto="Buscar por nombre, instructor o descripción..."
        labelCategoria="Nivel"
        labelUbicacion="Ubicación"
      />

      {/* Contador */}
      <div className="flex items-center px-1">
        <span className="ml-auto text-sm font-semibold text-gray-400">
          <span className="text-[#243e7b]">{talleresFiltrados.length}</span> de {talleres.length} talleres
        </span>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {talleresFiltrados.length > 0 ? (
          talleresFiltrados.map((taller) => (
            <div
              key={taller._id}
              className="bg-white rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group hover:-translate-y-1"
            >
              {/* Imagen con badges */}
              <div className="relative h-48 bg-gradient-to-br from-[#243e7b]/10 to-[#5cc0b6]/10 overflow-hidden flex-shrink-0">
                <img
                  src={taller.imagen_url}
                  alt={taller.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${NIVEL_COLOR[taller.nivel] || 'bg-gray-100 text-gray-700'}`}>
                  {taller.nivel}
                </span>
                {taller.tiene_certificacion && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#243e7b] text-white shadow-sm">
                    Con certificado
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#243e7b] line-clamp-2 mb-1" title={taller.titulo}>
                    {taller.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{taller.instructor}</p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#5cc0b6] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatearFecha(taller.fecha_inicio)} — {formatearFecha(taller.fecha_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#5cc0b6] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{taller.ubicacion}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mt-auto pt-1">
                  <span className={`font-bold ${taller.cupo_disponible === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {taller.cupo_disponible === 0 ? 'Agotado' : `${taller.cupo_disponible} cupos libres`}
                  </span>
                  <span className="text-gray-400">{taller.cupo_disponible} / {taller.cupo_maximo}</span>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/talleres/${taller._id}`)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-[#243e7b] border border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 group-hover:border-[#5cc0b6] group-hover:text-[#5cc0b6]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500">Prueba modificando los filtros o revisa más tarde.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </main>
  );
}
