import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvento } from '../../api/eventos';
import ModalPago from '../../components/ModalPago';
import FeedbackSection from '../../components/FeedbackSection';

const TIPO_CONFIG = {
  gratis:        { label: 'Gratuito',       color: 'bg-green-100 text-green-700' },
  pago_interno:  { label: 'Pago (Interno)', color: 'bg-blue-100 text-blue-700' },
  pago_terceros: { label: 'Pago (Externo)', color: 'bg-purple-100 text-purple-700' },
};

const formatearFechaLarga = (fechaStr) =>
  new Date(fechaStr).toLocaleString('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const formatearPrecio = (tipo, precio) => {
  if (tipo === 'gratis') return 'Gratis';
  return `₡${Number(precio).toLocaleString('es-CR')}`;
};

export default function EventoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState({ type: '', message: '' });
  const [modalPago, setModalPago] = useState(false);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setLoading(true);
        const res = await getEvento(id);
        setEvento(res.data);
      } catch {
        setError('No se pudo cargar la información del evento.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

  useEffect(() => {
    if (!toast.message) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setToast({ type: '', message: '' }), 5000);
    return () => clearTimeout(t);
  }, [toast.message]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops</h2>
          <p className="text-gray-500">{error || 'Evento no encontrado'}</p>
          <button
            onClick={() => navigate('/eventos')}
            className="mt-6 px-6 py-2 bg-[#243e7b] text-white rounded-xl font-bold"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }

  const ahora       = new Date();
  const iniciado    = new Date(evento.fecha_inicio) <= ahora;
  const finalizado  = new Date(evento.fecha_fin) < ahora;
  const tipoConfig  = TIPO_CONFIG[evento.tipo] || { label: evento.tipo, color: 'bg-gray-100 text-gray-700' };
  const esDePago    = evento.tipo !== 'gratis' && Number(evento.precio) > 0;
  const sinCupos    = evento.cupo_disponible === 0;

  const renderAccion = () => {
    if (!evento.activo) {
      return (
        <div className="text-center py-3 px-4 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">
          Este evento no está disponible actualmente.
        </div>
      );
    }

    if (finalizado) {
      return (
        <div className="text-center py-3 px-4 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">
          Este evento ya finalizó.
        </div>
      );
    }

    if (sinCupos) {
      return (
        <div className="text-center py-3 px-4 bg-red-50 rounded-xl text-red-600 text-sm font-bold">
          Cupos agotados
        </div>
      );
    }

    if (esDePago) {
      return (
        <button
          onClick={() => setModalPago(true)}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Comprar entrada · ₡{Number(evento.precio).toLocaleString('es-CR')}
        </button>
      );
    }

    return (
      <button
        onClick={() => setToast({ type: 'success', message: '¡Listo! Te esperamos en el evento.' })}
        className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Asistiré (gratis)
      </button>
    );
  };

  return (
    <>
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">

        <button
          onClick={() => navigate('/eventos')}
          className="flex items-center text-gray-500 hover:text-[#243e7b] transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a eventos
        </button>

        {toast.message && (
          <div className={`border-l-4 shadow-lg rounded-r-lg p-4 flex items-center justify-between animate-fadeIn ${
            toast.type === 'success' ? 'bg-green-50 border-green-800' : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-green-800' : 'bg-red-500'
              }`}>
                {toast.type === 'success'
                  ? <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  : <span className="text-white text-lg font-bold">!</span>}
              </div>
              <p className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {toast.message}
              </p>
            </div>
            <button onClick={() => setToast({ type: '', message: '' })} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-[#243e7b]/10 to-[#5cc0b6]/10">
          <img
            src={evento.imagen_url}
            alt={evento.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          <div className="lg:col-span-3 space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoConfig.color}`}>
                  {tipoConfig.label}
                </span>
                {finalizado && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    Finalizado
                  </span>
                )}
                {iniciado && !finalizado && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#9ce694] text-green-900">
                    En curso
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#243e7b] mb-2">{evento.titulo}</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: 'Inicio',
                  value: formatearFechaLarga(evento.fecha_inicio),
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
                {
                  label: 'Fin',
                  value: formatearFechaLarga(evento.fecha_fin),
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
                {
                  label: 'Ubicación',
                  value: evento.ubicacion,
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                },
                {
                  label: 'Cupos',
                  value: `${evento.cupo_disponible} disponibles de ${evento.cupo_maximo}`,
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5cc0b6]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#5cc0b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#243e7b] mb-3 border-b pb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{evento.descripcion}</p>
            </div>

            <FeedbackSection
              targetId={id}
              targetTipo="Evento"
              finalizado={finalizado}
              usuarioInscrito={true}
            />
          </div>

          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#243e7b] mb-1">Asistencia</h2>
              <p className="text-xs text-gray-400 mb-4">
                {evento.cupo_disponible > 0
                  ? `Quedan ${evento.cupo_disponible} lugares disponibles.`
                  : 'No quedan lugares disponibles.'}
              </p>

              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#5cc0b6] transition-all"
                    style={{ width: `${Math.max(4, ((evento.cupo_maximo - evento.cupo_disponible) / evento.cupo_maximo) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {evento.cupo_maximo - evento.cupo_disponible} de {evento.cupo_maximo} ocupados
                </p>
              </div>

              <div className="mb-4 px-4 py-3 bg-[#243e7b]/5 border border-[#243e7b]/15 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</span>
                <span className={`text-lg font-extrabold ${evento.tipo === 'gratis' ? 'text-emerald-600' : 'text-[#243e7b]'}`}>
                  {formatearPrecio(evento.tipo, evento.precio)}
                </span>
              </div>

              {renderAccion()}
            </div>
          </div>
        </div>
      </main>

      <ModalPago
        isOpen={modalPago}
        onClose={() => setModalPago(false)}
        monto={Number(evento.precio) > 0 ? Number(evento.precio) : 0}
        concepto={`Entrada para ${evento.titulo}`}
        onSuccess={() => setToast({ type: 'success', message: '¡Pago exitoso! Te esperamos en el evento.' })}
      />
    </>
  );
}
