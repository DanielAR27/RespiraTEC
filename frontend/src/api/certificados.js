// src/api/certificados.js
import { API_URL } from './config';

export const descargarCertificado = async (tallerId, nombreSugerido = 'certificado') => {
  try {
    const response = await fetch(`${API_URL}/certificados/${tallerId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      let mensaje = 'Error al descargar el certificado';
      try {
        const data = await response.json();
        mensaje = data.error || mensaje;
      } catch (_) {}
      throw new Error(mensaje);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreSugerido}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
