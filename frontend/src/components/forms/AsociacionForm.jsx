import { useState, useEffect } from 'react';

export default function AsociacionForm({ initialData = null, onSubmit, onCancel, isSubmitting, submitText = 'Guardar Asociación', isReadOnly = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'Otra'
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Si se pasa initialData (para editar), se rellena el formulario
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        tipo: initialData.tipo || 'Otra'
      });
      if (initialData.logo_url) {
        setPreview(initialData.logo_url);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogo(null);
      setPreview(initialData?.logo_url || null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isReadOnly) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isReadOnly) {
      onCancel(); // "Aceptar" simplemente sale de la vista
      return;
    }

    // Construye el FormData (necesario para enviar archivos)
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    
    // Si se subió una nueva imagen, se anexa
    if (logo) {
      data.append('logo', logo);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Información General */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Información de la Asociación</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nombre de la asociación"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="tipo">Tipo de Asociación</label>
            <select
              id="tipo"
              name="tipo"
              disabled={isReadOnly}
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="Académica">Académica</option>
              <option value="Cultural">Cultural</option>
              <option value="Deportiva">Deportiva</option>
              <option value="Recreativa">Recreativa</option>
              <option value="Social">Social</option>
              <option value="Otra">Otra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              disabled={isReadOnly}
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Detalles sobre la asociación..."
            ></textarea>
          </div>
        </div>

        {/* Columna Derecha: Multimedia */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Logo de la Asociación</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen del Logo</label>
            
            {isReadOnly ? (
              <div className="mt-1 w-full h-48 md:h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Vista previa del logo" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-400">Sin logo</p>
                )}
              </div>
            ) : (
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all relative overflow-hidden group h-48 md:h-64 items-center ${isDragging ? 'border-[#5cc0b6] bg-[#5cc0b6]/5' : 'border-gray-300 hover:border-[#5cc0b6]'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview && (
                  <div className="absolute inset-0 z-0 flex justify-center bg-gray-50">
                    <img src={preview} alt="Vista previa" className="h-full object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
                  </div>
                )}
                
                <div className={`space-y-1 text-center relative z-10 p-4 rounded-lg backdrop-blur-sm transition-all ${preview ? 'bg-white/70' : ''} ${isDragging ? 'scale-105' : ''}`}>
                  <svg className={`mx-auto h-12 w-12 ${isDragging ? 'text-[#5cc0b6]' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center mt-2 gap-1">
                    <label htmlFor="logo" className="relative cursor-pointer bg-white px-2 py-0.5 rounded-md font-medium text-[#5cc0b6] hover:text-[#4ab0a6] hover:bg-gray-50 focus-within:outline-none shadow-sm border border-gray-100">
                      <span>Subir archivo</span>
                      <input id="logo" name="logo" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!initialData && !logo} />
                    </label>
                    <p>o arrastra y suelta aquí</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP hasta 10MB</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {!isReadOnly && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#5cc0b6] hover:bg-[#4ab0a6] text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : !isReadOnly && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isReadOnly ? 'Aceptar' : submitText}
        </button>
      </div>
    </form>
  );
}
