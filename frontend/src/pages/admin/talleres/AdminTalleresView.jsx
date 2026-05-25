import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TallerForm from '../../../components/forms/TallerForm';
import { getTaller } from '../../../api/talleres';

export default function AdminTalleresView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taller, setTaller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    const fetchTaller = async () => {
      try {
        const response = await getTaller(id);
        if (response.success) {
          setTaller(response.data);
        }
      } catch (error) {
        setErrorToast('Error al cargar el taller');
      } finally {
        setLoading(false);
      }
    };
    fetchTaller();
  }, [id]);

  const handleCancel = () => {
    navigate('/admin/talleres');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5cc0b6]"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Consultar Taller</h1>
          <p className="text-gray-500 text-sm mt-1">Detalles del taller registrado.</p>
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

      {/* Formulario (Modo Lectura) */}
      {taller && (
        <TallerForm 
          initialData={taller}
          onSubmit={() => {}} 
          onCancel={handleCancel}
          isReadOnly={true}
        />
      )}
    </main>
  );
}
