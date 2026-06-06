import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

// Se crea el Contexto
const AuthContext = createContext();

// Se crea el Provider (el componente que envolverá a toda la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, se verifica la cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Datos y funciones expuestas al proveedor de contexto
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setUser, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personalizado para facilitar el uso del contexto
export const useAuth = () => {
  return useContext(AuthContext);
};