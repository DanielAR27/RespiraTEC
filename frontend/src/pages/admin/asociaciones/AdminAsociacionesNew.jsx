import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsociacionForm from '../../../components/forms/AsociacionForm';
import { crearAsociacion } from '../../../api/asociaciones';

export default function AdminAsociacionesNew() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/admin/asociaciones');
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorToast('');
    try {
      const response = await crearAsociacion(formData);
      if (response.success) {
        navigate('/admin/asociaciones', { 
          state: { 
            successMessage: `Se ha creado la asociación "${response.data.nombre}" exitosamente` 
          } 
        });
      }
    } catch (error) {
      setErrorToast(error.message || 'Ocurrió un error al crear la asociación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          title="Volver"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Nueva Asociación</h1>
          <p className="text-gray-500 text-sm mt-1">Completa los datos para registrar una nueva asociación en el sistema.</p>
        </div>
      </div>

      {/* Toast de Error */}
      {errorToast && (
        <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-r-lg p-4 flex items-center justify-between mb-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-lg font-bold">!</span>
            </div>
            <p className="text-gray-800 font-medium text-sm">{errorToast}</p>
          </div>
          <button 
            onClick={() => setErrorToast('')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Formulario */}
      <AsociacionForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitText="Crear Asociación"
      />

      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
