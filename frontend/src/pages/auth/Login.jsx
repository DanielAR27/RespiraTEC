import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import bgImage from '../../assets/login_bg.png';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, name: '' });
  
  const { setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.registeredName) {
      setSuccessModal({ show: true, name: location.state.registeredName });
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setSuccessModal({ show: false, name: '' });
        // Clear state so it doesn't reappear on refresh
        navigate('/login', { replace: true, state: {} });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const closeSuccessModal = () => {
    setSuccessModal({ show: false, name: '' });
    navigate('/login', { replace: true, state: {} });
  };

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
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/home');
      }
    } catch (error) {
      showError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white relative overflow-hidden">
      
      {/* Mitad de Imagen (Decorativa) */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#243e7b]/90 to-[#5cc0b6]/80 mix-blend-multiply z-10"></div>
        <img 
          src={bgImage} 
          alt="Estudiantes en evento" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight drop-shadow-md">Conecta con tu Futuro</h1>
            <p className="text-lg lg:text-xl font-medium drop-shadow-md text-white/90">
              Descubre eventos exclusivos, talleres y asociaciones en la comunidad de RespiraTEC.
            </p>
          </div>
        </div>
      </div>

      {/* Mitad de Formulario */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 relative">
        {/* Toast de Error (Móvil: inline arriba de la tarjeta, Escritorio: flotante centrado arriba) */}
        {errorToast && (
          <div className="mb-4 w-full md:fixed md:top-6 md:left-0 md:right-0 md:z-50 md:flex md:justify-center md:px-6 md:mb-0">
            <div className="bg-red-50 border-l-4 border-red-500 shadow-md rounded-r-lg p-4 flex items-center justify-between w-full max-w-md md:max-w-2xl lg:max-w-3xl animate-fade-in-down">
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
          </div>
        )}


      {/* Modal de Éxito al venir de Registro */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-scale-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-8">Se ha registrado exitosamente <strong>{successModal.name}</strong>. Por favor, inicia sesión con tus credenciales.</p>
            <button 
              onClick={closeSuccessModal}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#243e7b] to-[#3a62c1] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta de Login */}
      <div className="bg-white w-full max-w-md">
        


        <div className="text-center mb-8">
          <img src={logo} alt="Logo RespiraTEC" className="h-20 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl md:text-3xl font-black text-[#243e7b]">Bienvenido de nuevo</h2>
          <p className="text-gray-500 mt-2 text-sm">Ingresa a tu cuenta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800"
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
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all duration-300 mt-2 flex items-center justify-center ${
              isLoading 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-[#5cc0b6] hover:bg-[#4eb3a8] hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-bold text-[#243e7b] hover:text-[#5cc0b6] transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>

      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
        @keyframes scale-up {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}