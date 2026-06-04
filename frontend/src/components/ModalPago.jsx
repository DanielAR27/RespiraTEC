import { useState, useEffect } from 'react';

const formatColones = (n) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
  }).format(n || 0);

const TELEFONO_SINPE = '8888-8888';
const TITULAR_SINPE = 'RespiraTEC S.A.';

export default function ModalPago({ isOpen, onClose, monto = 0, concepto = '', onSuccess }) {
  const [metodo, setMetodo] = useState(null);
  const [paso, setPaso] = useState('seleccion');
  const [datos, setDatos] = useState({ numero: '', expiracion: '', cvv: '', nombre: '' });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen) {
      setMetodo(null);
      setPaso('seleccion');
      setDatos({ numero: '', expiracion: '', cvv: '', nombre: '' });
      setErrores({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (paso !== 'exito') return;
    const t = setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [paso, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && paso !== 'procesando') onClose();
  };

  const formatNumeroTarjeta = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiracion = (v) => {
    const limpio = v.replace(/\D/g, '').slice(0, 4);
    if (limpio.length <= 2) return limpio;
    return `${limpio.slice(0, 2)}/${limpio.slice(2)}`;
  };

  const handleChangeTarjeta = (campo, valor) => {
    let v = valor;
    if (campo === 'numero') v = formatNumeroTarjeta(valor);
    else if (campo === 'expiracion') v = formatExpiracion(valor);
    else if (campo === 'cvv') v = valor.replace(/\D/g, '').slice(0, 3);
    else if (campo === 'nombre') v = valor.toUpperCase().slice(0, 40);
    setDatos((d) => ({ ...d, [campo]: v }));
    setErrores((er) => ({ ...er, [campo]: '' }));
  };

  const validarTarjeta = () => {
    const er = {};
    const numLimpio = datos.numero.replace(/\s/g, '');
    if (!numLimpio) er.numero = 'Número requerido';
    else if (!/^\d{16}$/.test(numLimpio)) er.numero = 'Debe tener 16 dígitos';

    if (!datos.expiracion) er.expiracion = 'Fecha requerida';
    else if (!/^\d{2}\/\d{2}$/.test(datos.expiracion)) er.expiracion = 'Formato MM/AA';
    else {
      const [mm, aa] = datos.expiracion.split('/').map((x) => parseInt(x, 10));
      if (mm < 1 || mm > 12) er.expiracion = 'Mes inválido';
      else {
        const ahora = new Date();
        const anio = ahora.getFullYear() % 100;
        const mesActual = ahora.getMonth() + 1;
        if (aa < anio || (aa === anio && mm < mesActual)) er.expiracion = 'Tarjeta vencida';
      }
    }

    if (!datos.cvv) er.cvv = 'CVV requerido';
    else if (!/^\d{3}$/.test(datos.cvv)) er.cvv = 'Debe tener 3 dígitos';

    if (!datos.nombre.trim()) er.nombre = 'Nombre requerido';
    else if (datos.nombre.trim().length < 3) er.nombre = 'Nombre muy corto';

    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const procesarPago = (esTarjeta) => {
    if (esTarjeta && !validarTarjeta()) return;
    setPaso('procesando');
    setTimeout(() => setPaso('exito'), 2000);
  };

  const seleccionarMetodo = (m) => {
    setMetodo(m);
    setPaso('formulario');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SINPE:${TELEFONO_SINPE}|MONTO:${monto}|CONCEPTO:${encodeURIComponent(concepto || 'Pago RespiraTEC')}`;

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeInPago"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUpPago relative">

        {/* Header degradado */}
        <div className="bg-gradient-to-br from-[#243e7b] to-[#5cc0b6] px-6 py-5 text-white relative">
          <button
            onClick={() => paso !== 'procesando' && onClose()}
            disabled={paso === 'procesando'}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs uppercase tracking-widest font-bold text-white/80">Pasarela de pago</p>
          <h2 className="text-xl font-extrabold mt-1">{concepto || 'Pago RespiraTEC'}</h2>
          <p className="text-3xl font-black mt-2">{formatColones(monto)}</p>
        </div>

        <div className="px-6 py-6">

          {paso === 'seleccion' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-500 mb-1">Elige tu método de pago</p>

              <button
                onClick={() => seleccionarMetodo('tarjeta')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#5cc0b6] hover:bg-[#5cc0b6]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#243e7b]/10 group-hover:bg-[#243e7b]/15 flex items-center justify-center text-[#243e7b]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#243e7b]">Tarjeta de crédito / débito</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, AMEX</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#5cc0b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => seleccionarMetodo('sinpe')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#5cc0b6] hover:bg-[#5cc0b6]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5cc0b6]/15 group-hover:bg-[#5cc0b6]/25 flex items-center justify-center text-[#5cc0b6]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#243e7b]">SINPE Móvil</p>
                  <p className="text-xs text-gray-500">Transferencia inmediata</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#5cc0b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <p className="text-[11px] text-gray-400 text-center pt-2 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pago simulado · Modo demostración
              </p>
            </div>
          )}

          {paso === 'formulario' && metodo === 'tarjeta' && (
            <div className="space-y-4">
              <button
                onClick={() => setPaso('seleccion')}
                className="flex items-center text-xs font-semibold text-gray-500 hover:text-[#243e7b] transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cambiar método
              </button>

              {/* Mock de tarjeta */}
              <div className="rounded-2xl bg-gradient-to-br from-[#243e7b] via-[#2d4a8f] to-[#5cc0b6] p-5 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded-md bg-yellow-300/90"></div>
                  <p className="font-black tracking-wider italic text-lg">VISA</p>
                </div>
                <p className="font-mono text-lg tracking-widest mt-5">
                  {datos.numero || '•••• •••• •••• ••••'}
                </p>
                <div className="flex justify-between mt-4 text-[11px]">
                  <div>
                    <p className="text-white/60 uppercase">Titular</p>
                    <p className="font-bold truncate max-w-[180px]">{datos.nombre || 'NOMBRE APELLIDO'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 uppercase">Expira</p>
                    <p className="font-bold">{datos.expiracion || 'MM/AA'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Número de tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={datos.numero}
                  onChange={(e) => handleChangeTarjeta('numero', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 focus:outline-none transition-colors font-mono ${
                    errores.numero ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#5cc0b6]'
                  }`}
                />
                {errores.numero && <p className="text-xs text-red-500 mt-1 font-semibold">{errores.numero}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiración</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={datos.expiracion}
                    onChange={(e) => handleChangeTarjeta('expiracion', e.target.value)}
                    placeholder="MM/AA"
                    className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 focus:outline-none transition-colors font-mono ${
                      errores.expiracion ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#5cc0b6]'
                    }`}
                  />
                  {errores.expiracion && <p className="text-xs text-red-500 mt-1 font-semibold">{errores.expiracion}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={datos.cvv}
                    onChange={(e) => handleChangeTarjeta('cvv', e.target.value)}
                    placeholder="123"
                    className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 focus:outline-none transition-colors font-mono ${
                      errores.cvv ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#5cc0b6]'
                    }`}
                  />
                  {errores.cvv && <p className="text-xs text-red-500 mt-1 font-semibold">{errores.cvv}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del titular</label>
                <input
                  type="text"
                  value={datos.nombre}
                  onChange={(e) => handleChangeTarjeta('nombre', e.target.value)}
                  placeholder="NOMBRE APELLIDO"
                  className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 focus:outline-none transition-colors ${
                    errores.nombre ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#5cc0b6]'
                  }`}
                />
                {errores.nombre && <p className="text-xs text-red-500 mt-1 font-semibold">{errores.nombre}</p>}
              </div>

              <button
                onClick={() => procesarPago(true)}
                className="w-full py-3 mt-2 rounded-xl bg-[#243e7b] hover:bg-[#1a2f60] text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar {formatColones(monto)}
              </button>
            </div>
          )}

          {paso === 'formulario' && metodo === 'sinpe' && (
            <div className="space-y-4">
              <button
                onClick={() => setPaso('seleccion')}
                className="flex items-center text-xs font-semibold text-gray-500 hover:text-[#243e7b] transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cambiar método
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-2xl border-2 border-gray-100">
                  <img
                    src={qrUrl}
                    alt="Código QR SINPE"
                    className="w-48 h-48"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Escanea o realiza la transferencia manual</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#5cc0b6]/10 to-[#243e7b]/10 border border-[#5cc0b6]/30 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Número SINPE</span>
                  <span className="font-mono font-extrabold text-[#243e7b] text-lg">{TELEFONO_SINPE}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titular</span>
                  <span className="font-semibold text-[#243e7b] text-sm">{TITULAR_SINPE}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#5cc0b6]/30 pt-2 mt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</span>
                  <span className="font-extrabold text-[#5cc0b6] text-lg">{formatColones(monto)}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 text-center px-4">
                Realiza la transferencia desde la app de tu banco e indica en el detalle:
                <span className="font-bold text-[#243e7b]"> "{concepto || 'Pago RespiraTEC'}"</span>
              </p>

              <button
                onClick={() => procesarPago(false)}
                className="w-full py-3 rounded-xl bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Ya realicé el pago
              </button>
            </div>
          )}

          {paso === 'procesando' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-[#5cc0b6]"></div>
              </div>
              <p className="font-bold text-[#243e7b]">Procesando tu pago...</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Estamos verificando la transacción. No cierres esta ventana.
              </p>
            </div>
          )}

          {paso === 'exito' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-fadeInPago">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5cc0b6]/30 rounded-full animate-ping"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#5cc0b6] to-[#243e7b] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[#243e7b]">¡Pago exitoso!</h3>
              <div className="bg-gray-50 rounded-xl px-5 py-3 w-full">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monto pagado</p>
                <p className="text-2xl font-extrabold text-[#5cc0b6] mt-1">{formatColones(monto)}</p>
                {concepto && <p className="text-xs text-gray-500 mt-1">{concepto}</p>}
              </div>
              <p className="text-xs text-gray-400">
                Comprobante enviado a tu correo electrónico.
              </p>
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#243e7b] hover:bg-[#1a2f60] text-white font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInPago { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpPago {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInPago { animation: fadeInPago 0.25s ease-out forwards; }
        .animate-slideUpPago { animation: slideUpPago 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
