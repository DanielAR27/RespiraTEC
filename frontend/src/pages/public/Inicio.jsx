import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEventos } from '../../api/eventos';
import { getDescuentos } from '../../api/descuentos';
import adCafe from '../../assets/ad_cafe.png';

export default function Inicio() {
  const [eventos, setEventos] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [currentEvento, setCurrentEvento] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evRes, descRes] = await Promise.all([
          getEventos(),
          getDescuentos()
        ]);
        
        const ahora = new Date();

        // Procesar Eventos (5 próximos activos)
        const eventosActivosFuturos = (evRes.data || evRes).filter(e => 
          e.activo === true && new Date(e.fecha_inicio) >= ahora
        );
        eventosActivosFuturos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
        setEventos(eventosActivosFuturos.slice(0, 5));

        // Procesar Descuentos (6 más recientes activos y no expirados)
        const descuentosActivos = (descRes.data || descRes).filter(d => 
          d.activo === true && new Date(d.fecha_expiracion) >= ahora
        );
        descuentosActivos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDescuentos(descuentosActivos.slice(0, 6));

      } catch (error) {
        console.error("Error al cargar datos del inicio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Carrusel automático
  useEffect(() => {
    if (eventos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentEvento(prev => (prev + 1) % eventos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventos.length]);

  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleDateString('es-CR', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#243e7b]"></div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Columna Principal (Eventos + Descuentos) */}
        <div className="flex-1 flex flex-col gap-12">
          
          {/* SECCIÓN EVENTOS (CARRUSEL) */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#243e7b] tracking-tight border-b-4 border-[#9ce694] pb-2 inline-block">
                Eventos Destacados
              </h2>
            </div>
            
            {eventos.length > 0 ? (
              <div className="relative w-full h-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl group border border-gray-100">
                {/* Imagen y overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${eventos[currentEvento]?.imagen_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Contenido del carrusel (Glassmorphism - Barra horizontal delgada de extremo a extremo) */}
                <div className="absolute bottom-6 left-6 right-6 p-4 md:p-6 bg-black/55 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                  
                  {/* Izquierda: Info de Evento (Aprovechando más espacio) */}
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#9ce694] uppercase tracking-wider mb-1 block">
                      Próximo Evento
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight drop-shadow-sm truncate">
                      {eventos[currentEvento]?.titulo}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-1 mt-0.5 hidden md:block">
                      {eventos[currentEvento]?.descripcion}
                    </p>
                  </div>
                  
                  {/* Centro: Metadatos con íconos grandes apilados verticalmente */}
                  <div className="flex flex-col gap-1.5 text-white/90 text-sm font-semibold flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9ce694] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{formatearFecha(eventos[currentEvento]?.fecha_inicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9ce694] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate max-w-[200px]">{eventos[currentEvento]?.ubicacion}</span>
                    </div>
                  </div>

                  {/* Derecha: Botón */}
                  <div className="flex-shrink-0">
                    <Link 
                      to={`/eventos/${eventos[currentEvento]?._id}`}
                      className="px-5 py-2.5 bg-[#243e7b] hover:bg-[#1e3366] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-300 border border-[#9ce694]/20 hover:border-[#9ce694]/60 flex items-center gap-2 hover:scale-[1.03]"
                    >
                      Ver Evento
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9ce694]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Indicadores (Bolitas) */}
                <div className="absolute top-6 right-6 flex gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-full border border-white/10">
                  {eventos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentEvento(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === currentEvento ? 'bg-[#9ce694] scale-125 shadow-[0_0_8px_#9ce694]' : 'bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`Ir al evento ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-sm text-center text-gray-500 border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">No hay eventos próximos en este momento.</p>
                <p className="text-sm text-gray-400 mt-1">¡Vuelve pronto para enterarte de nuevas actividades!</p>
              </div>
            )}
          </section>

          {/* SECCIÓN DESCUENTOS */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#243e7b] tracking-tight border-b-4 border-[#9ce694] pb-2 inline-block">
                Últimos Descuentos
              </h2>
            </div>
            
            {descuentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {descuentos.map((desc) => (
                  <div 
                    key={desc._id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center p-5 gap-5"
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100/80 p-2 flex items-center justify-center">
                      <img 
                        src={desc.imagen_url} 
                        alt={desc.comercio} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-[#9ce694] uppercase tracking-widest mb-1">
                        {desc.comercio}
                      </div>
                      <h3 className="font-extrabold text-gray-800 text-lg leading-snug mb-1 truncate">
                        {desc.titulo}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {desc.descripcion}
                      </p>
                    </div>
                    
                    <div className="bg-[#9ce694]/10 text-emerald-800 px-4 py-2.5 rounded-2xl font-black whitespace-nowrap border border-[#9ce694]/30 text-sm shadow-sm">
                      {desc.valor_descuento}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-sm text-center text-gray-500 border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">No hay descuentos disponibles por ahora.</p>
                <p className="text-sm text-gray-400 mt-1">¡Revisa más tarde para encontrar grandes promociones!</p>
              </div>
            )}
          </section>

        </div>

        {/* Columna Lateral (Anuncio) - w-[233px] según especificación original, sin recortes ni marco blanco */}
        <aside className="lg:w-[233px] flex-shrink-0 flex flex-col items-center lg:block">
          <div className="sticky top-24 w-full flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 self-center lg:self-start">
              Patrocinado
            </span>
            <img 
              src={adCafe} 
              alt="Anuncio" 
              className="w-[233px] h-[1013px] object-contain rounded-3xl shadow-2xl border border-gray-100"
            />
          </div>
        </aside>

      </div>
    </main>
  );
}