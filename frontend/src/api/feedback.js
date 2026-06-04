// src/api/feedback.js
import { API_URL } from './config';

export const getFeedback = async (targetTipo, targetId) => {
  try {
    const response = await fetch(`${API_URL}/feedback/${targetTipo}/${targetId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener feedback');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getResumenFeedback = async (targetTipo, targetId) => {
  try {
    const response = await fetch(`${API_URL}/feedback/resumen/${targetTipo}/${targetId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener resumen');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const enviarFeedback = async ({ targetTipo, targetId, rating, comentario }) => {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetTipo, targetId, rating, comentario }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al enviar feedback');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
