import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DescuentoForm from '../../../components/forms/DescuentoForm';
import { getDescuentoById, updateDescuento } from '../../../api/descuentos';

export default function AdminDescuentosEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descuentoData, setDescuentoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDescuentoById(id);
        if (res.success) {
          setDescuentoData(res.data);
        }
      } catch (err) {
        setError('Error al cargar el beneficio. ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await updateDescuento(id, formData);
      if (res.success) {
        navigate('/admin/descuentos', { 
          state: { successMessage: `Se ha actualizado el beneficio "${res.data.titulo}" exitosamente` }
        });
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar el beneficio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/descuentos');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

  if (error && !descuentoData) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-10 bg-red-50 rounded-2xl border border-red-100">
        <h2 className="text-xl font-bold text-red-600 mb-2">Ups, algo salió mal</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <button 
          onClick={handleCancel}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl transition-colors"
        >
          Volver al panel
        </button>
      </div>
    );
  }

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
        <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Editar Beneficio</h1>
        <p className="text-gray-500 mt-1">Modifica los detalles del descuento para el comercio {descuentoData?.comercio}.</p>
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
        initialData={descuentoData}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isSubmitting={isSubmitting}
        submitText="Actualizar Beneficio"
      />
    </main>
  );
}
