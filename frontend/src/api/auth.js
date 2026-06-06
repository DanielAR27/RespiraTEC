import { API_URL } from './config';

// Iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // OBLIGATORIO: Permite al navegador recibir y guardar la cookie httpOnly
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');
    return data;
  } catch (error) {
    console.error('Error en API login:', error.message);
    throw error;
  }
};

// Registrar usuario (Público - por defecto creará rol 'user')
export const register = async (nombre, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password }),
      credentials: 'include', // Guarda la cookie inmediatamente tras registrarse
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el registro');
    return data;
  } catch (error) {
    console.error('Error en API register:', error.message);
    throw error;
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Se envía la cookie actual para su destrucción en el servidor
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al cerrar sesión');
    return data;
  } catch (error) {
    console.error('Error en API logout:', error.message);
    throw error;
  }
};

// Verificar persistencia de sesión (Se ejecuta al recargar la página)
export const getMe = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Envía la cookie almacenada para validarla en el servidor
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Sesión inválida o expirada');
    return data;
  } catch (error) {
    // No inunda la consola con errores si simplemente no está logueado
    throw error;
  }
};