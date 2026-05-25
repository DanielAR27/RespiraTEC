// src/api/afiliaciones.js
import { API_URL } from './config';

export const getAfiliacionesAsociacion = async (asociacionId) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/asociacion/${asociacionId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al obtener afiliaciones');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const solicitarAfiliacion = async (asociacionId) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ asociacionId }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al solicitar afiliación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const responderSolicitud = async (id, estado) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al responder solicitud');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const modificarRolAfiliacion = async (id, rol_asociacion) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/${id}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rol_asociacion }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al modificar rol');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const agregarRepresentanteDirecto = async (usuarioId, asociacionId) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/representante`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuarioId, asociacionId }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al agregar representante');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const eliminarAfiliacion = async (id) => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al eliminar afiliación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMisAsociaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/afiliaciones/mis-asociaciones`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al obtener tus asociaciones');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
