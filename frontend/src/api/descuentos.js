import { API_URL } from './config';

export const getDescuentos = async () => {
  try {
    const response = await fetch(`${API_URL}/descuentos`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener descuentos');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearDescuento = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/descuentos`, {
      method: 'POST',
      body: formData, 
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al crear el descuento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleDescuentoStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/descuentos/${id}/estado`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al cambiar el estado del descuento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDescuentoById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/descuentos/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener el descuento');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateDescuento = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL}/descuentos/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al actualizar el descuento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteDescuento = async (id) => {
  try {
    const response = await fetch(`${API_URL}/descuentos/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar el descuento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
