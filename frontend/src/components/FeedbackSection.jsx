import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeedback, getResumenFeedback, enviarFeedback } from '../api/feedback';

const StarIcon = ({ filled, half, className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
    {half ? (
      <>
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path fill="url(#halfGrad)" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </>
    ) : (
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    )}
  </svg>
);

const Stars = ({ value = 0, size = 'w-4 h-4' }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const adjustedFull = value - full >= 0.75 ? full + 1 : full;
  return (
    <div className="flex items-center text-yellow-400">
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < adjustedFull;
        const half = !filled && hasHalf && i === full;
        return <StarIcon key={i} filled={filled} half={half} className={size} />;
      })}
    </div>
  );
};

const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className={`p-1 transition-transform hover:scale-110 ${active ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          >
            <StarIcon filled={active} className="w-7 h-7" />
          </button>
        );
      })}
    </div>
  );
};

const formatearFecha = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });

export default function FeedbackSection({ targetId, targetTipo, finalizado, usuarioInscrito }) {
  const { user, isAuthenticated } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [resumen, setResumen]     = useState({ promedio: 0, total: 0 });
  const [loading, setLoading]     = useState(true);

  const [rating, setRating]         = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [mensaje, setMensaje]       = useState({ type: '', text: '' });

  const cargar = async () => {
    try {
      setLoading(true);
      const [listRes, resumenRes] = await Promise.all([
        getFeedback(targetTipo, targetId),
        getResumenFeedback(targetTipo, targetId),
      ]);
      setFeedbacks(listRes.data || []);
      setResumen(resumenRes.data || { promedio: 0, total: 0 });
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId && targetTipo) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetTipo]);

  const yaComento = useMemo(() => {
    if (!user) return false;
    return feedbacks.some((f) => (f.usuario?._id || f.usuario) === user._id);
  }, [feedbacks, user]);

  const mostrarFormulario =
    finalizado && usuarioInscrito && isAuthenticated && !yaComento;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setMensaje({ type: 'error', text: 'Selecciona una calificación de 1 a 5 estrellas.' });
      return;
    }
    try {
      setEnviando(true);
      await enviarFeedback({ targetTipo, targetId, rating, comentario });
      setMensaje({ type: 'success', text: '¡Gracias por tu feedback!' });
      setRating(0);
      setComentario('');
      await cargar();
    } catch (err) {
      setMensaje({ type: 'error', text: err.message || 'Error al enviar feedback' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-bold text-[#243e7b]">Opiniones</h2>
        {resumen.total > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={resumen.promedio} size="w-5 h-5" />
            <span className="text-sm font-bold text-gray-700">
              {resumen.promedio.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({resumen.total})</span>
          </div>
        )}
      </div>

      {!finalizado && (
        <div className="text-center py-4 px-3 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">
          El feedback estará disponible cuando finalice.
        </div>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm font-bold text-gray-700">Comparte tu experiencia</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Escribe un comentario (opcional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5cc0b6] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{comentario.length}/500</span>
            <button
              type="submit"
              disabled={enviando || rating < 1}
              className="px-5 py-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar feedback'}
            </button>
          </div>
          {mensaje.text && (
            <p className={`text-xs font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
              {mensaje.text}
            </p>
          )}
        </form>
      )}

      {finalizado && isAuthenticated && yaComento && (
        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          Ya enviaste tu feedback. ¡Gracias!
        </div>
      )}

      {finalizado && isAuthenticated && !usuarioInscrito && !yaComento && (
        <div className="px-3 py-2 bg-gray-50 rounded-xl text-gray-500 text-xs">
          Solo participantes pueden dejar feedback.
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5cc0b6]" />
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">Aún no hay comentarios.</p>
        ) : (
          feedbacks.map((f) => (
            <div key={f._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#243e7b]/10 text-[#243e7b] flex items-center justify-center text-xs font-bold">
                    {(f.usuario?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {f.usuario?.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400">{formatearFecha(f.createdAt)}</p>
                  </div>
                </div>
                <Stars value={f.rating} />
              </div>
              {f.comentario && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-1">{f.comentario}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
