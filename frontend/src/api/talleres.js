// src/api/talleres.js
import { API_URL } from './config';

export const getTalleres = async () => {
  try {
    const response = await fetch(`${API_URL}/talleres`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener talleres');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearTaller = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/talleres`, {
      method: 'POST',
      body: formData, 
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al crear el taller');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTaller = async (id) => {
  try {
    const response = await fetch(`${API_URL}/talleres/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener el taller');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTaller = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL}/talleres/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al actualizar el taller');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteTaller = async (id) => {
  try {
    const response = await fetch(`${API_URL}/talleres/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar el taller');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleTallerStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/talleres/${id}/estado`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al cambiar el estado del taller');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
