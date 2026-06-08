import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import logo from '../../assets/logo.png';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Validaciones de contraseña (consistente con el backend)
  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(formData.password);
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar && hasUpperCase;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showError = (msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    if (!passwordsMatch) {
      showError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const data = await register(formData.nombre, formData.email, formData.password);
      if (data.success) {
        navigate('/login', { state: { registeredName: formData.nombre } });
      }
    } catch (error) {
      if (error.message.includes('correo electrónico ya está registrado')) {
        showError('Este correo ya se encuentra registrado');
      } else {
        showError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      
      {/* Fondo de Pantalla con Patrón de Iconos */}
      <div className="absolute inset-0 z-0 bg-[#29a8ff] overflow-hidden">
        {/* Patrón SVG */}
        <svg width="100%" height="100%" className="absolute inset-0 z-0 opacity-90">
          <defs>
            <pattern id="event-icons" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              {/* Bombilla */}
              <g transform="translate(20, 20) scale(1.5)" stroke="#93e49b" fill="none" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </g>
              {/* Nota Musical */}
              <g transform="translate(100, 20) scale(1.5)" stroke="#93e49b" fill="none" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </g>
              {/* Chat */}
              <g transform="translate(20, 100) scale(1.5)" stroke="#93e49b" fill="none" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </g>
              {/* Ticket de Evento */}
              <g transform="translate(100, 100) scale(1.5)" stroke="#93e49b" fill="none" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#event-icons)" />
        </svg>

        {/* Elemento decorativo extra para darle dinamismo sutil sobre el patrón */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#93e49b] rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-10"></div>
      </div>

      {/* Contenedor Central */}
      <div className="relative z-20 w-full max-w-md">
        
        {/* Toast de Error integrado al tamaño de la caja (estilo eventos), fuera de la tarjeta */}
        {errorToast && (
          <div className="bg-red-50 border-l-4 border-red-500 shadow-md rounded-r-lg p-4 flex items-center justify-between mb-4 animate-fade-in-down">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-700 font-bold text-sm">{errorToast}</p>
            </div>
            <button 
              onClick={() => setErrorToast('')}
              className="text-red-800 hover:text-red-950 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}


        {/* Tarjeta de Registro (Glassmorphism) */}
        <div className="bg-white/95 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/60">
          

          <div className="text-center mb-8">
            <img src={logo} alt="Logo RespiraTEC" className="h-16 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl md:text-3xl font-black text-[#243e7b]">Crea tu cuenta</h2>
            <p className="text-gray-600 mt-2 text-sm font-medium">Únete a nuestra comunidad y descubre más.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="nombre">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 shadow-sm"
                placeholder="Ej. Juan Pérez"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 shadow-sm"
                placeholder="********"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#243e7b] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicadores de fortaleza de contraseña */}
            {formData.password.length > 0 && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Requisitos de contraseña segura:</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {hasMinLength ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                    </svg>
                    Mínimo 8 caracteres
                  </li>
                  <li className={`text-xs flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {hasNumber ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                    </svg>
                    Al menos un número
                  </li>
                  <li className={`text-xs flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {hasUpperCase ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                    </svg>
                    Al menos una mayúscula
                  </li>
                  <li className={`text-xs flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {hasSpecialChar ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                    </svg>
                    Al menos un carácter especial (+, !, @, #, etc.)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-800 shadow-sm ${
                  formData.confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-green-400 focus:ring-green-300'
                      : 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-[#5cc0b6]'
                }`}
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#243e7b] transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Indicador de coincidencia */}
            {formData.confirmPassword.length > 0 && (
              <p className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${
                passwordsMatch ? 'text-green-600' : 'text-red-500'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {passwordsMatch
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  }
                </svg>
                {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={!isPasswordValid || !passwordsMatch || isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all duration-300 mt-2 flex items-center justify-center ${
              !isPasswordValid || !passwordsMatch || isLoading 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-[#5cc0b6] hover:bg-[#4eb3a8] hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-[#243e7b] hover:text-[#5cc0b6] transition-colors">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
    <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-up {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
