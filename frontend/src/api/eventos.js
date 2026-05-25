// src/api/eventos.js
import { API_URL } from './config';

export const getEventos = async () => {
  try {
    const response = await fetch(`${API_URL}/eventos`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener eventos');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearEvento = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      body: formData, 
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al crear el evento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getEvento = async (id) => {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener el evento');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateEvento = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al actualizar el evento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar el evento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleEventoStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}/estado`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al cambiar el estado del evento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};