import { API_URL } from './config';

export const getAsociaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/asociaciones`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener asociaciones');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAsociacionById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/asociaciones/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al obtener la asociación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearAsociacion = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/asociaciones`, {
      method: 'POST',
      body: formData, 
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al crear la asociación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateAsociacion = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL}/asociaciones/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al actualizar la asociación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteAsociacion = async (id) => {
  try {
    const response = await fetch(`${API_URL}/asociaciones/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar la asociación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleAsociacionStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/asociaciones/${id}/estado`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al cambiar el estado de la asociación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
