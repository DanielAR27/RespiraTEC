import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAsociaciones } from '../../../api/asociaciones';

export default function Asociaciones() {
  const [asociaciones, setAsociaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAsociaciones = async () => {
      setLoading(true);
      try {
        const res = await getAsociaciones();
        // Solo las activas
        setAsociaciones((res.data || []).filter(a => a.activa));
      } catch (err) {
        console.error('Error al cargar asociaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsociaciones();
  }, []);

  const asociacionesFiltradas = useMemo(() => {
    if (!searchQuery.trim()) return asociaciones;
    return asociaciones.filter((asociacion) => {
      const matchText = (
        asociacion.nombre + ' ' +
        (asociacion.descripcion || '')
      ).toLowerCase();
      return matchText.includes(searchQuery.toLowerCase());
    });
  }, [asociaciones, searchQuery]);

  const navigate = useNavigate();

  const handleVerAsociacion = (id) => {
    navigate(`/asociaciones/detalle/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Cabecera y Buscador */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#243e7b] tracking-tight mb-4">
          Conoce Nuestras Asociaciones
        </h1>
        <p className="text-gray-500 mb-8 max-w-2xl">
          Explora y únete a las diferentes asociaciones estudiantiles. Encuentra aquella que se adapte a tus intereses y sé parte del cambio en la comunidad.
        </p>
        
        {/* Buscador */}
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Buscar asociaciones por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#5cc0b6] focus:ring-4 focus:ring-[#5cc0b6]/20 transition-all text-gray-700 placeholder-gray-400 font-medium shadow-inner"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {asociacionesFiltradas.length > 0 ? (
          asociacionesFiltradas.map((asociacion) => (
<div 
              key={asociacion._id} 
              className="bg-white rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group hover:-translate-y-1"
            >
              {/* Header de la Tarjeta (Preparado para imagen de portada a futuro) */}
              <div className="relative h-28 bg-gradient-to-br from-gray-50 to-gray-200 mb-12 flex justify-center border-b border-gray-100">
                <div className="absolute -bottom-10 w-30 h-30 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform duration-300 z-10">
                  {asociacion.logo_url ? (
                    <img 
                      src={asociacion.logo_url} 
                      alt={asociacion.nombre} 
                      className="w-full h-full object-contain p-1.5" /* <-- Ajuste clave para logos */
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#243e7b] to-[#5cc0b6] flex items-center justify-center text-white text-2xl font-black">
                      {asociacion.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="px-6 flex-1 flex flex-col text-center">
                
                {/* Badge de Categoría (Opcional, pero recomendado) */}
                <div className="mb-3 flex justify-center">
                  <span className="px-3 py-1 bg-teal-50 text-[#5cc0b6] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {asociacion.categoria || 'Grupo Estudiantil'}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#243e7b] mb-2 leading-tight line-clamp-2" title={asociacion.nombre}>
                  {asociacion.nombre}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                  {asociacion.descripcion || 'Esta asociación no ha proporcionado una descripción detallada aún.'}
                </p>
              </div>

              {/* Botón Inferior */}
              <div className="p-5 pt-0 mt-auto">
                <button
                  onClick={() => handleVerAsociacion(asociacion._id)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-[#243e7b] border border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 group-hover:border-[#5cc0b6] group-hover:text-[#5cc0b6]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Conocer más
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500">
              Prueba modificando los términos de búsqueda o revisa más tarde.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
