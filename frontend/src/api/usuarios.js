// src/api/usuarios.js
import { API_URL } from './config';

// Buscar usuarios por query (para asignaciones rápidas en admin/representante)
export const buscarUsuarios = async (query) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/buscar?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al buscar usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Obtener perfil del usuario autenticado
export const getPerfil = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios/perfil`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al obtener el perfil');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Actualizar perfil (FormData soporta imágenes)
export const updatePerfil = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
      // Nota: No se define 'Content-Type' cabecera ya que el navegador la define automáticamente con el límite del multipart/form-data
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al actualizar el perfil');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Obtener todos los usuarios (Admin)
export const getTodosUsuarios = async (query = '') => {
  try {
    const url = query 
      ? `${API_URL}/usuarios?q=${encodeURIComponent(query)}` 
      : `${API_URL}/usuarios`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al obtener lista de usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Modificar rol de usuario (Admin)
export const updateRolUsuario = async (id, role) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al modificar rol del usuario');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Eliminar usuario en cascada (Admin)
export const deleteUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar usuario');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
