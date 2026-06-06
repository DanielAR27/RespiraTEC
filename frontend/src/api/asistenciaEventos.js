// src/api/asistenciaEventos.js
import { API_URL } from './config';

export const asistirEvento = async (eventoId) => {
  const response = await fetch(`${API_URL}/asistencia-eventos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventoId }),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al registrar asistencia');
  return data;
};

export const cancelarAsistenciaEvento = async (eventoId) => {
  const response = await fetch(`${API_URL}/asistencia-eventos/${eventoId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al cancelar asistencia');
  return data;
};

export const getEstadoAsistencia = async (eventoId) => {
  const response = await fetch(`${API_URL}/asistencia-eventos/estado/${eventoId}`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al verificar asistencia');
  return data;
};
