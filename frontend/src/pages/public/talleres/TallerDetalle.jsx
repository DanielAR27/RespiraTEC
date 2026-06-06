import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaller } from '../../../api/talleres';
import { getMisInscripciones, inscribirse, cancelarInscripcion } from '../../../api/inscripciones';
import ModalPago from '../../../components/ModalPago';
import FeedbackSection from '../../../components/FeedbackSection';

const NIVEL_COLOR = {
  Principiante: 'bg-green-100 text-green-700',
  Intermedio:   'bg-yellow-100 text-yellow-700',
  Avanzado:     'bg-red-100 text-red-700',
};

const formatearFechaLarga = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

/* ─── Modal de confirmación genérico ─────────────────────────────── */
function ModalConfirmacion({ isOpen, titulo, mensaje, onConfirmar, onCancelar, cargando }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancelar} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fadeIn">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">{mensaje}</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              No
            </button>
            <button
              onClick={onConfirmar}
              disabled={cargando}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#243e7b] text-white font-bold text-sm hover:bg-[#1a2f5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cargando
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Procesando...</>
                : 'Sí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TallerDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [taller, setTaller]               = useState(null);
  const [miInscripcion, setMiInscripcion] = useState(null);

  const [loading, setLoading]                     = useState(true);
  const [inscripcionLoading, setInscripcionLoading] = useState(true);
  const [actionLoading, setActionLoading]           = useState(false);

  const [error, setError]   = useState(null);
  const [toast, setToast]   = useState({ type: '', message: '' });
  const [modalInscribir, setModalInscribir] = useState(false);
  const [modalCancelar, setModalCancelar]   = useState(false);
  const [modalPago, setModalPago]           = useState(false);

  const fetchTaller = async () => {
    try {
      setLoading(true);
      const res = await getTaller(id);
      setTaller(res.data);
    } catch {
      setError('No se pudo cargar la información del taller.');
    } finally {
      setLoading(false);
    }
  };

  const checkInscripcion = async () => {
    try {
      setInscripcionLoading(true);
      const res = await getMisInscripciones();
      const encontrada = (res.data || []).find(i => (i.taller._id || i.taller) === id);
      setMiInscripcion(encontrada || null);
    } catch {
      // Si falla, asumimos que no está inscrito
    } finally {
      setInscripcionLoading(false);
    }
  };

  useEffect(() => {
    fetchTaller();
    checkInscripcion();
  }, [id]);

  useEffect(() => {
    if (!toast.message) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setToast({ type: '', message: '' }), 5000);
    return () => clearTimeout(t);
  }, [toast.message]);

  const handleInscribirse = async () => {
    try {
      setActionLoading(true);
      await inscribirse(id);
      setToast({ type: 'success', message: '¡Te has inscrito al taller exitosamente!' });
      setModalInscribir(false);
      setMiInscripcion({ usuario: 'me', taller: id });
      setTaller(prev => ({ ...prev, cupo_disponible: Math.max(0, prev.cupo_disponible - 1) }));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al inscribirse' });
      setModalInscribir(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async () => {
    try {
      setActionLoading(true);
      await cancelarInscripcion(id);
      setToast({ type: 'success', message: 'Tu inscripción ha sido cancelada.' });
      setModalCancelar(false);
      setMiInscripcion(null);
      setTaller(prev => ({ ...prev, cupo_disponible: prev.cupo_disponible + 1 }));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error al cancelar la inscripción' });
      setModalCancelar(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  if (error || !taller) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops</h2>
          <p className="text-gray-500">{error || 'Taller no encontrado'}</p>
          <button
            onClick={() => navigate('/talleres')}
            className="mt-6 px-6 py-2 bg-[#243e7b] text-white rounded-xl font-bold"
          >
            Volver a Talleres
          </button>
        </div>
      </div>
    );
  }

  const tallerFinalizado = new Date() > new Date(taller.fecha_fin);

  // — Bloque de acción de inscripción —
  const renderAccion = () => {
    if (inscripcionLoading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5cc0b6]"></div>
        </div>
      );
    }

    if (!taller.activo) {
      return (
        <div className="text-center py-3 px-4 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">
          Este taller no está disponible actualmente.
        </div>
      );
    }

    if (tallerFinalizado) {
      return miInscripcion ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Completaste este taller
          </div>
          {taller.tiene_certificacion && (
            <button
              onClick={() => navigate('/mis-talleres')}
              className="w-full py-2.5 px-4 bg-[#243e7b] hover:bg-[#1a2f60] text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Ver mi certificado
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-3 px-4 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">
          Las inscripciones para este taller ya están cerradas.
        </div>
      );
    }

    // Ya está inscrito
    if (miInscripcion) {
      return (
        <div className="space-y-2">
          <div className="w-full py-3 px-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-green-700">¡Ya estás inscrito!</span>
          </div>
          <button
            onClick={() => setModalCancelar(true)}
            disabled={actionLoading}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-50"
          >
            Cancelar inscripción
          </button>
        </div>
      );
    }

    const sinCupos = taller.cupo_disponible === 0;
    if (sinCupos) {
      return (
        <div className="text-center py-3 px-4 bg-red-50 rounded-xl text-red-600 text-sm font-bold">
          Cupos agotados
        </div>
      );
    }

    const precio = Number(taller.precio) > 0 ? Number(taller.precio) : 5000;
    return (
      <div className="space-y-2">
        <button
          onClick={() => setModalPago(true)}
          disabled={actionLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Inscribirme y pagar · ₡{precio.toLocaleString('es-CR')}
        </button>
        <button
          onClick={() => setModalInscribir(true)}
          disabled={actionLoading}
          className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#243e7b] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Inscribirme sin pagar (demo)
        </button>
      </div>
    );
  };

  return (
    <>
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">

        {/* Volver */}
        <button
          onClick={() => navigate('/talleres')}
          className="flex items-center text-gray-500 hover:text-[#243e7b] transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a talleres
        </button>

        {/* Toast */}
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

        {/* Banner de imagen */}
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-md border border-gray-100">
          <img
            src={taller.imagen_url}
            alt={taller.titulo}
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>

        {/* Contenido principal: izquierda + derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* — Columna izquierda — */}
          <div className="lg:col-span-3 space-y-6">

            {/* Título e insignias */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${NIVEL_COLOR[taller.nivel] || 'bg-gray-100 text-gray-700'}`}>
                  {taller.nivel}
                </span>
                {taller.tiene_certificacion && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#243e7b] text-white">
                    Otorga certificado
                  </span>
                )}
                {tallerFinalizado && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    Finalizado
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#243e7b] mb-2">{taller.titulo}</h1>
              <p className="text-gray-500 font-medium">Por {taller.instructor}</p>
            </div>

            {/* Datos rápidos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: 'Inicio',
                  value: formatearFechaLarga(taller.fecha_inicio),
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
                {
                  label: 'Fin',
                  value: formatearFechaLarga(taller.fecha_fin),
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
                {
                  label: 'Ubicación',
                  value: taller.ubicacion,
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                },
                {
                  label: 'Cupos',
                  value: `${taller.cupo_disponible} disponibles de ${taller.cupo_maximo}`,
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

            {/* Descripción */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#243e7b] mb-3 border-b pb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{taller.descripcion}</p>
            </div>

            {/* Requisitos */}
            {taller.requisitos && taller.requisitos !== 'Ninguno' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#243e7b] mb-3 border-b pb-2">Requisitos</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{taller.requisitos}</p>
              </div>
            )}

            {/* Horario semanal */}
            {taller.horario_semanal?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#243e7b] mb-4 border-b pb-2">Horario semanal</h2>
                <div className="space-y-2">
                  {taller.horario_semanal.map((sesion, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-800 text-sm">{sesion.dia}</span>
                      <span className="text-sm text-[#5cc0b6] font-semibold">
                        {sesion.hora_inicio} — {sesion.hora_fin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <FeedbackSection
              targetId={id}
              targetTipo="Taller"
              finalizado={tallerFinalizado}
              usuarioInscrito={!!miInscripcion}
            />
          </div>

          {/* — Columna derecha — */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#243e7b] mb-1">Inscripción</h2>
              <p className="text-xs text-gray-400 mb-4">
                {taller.cupo_disponible > 0
                  ? `Quedan ${taller.cupo_disponible} lugares disponibles.`
                  : 'No quedan lugares disponibles.'}
              </p>

              {/* Barra de cupos */}
              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#5cc0b6] transition-all"
                    style={{ width: `${Math.max(4, ((taller.cupo_maximo - taller.cupo_disponible) / taller.cupo_maximo) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {taller.cupo_maximo - taller.cupo_disponible} de {taller.cupo_maximo} ocupados
                </p>
              </div>

              {renderAccion()}
            </div>

            {taller.tiene_certificacion && (
              <div className="bg-[#243e7b]/5 border border-[#243e7b]/15 rounded-2xl p-5 flex gap-3">
                <svg className="w-6 h-6 text-[#243e7b] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#243e7b]">Otorga certificado</p>
                  <p className="text-xs text-gray-500 mt-1">Al completar el taller podrás descargar tu certificado de participación desde "Mis Talleres".</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal inscribirse (demo) */}
      <ModalConfirmacion
        isOpen={modalInscribir}
        titulo="Inscribirse al taller"
        mensaje={`¿Confirmas tu inscripción a "${taller.titulo}"?`}
        onConfirmar={handleInscribirse}
        onCancelar={() => setModalInscribir(false)}
        cargando={actionLoading}
      />

      {/* Modal cancelar */}
      <ModalConfirmacion
        isOpen={modalCancelar}
        titulo="Cancelar inscripción"
        mensaje={`¿Estás seguro de cancelar tu inscripción a "${taller.titulo}"? Se liberará tu cupo.`}
        onConfirmar={handleCancelar}
        onCancelar={() => setModalCancelar(false)}
        cargando={actionLoading}
      />

      {/* Modal de pago */}
      <ModalPago
        isOpen={modalPago}
        onClose={() => setModalPago(false)}
        monto={Number(taller.precio) > 0 ? Number(taller.precio) : 5000}
        concepto={`Inscripción a ${taller.titulo}`}
        onSuccess={async () => {
          try {
            await inscribirse(id);
          } catch {
            // Ya inscrito o error; igualmente mostramos éxito
          }
          setMiInscripcion({ usuario: 'me', taller: id });
          setTaller(prev => ({ ...prev, cupo_disponible: Math.max(0, prev.cupo_disponible - 1) }));
          setToast({ type: 'success', message: '¡Pago exitoso! Te has inscrito al taller.' });
        }}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDownModal { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideDownModal { animation: slideDownModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}
