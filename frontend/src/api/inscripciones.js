// src/api/inscripciones.js
import { API_URL } from './config';

export const inscribirse = async (tallerId) => {
  try {
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tallerId }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al inscribirse en el taller');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const cancelarInscripcion = async (tallerId) => {
  try {
    const response = await fetch(`${API_URL}/inscripciones/${tallerId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al cancelar la inscripción');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMisInscripciones = async () => {
  try {
    const response = await fetch(`${API_URL}/inscripciones/mis-inscripciones`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener tus inscripciones');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
