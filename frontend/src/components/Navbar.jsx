import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para el dropdown del administrador
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  
  const { user, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Inicio', path: '/home' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Talleres', path: '/talleres' },
    { name: 'Descuentos', path: '/descuentos' },
    { name: 'Asociaciones', path: '/asociaciones' },
    { name: 'Contacto', path: '/contacto' },
  ];

  // Lista separada para los CRUDs
  const adminItems = [
    { name: 'Eventos', path: '/admin/eventos' },
    { name: 'Descuentos', path: '/admin/descuentos' },
    { name: 'Talleres', path: '/admin/talleres' },
    { name: 'Asociaciones', path: '/admin/asociaciones' },
    { name: 'Usuarios', path: '/admin/usuarios' },
  ];

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    function handleClickOutside(event) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    // Se limpia el evento cuando el componente se destruye para evitar problemas de memoria
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <nav className="relative bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 md:px-8">
        
        <div className="flex items-center gap-3 cursor-pointer">
          <img 
            src={logo} 
            alt="Logo RespiraTEC" 
            className="h-10 md:h-12 w-auto object-contain" 
          />
        </div>

        <ul className="hidden md:flex items-center space-x-8 text-[15px]">
          {navItems.map((item) => {
            const isSelected = item.path === currentPath;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`pb-1 transition-colors duration-200 ${
                    isSelected
                      ? 'text-[#243e7b] font-black border-b-[3px] border-[#5cc0b6]'
                      : 'text-[#243e7b] font-semibold hover:text-[#5cc0b6]'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sección Derecha */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Contenedor relativo para el Dropdown de Admin */}
          {user && user.role === 'admin' && (
            <div ref={adminDropdownRef} className="relative hidden md:block">
              <button 
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isAdminMenuOpen ? 'bg-gray-100 text-[#5cc0b6]' : 'text-gray-400 hover:bg-gray-100 hover:text-[#5cc0b6]'
                }`}
                title="Panel de Administración"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Menú Desplegable de Admin (Solo Escritorio) */}
              {isAdminMenuOpen && (
                <div className="hidden md:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Administración
                  </div>
                  <ul className="flex flex-col">
                    {adminItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          onClick={() => setIsAdminMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-[#243e7b] hover:bg-[#5cc0b6] hover:text-white transition-colors duration-150"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div ref={userDropdownRef} className="relative hidden md:block">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isUserMenuOpen ? 'bg-gray-100 text-[#5cc0b6]' : 'text-[#243e7b] hover:bg-gray-100'
              }`}
              aria-label="Perfil de usuario"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
                <ul className="flex flex-col py-1">
                  <li>
                    <Link
                      to="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#243e7b] hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2"
                    >
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mis-asociaciones"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#243e7b] hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2"
                    >
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Mis Asociaciones
                    </Link>
                  </li>
                  <li className="border-t border-gray-100 my-1"></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-[#243e7b]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Desplegable Principal para Móviles */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 z-50">
          <ul className="flex flex-col px-6 py-4 space-y-4">
            {navItems.map((item) => {
              const isSelected = item.path === currentPath;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full ${
                      isSelected
                        ? 'text-[#243e7b] font-black border-l-4 border-[#5cc0b6] pl-2'
                        : 'text-[#243e7b] font-semibold pl-3'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
            
            {/* Sección de Admin integrada en el menú móvil */}
            {user && user.role === 'admin' && (
              <li className="pt-4 mt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-3">
                  Administración
                </p>
                <ul className="flex flex-col space-y-3">
                  {adminItems.map((item) => {
                    const isSelected = item.path === currentPath;
                    return (
                      <li key={`mobile-admin-${item.name}`}>
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block w-full flex items-center ${
                            isSelected
                              ? 'text-[#243e7b] font-black border-l-4 border-[#5cc0b6] pl-5'
                              : 'text-gray-500 font-medium pl-6 hover:text-[#5cc0b6]'
                          }`}
                        >
                          <span className="mr-2">⚙️</span> {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}

            {/* Mi Perfil y Mis Asociaciones en móvil */}
            <li className="pt-4 mt-2 border-t border-gray-100">
              <Link
                to="/perfil"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full flex items-center text-[#243e7b] font-semibold pl-3 hover:text-[#5cc0b6] mb-4"
              >
                <span className="mr-2">👤</span> Mi Perfil
              </Link>
              <Link
                to="/mis-asociaciones"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full flex items-center text-[#243e7b] font-semibold pl-3 hover:text-[#5cc0b6]"
              >
                <span className="mr-2">👥</span> Mis Asociaciones
              </Link>
            </li>

            {/* Logout en móvil */}
            <li className="pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center text-red-500 font-semibold pl-3 hover:text-red-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}