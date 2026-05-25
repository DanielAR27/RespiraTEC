import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DescuentoForm from '../../../components/forms/DescuentoForm';
import { crearDescuento } from '../../../api/descuentos';

export default function AdminDescuentosNew() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await crearDescuento(formData);
      if (res.success) {
        navigate('/admin/descuentos', { 
          state: { successMessage: `Se ha creado el descuento "${res.data.titulo}" exitosamente` }
        });
      }
    } catch (err) {
      setError(err.message || 'Error al guardar el descuento');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/descuentos');
  };

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <button 
          onClick={handleCancel}
          className="flex items-center text-[#243e7b] hover:text-[#5cc0b6] font-semibold transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Beneficios
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Agregar Nuevo Descuento</h1>
        <p className="text-gray-500 mt-1">Registra un nuevo beneficio o descuento asociado a un comercio.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-fade-in-down">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <DescuentoForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isSubmitting={isSubmitting} 
      />
    </main>
  );
}
