import { useState, useEffect, useMemo, useCallback } from 'react';
import { getDescuentos } from '../../api/descuentos';
import FiltroBusqueda from '../../components/FiltroBusqueda';

const formatearFecha = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

const calcularVencimiento = (fechaStr) => {
  const hoy   = new Date();
  const vence = new Date(fechaStr);
  const dias  = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));

  if (dias < 0)  return { texto: 'Expirado',            color: 'text-red-500',    bg: 'bg-red-50 border-red-200' };
  if (dias === 0) return { texto: '¡Vence hoy!',         color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
  if (dias <= 7)  return { texto: `¡Últimos ${dias} días!`, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' };
  if (dias <= 30) return { texto: `Vence en ${dias} días`, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
  return { texto: `Vence el ${formatearFecha(fechaStr)}`, color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200' };
};

const FILTROS_INICIALES = { texto: '', fechaDesde: '', fechaHasta: '', categoria: '', ubicacion: '' };

export default function Descuentos() {
  const [descuentos, setDescuentos]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtros, setFiltros]         = useState(FILTROS_INICIALES);
  const [copiado, setCopiado]         = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await getDescuentos();
        setDescuentos((res.data || []).filter(d => d.activo));
      } catch (err) {
        console.error('Error al cargar descuentos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const handleFilter = useCallback((nuevos) => setFiltros(nuevos), []);

  const categorias = useMemo(
    () => [...new Set(descuentos.map(d => d.comercio).filter(Boolean))].sort(),
    [descuentos]
  );

  const descuentosFiltrados = useMemo(() => {
    const q = filtros.texto.toLowerCase();
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta + 'T23:59:59') : null;

    return descuentos.filter((d) => {
      const matchTexto = !q || `${d.titulo} ${d.comercio} ${d.descripcion}`.toLowerCase().includes(q);
      const expira = new Date(d.fecha_expiracion);
      const matchDesde = !desde || expira >= desde;
      const matchHasta = !hasta || expira <= hasta;
      const matchCat   = !filtros.categoria || d.comercio === filtros.categoria;
      return matchTexto && matchDesde && matchHasta && matchCat;
    });
  }, [descuentos, filtros]);

  const copiarCodigo = (descuento) => {
    navigator.clipboard.writeText(descuento.codigo_promocional).then(() => {
      setCopiado(descuento._id);
      setTimeout(() => setCopiado(null), 2000);
    });
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

      {/* Cabecera */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#243e7b] tracking-tight mb-4">
          Descuentos y Beneficios
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Aprovecha los beneficios exclusivos para la comunidad estudiantil. Presenta tu carné y disfruta de descuentos en comercios aliados.
        </p>
      </div>

      {/* Buscador avanzado */}
      <FiltroBusqueda
        onFilter={handleFilter}
        categorias={categorias}
        mostrarFecha
        mostrarCategoria
        mostrarUbicacion={false}
        placeholderTexto="Buscar por nombre, comercio o descripción..."
        labelCategoria="Comercio"
      />

      {/* Contador */}
      <div className="flex items-center px-1">
        <span className="ml-auto text-sm font-semibold text-gray-400">
          <span className="text-[#243e7b]">{descuentosFiltrados.length}</span> de {descuentos.length} descuentos
        </span>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {descuentosFiltrados.length > 0 ? (
          descuentosFiltrados.map((desc) => {
            const venc    = calcularVencimiento(desc.fecha_expiracion);
            const yaCopio = copiado === desc._id;

            return (
              <div
                key={desc._id}
                className="bg-white rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Zona superior: logo + valor */}
                <div className="relative flex flex-col items-center pt-7 pb-5 px-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center p-2 mb-4">
                    <img
                      src={desc.imagen_url}
                      alt={desc.comercio}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="px-5 py-2 bg-[#9ce694]/20 border border-[#9ce694]/40 rounded-2xl">
                    <span className="text-2xl font-black text-emerald-800 tracking-tight">
                      {desc.valor_descuento}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#5cc0b6] uppercase tracking-widest mb-1">
                      {desc.comercio}
                    </p>
                    <h3 className="text-base font-extrabold text-[#243e7b] line-clamp-2 mb-1" title={desc.titulo}>
                      {desc.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {desc.descripcion}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    {desc.codigo_promocional && (
                      <button
                        onClick={() => copiarCodigo(desc)}
                        className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-[#5cc0b6] rounded-xl transition-all group/code"
                        title="Clic para copiar el código"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-xs font-black text-gray-600 tracking-widest uppercase truncate">
                            {desc.codigo_promocional}
                          </span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ml-2 transition-colors ${yaCopio ? 'text-emerald-600' : 'text-gray-400 group-hover/code:text-[#5cc0b6]'}`}>
                          {yaCopio ? '¡Copiado!' : 'Copiar'}
                        </span>
                      </button>
                    )}

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${venc.bg} ${venc.color}`}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {venc.texto}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500">Prueba modificando los términos de búsqueda.</p>
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
