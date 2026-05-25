import { useState, useEffect } from 'react';

export default function DescuentoForm({ initialData = null, onSubmit, onCancel, isSubmitting, submitText = 'Guardar Descuento', isReadOnly = false }) {
  const [formData, setFormData] = useState({
    titulo: '',
    comercio: '',
    descripcion: '',
    valor_descuento: '',
    codigo_promocional: '',
    fecha_expiracion: '',
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Si se pasa initialData (para editar), se rellena el formulario
  useEffect(() => {
    if (initialData) {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        titulo: initialData.titulo || '',
        comercio: initialData.comercio || '',
        descripcion: initialData.descripcion || '',
        valor_descuento: initialData.valor_descuento || '',
        codigo_promocional: initialData.codigo_promocional || '',
        fecha_expiracion: formatDate(initialData.fecha_expiracion),
      });
      if (initialData.imagen_url) {
        setPreview(initialData.imagen_url);
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

  const generarCodigoRandom = () => {
    if (isReadOnly) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DESC-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      codigo_promocional: code
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagen(null);
      setPreview(initialData?.imagen_url || null);
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

    if (new Date(formData.fecha_expiracion) < new Date()) {
      alert("La fecha de expiración no puede ser una fecha pasada.");
      return;
    }

    // Construye el FormData (necesario para enviar archivos)
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    
    // Si se subió una nueva imagen, se anexa
    if (imagen) {
      data.append('imagen', imagen);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Información General */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Información del Beneficio</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="titulo">Título del Descuento</label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ej: 15% de descuento en mensualidad"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="comercio">Comercio / Empresa</label>
            <input
              id="comercio"
              name="comercio"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.comercio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nombre del comercio asociado"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="descripcion">Descripción y Condiciones</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              disabled={isReadOnly}
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Detalles, restricciones o condiciones para aplicar el descuento..."
            ></textarea>
          </div>
        </div>

        {/* Columna Derecha: Configuración y Multimedia */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Condiciones y Multimedia</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="valor_descuento">Valor del Descuento</label>
              <input
                id="valor_descuento"
                name="valor_descuento"
                type="text"
                required
                disabled={isReadOnly}
                value={formData.valor_descuento}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ej: 15%, 2x1, ₡2,000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="codigo_promocional">Código Promo (Opcional)</label>
              <div className="relative">
                <input
                  id="codigo_promocional"
                  name="codigo_promocional"
                  type="text"
                  disabled={isReadOnly}
                  value={formData.codigo_promocional}
                  onChange={handleChange}
                  className={`w-full pl-4 ${isReadOnly ? 'pr-4' : 'pr-20'} py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500`}
                  placeholder="Ej: RESPIRATEC24"
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={generarCodigoRandom}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-[#243e7b]/10 text-[#243e7b] hover:bg-[#243e7b]/20 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                    title="Generar código aleatorio"
                  >
                    Generar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fecha_expiracion">Fecha de Expiración</label>
            <input
              id="fecha_expiracion"
              name="fecha_expiracion"
              type="datetime-local"
              required
              disabled={isReadOnly}
              value={formData.fecha_expiracion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Logo o Imagen del Comercio</label>
            
            {isReadOnly ? (
              <div className="mt-1 w-full h-32 md:h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Vista previa del logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <p className="text-gray-400">Sin imagen</p>
                )}
              </div>
            ) : (
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all relative overflow-hidden group ${isDragging ? 'border-[#5cc0b6] bg-[#5cc0b6]/5' : 'border-gray-300 hover:border-[#5cc0b6]'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview && (
                  <div className="absolute inset-0 z-0 bg-white">
                    <img src={preview} alt="Vista previa" className="w-full h-full object-contain p-2 opacity-30 group-hover:opacity-20 transition-opacity" />
                  </div>
                )}
                
                <div className={`space-y-1 text-center relative z-10 p-4 rounded-lg backdrop-blur-sm transition-all ${preview ? 'bg-white/70' : ''} ${isDragging ? 'scale-105' : ''}`}>
                  <svg className={`mx-auto h-12 w-12 ${isDragging ? 'text-[#5cc0b6]' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center mt-2 gap-1">
                    <label htmlFor="imagen" className="relative cursor-pointer bg-white px-2 py-0.5 rounded-md font-medium text-[#5cc0b6] hover:text-[#4ab0a6] hover:bg-gray-50 focus-within:outline-none shadow-sm border border-gray-100">
                      <span>Subir logo</span>
                      <input id="imagen" name="imagen" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!initialData && !imagen} />
                    </label>
                    <p>o arrastra aquí</p>
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
