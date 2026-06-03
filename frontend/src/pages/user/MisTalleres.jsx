import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisInscripciones } from '../../api/inscripciones';
import { useAuth } from '../../context/AuthContext';

const NIVEL_COLOR = {
  Principiante: 'bg-green-100 text-green-700',
  Intermedio:   'bg-yellow-100 text-yellow-700',
  Avanzado:     'bg-red-100 text-red-700',
};

const formatearFechaCorta = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });

const formatearFechaLarga = (fechaStr) =>
  new Date(fechaStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

// Abre una nueva ventana con el certificado en HTML y lo manda a imprimir
const generarCertificado = (inscripcion, nombreUsuario) => {
  const t = inscripcion.taller;
  const nombre      = nombreUsuario || 'Participante';
  const titulo      = t.titulo;
  const instructor  = t.instructor;
  const nivel       = t.nivel;
  const fechaInicio = formatearFechaLarga(t.fecha_inicio);
  const fechaFin    = formatearFechaLarga(t.fecha_fin);
  const fechaEmision = new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Certificado — ${titulo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #f0f0ea;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      min-height: 100vh;
    }
    .no-print {
      text-align: center;
      margin-bottom: 24px;
      font-family: 'Trebuchet MS', sans-serif;
      color: #555;
    }
    .no-print p { margin-bottom: 10px; font-size: 14px; }
    .btn-print {
      padding: 10px 28px;
      background: #243e7b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .btn-print:hover { background: #1a2f60; }
    .certificate {
      background: white;
      width: 860px;
      max-width: 100%;
      padding: 64px 80px;
      position: relative;
      border: 3px solid #243e7b;
      box-shadow: 0 4px 32px rgba(0,0,0,0.12);
    }
    .certificate::before {
      content: '';
      display: block;
      height: 8px;
      background: linear-gradient(90deg, #243e7b, #5cc0b6);
      position: absolute;
      top: 0; left: 0; right: 0;
    }
    .certificate::after {
      content: '';
      display: block;
      height: 8px;
      background: linear-gradient(90deg, #5cc0b6, #243e7b);
      position: absolute;
      bottom: 0; left: 0; right: 0;
    }
    .brand { text-align: center; margin-bottom: 36px; }
    .brand-name {
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 26px;
      font-weight: bold;
      color: #243e7b;
      letter-spacing: 7px;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 11px;
      color: #5cc0b6;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .divider {
      width: 72px;
      height: 2px;
      background: linear-gradient(90deg, #243e7b, #5cc0b6);
      margin: 14px auto;
    }
    .cert-type {
      text-align: center;
      font-size: 32px;
      color: #1a2f60;
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: normal;
      margin-bottom: 6px;
    }
    .cert-of {
      text-align: center;
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 36px;
    }
    .granted-to {
      text-align: center;
      font-size: 15px;
      color: #666;
      font-style: italic;
      margin-bottom: 10px;
    }
    .recipient {
      text-align: center;
      font-size: 44px;
      color: #243e7b;
      padding-bottom: 10px;
      margin: 0 32px 10px;
      border-bottom: 2px solid #5cc0b6;
    }
    .completion {
      text-align: center;
      font-size: 15px;
      color: #666;
      font-style: italic;
      margin-bottom: 14px;
    }
    .workshop-title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      color: #243e7b;
      margin-bottom: 32px;
      padding: 0 16px;
    }
    .details {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
      margin-bottom: 44px;
    }
    .detail { text-align: center; }
    .detail-label {
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 10px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: block;
      margin-bottom: 5px;
    }
    .detail-value {
      font-size: 14px;
      color: #333;
      font-weight: bold;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
    }
    .sig-block { text-align: center; min-width: 180px; }
    .sig-line {
      border-top: 1px solid #444;
      padding-top: 8px;
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }
    .emit-date {
      font-family: 'Trebuchet MS', sans-serif;
      font-size: 11px;
      color: #aaa;
      text-align: right;
      line-height: 1.7;
    }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none !important; }
      .certificate { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <p>Usa <strong>Ctrl+P</strong> o el botón de abajo para guardar como PDF.</p>
    <button class="btn-print" onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>
  <div class="certificate">
    <div class="brand">
      <div class="brand-name">RespiraTEC</div>
      <div class="brand-tagline">Plataforma Estudiantil Universitaria</div>
      <div class="divider"></div>
    </div>
    <div class="cert-type">Certificado</div>
    <div class="cert-of">de Participación</div>
    <div class="granted-to">Se otorga el presente certificado a</div>
    <div class="recipient">${nombre}</div>
    <div class="completion">por haber completado satisfactoriamente el taller</div>
    <div class="workshop-title">&ldquo;${titulo}&rdquo;</div>
    <div class="details">
      <div class="detail">
        <span class="detail-label">Instructor</span>
        <span class="detail-value">${instructor}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Nivel</span>
        <span class="detail-value">${nivel}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Período</span>
        <span class="detail-value">${fechaInicio} &ndash; ${fechaFin}</span>
      </div>
    </div>
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line">${instructor}<br/>Instructor del Taller</div>
      </div>
      <div class="emit-date">
        Emitido el ${fechaEmision}<br/>
        RespiraTEC &mdash; Plataforma Estudiantil
      </div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1000,height=750,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

export default function MisTalleres() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading]             = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await getMisInscripciones();
        setInscripciones(res.data || []);
      } catch (err) {
        console.error('Error al cargar inscripciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#5cc0b6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando tus talleres...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Mis Talleres</h1>
        <p className="text-gray-500 text-sm mt-1">Consulta tus inscripciones y descarga tus certificados.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#5cc0b6]"></div>

        {inscripciones.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 font-bold text-lg">Aún no tienes inscripciones.</p>
            <p className="text-sm text-gray-400 mt-2">Explora los talleres disponibles y únete a uno.</p>
            <button
              onClick={() => navigate('/talleres')}
              className="mt-4 px-6 py-2.5 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold rounded-xl text-sm transition-colors"
            >
              Ver talleres disponibles
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {inscripciones.map((inscripcion) => {
              const t = inscripcion.taller;
              if (!t) return null;

              const finalizado       = new Date() > new Date(t.fecha_fin);
              const puedeCertificar  = finalizado && t.tiene_certificacion;

              return (
                <div
                  key={inscripcion._id}
                  className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Imagen */}
                  <div className="sm:w-36 h-32 sm:h-auto shrink-0 bg-gradient-to-br from-[#243e7b]/10 to-[#5cc0b6]/10 overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                    <img
                      src={t.imagen_url}
                      alt={t.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${NIVEL_COLOR[t.nivel] || 'bg-gray-100 text-gray-700'}`}>
                          {t.nivel}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          finalizado
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {finalizado ? 'Finalizado' : 'En curso'}
                        </span>
                        {t.tiene_certificacion && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#243e7b] text-white">
                            Con certificado
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-[#243e7b] line-clamp-2 mb-0.5">
                        {t.titulo}
                      </h3>
                      <p className="text-sm text-gray-500">Por {t.instructor}</p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatearFechaCorta(t.fecha_inicio)} — {formatearFechaCorta(t.fecha_fin)}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/talleres/${t._id}`)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver detalle
                      </button>

                      {puedeCertificar && (
                        <button
                          onClick={() => generarCertificado(inscripcion, user?.nombre)}
                          className="px-4 py-2 bg-[#243e7b] hover:bg-[#1a2f60] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Descargar certificado
                        </button>
                      )}

                      {finalizado && t.tiene_certificacion === false && (
                        <span className="px-4 py-2 text-gray-400 text-xs font-medium flex items-center gap-1.5">
                          Sin certificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </main>
  );
}
