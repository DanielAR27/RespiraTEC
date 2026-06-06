import { useState, useEffect } from 'react';

export default function TallerForm({ initialData = null, onSubmit, onCancel, isSubmitting, submitText = 'Guardar Taller', isReadOnly = false }) {
  const [formData, setFormData] = useState({
    titulo: '',
    instructor: '',
    descripcion: '',
    requisitos: 'Ninguno',
    nivel: 'Principiante',
    fecha_inicio: '',
    fecha_fin: '',
    cupo_maximo: 1,
    ubicacion: '',
    tiene_certificacion: false,
  });

  const [horarios, setHorarios] = useState([
    { dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' }
  ]);

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
        instructor: initialData.instructor || '',
        descripcion: initialData.descripcion || '',
        requisitos: initialData.requisitos || 'Ninguno',
        nivel: initialData.nivel || 'Principiante',
        fecha_inicio: formatDate(initialData.fecha_inicio),
        fecha_fin: formatDate(initialData.fecha_fin),
        cupo_maximo: initialData.cupo_maximo || 1,
        ubicacion: initialData.ubicacion || '',
        tiene_certificacion: initialData.tiene_certificacion || false,
      });
      if (initialData.horario_semanal && Array.isArray(initialData.horario_semanal)) {
        setHorarios(initialData.horario_semanal);
      }
      if (initialData.imagen_url) {
        setPreview(initialData.imagen_url);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHorarioChange = (index, field, value) => {
    const newHorarios = [...horarios];
    newHorarios[index][field] = value;
    setHorarios(newHorarios);
  };

  const addHorario = () => {
    setHorarios([...horarios, { dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' }]);
  };

  const removeHorario = (index) => {
    if (horarios.length > 1) {
      const newHorarios = [...horarios];
      newHorarios.splice(index, 1);
      setHorarios(newHorarios);
    }
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

    if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    if (horarios.length === 0) {
      alert("Debe agregar al menos un horario semanal.");
      return;
    }

    // Construye el FormData
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    
    // Se anexan los horarios como string JSON para su posterior conversión a arreglo de objetos en el servidor
    data.append('horario_semanal', JSON.stringify(horarios));

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
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Información del Taller</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="titulo">Título</label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nombre del taller"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="instructor">Instructor / Facilitador</label>
            <input
              id="instructor"
              name="instructor"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.instructor}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nombre del instructor"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              disabled={isReadOnly}
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Detalles sobre el taller..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="requisitos">Requisitos (Opcional)</label>
            <textarea
              id="requisitos"
              name="requisitos"
              disabled={isReadOnly}
              rows="2"
              value={formData.requisitos}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ej: Traer computadora con VS Code instalado"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fecha_inicio">Fecha Inicio (Global)</label>
              <input
                id="fecha_inicio"
                name="fecha_inicio"
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fecha_fin">Fecha Fin (Global)</label>
              <input
                id="fecha_fin"
                name="fecha_fin"
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Configuración y Multimedia */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-2">Configuración y Multimedia</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="nivel">Nivel</label>
              <select
                id="nivel"
                name="nivel"
                disabled={isReadOnly}
                value={formData.nivel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="cupo_maximo">Cupo Máximo</label>
              <input
                id="cupo_maximo"
                name="cupo_maximo"
                type="number"
                min="1"
                required
                disabled={isReadOnly}
                value={formData.cupo_maximo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="ubicacion">Ubicación / Plataforma</label>
            <input
              id="ubicacion"
              name="ubicacion"
              type="text"
              required
              disabled={isReadOnly}
              value={formData.ubicacion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5cc0b6] focus:border-transparent outline-none transition-all text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ej: Sala 4, Zoom, etc."
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="tiene_certificacion"
              name="tiene_certificacion"
              disabled={isReadOnly}
              checked={formData.tiene_certificacion}
              onChange={handleChange}
              className="w-4 h-4 text-[#5cc0b6] border-gray-300 rounded focus:ring-[#5cc0b6]"
            />
            <label htmlFor="tiene_certificacion" className="text-sm font-semibold text-gray-700">
              Otorga certificación al finalizar
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fotografía del Taller</label>
            
            {isReadOnly ? (
              <div className="mt-1 w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Vista previa del taller" className="w-full h-full object-cover" />
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
                  <div className="absolute inset-0 z-0">
                    <img src={preview} alt="Vista previa" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                  </div>
                )}
                
                <div className={`space-y-1 text-center relative z-10 p-4 rounded-lg backdrop-blur-sm transition-all ${preview ? 'bg-white/70' : ''} ${isDragging ? 'scale-105' : ''}`}>
                  <svg className={`mx-auto h-12 w-12 ${isDragging ? 'text-[#5cc0b6]' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center mt-2 gap-1">
                    <label htmlFor="imagen" className="relative cursor-pointer bg-white px-2 py-0.5 rounded-md font-medium text-[#5cc0b6] hover:text-[#4ab0a6] hover:bg-gray-50 focus-within:outline-none shadow-sm border border-gray-100">
                      <span>Subir archivo</span>
                      <input id="imagen" name="imagen" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!initialData && !imagen} />
                    </label>
                    <p>o arrastra y suelta</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Horario Semanal */}
      <div className="space-y-4 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#243e7b]">Horario Semanal</h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={addHorario}
              className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Agregar Día
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {horarios.map((horario, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="w-full md:w-1/3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Día</label>
                <select
                  disabled={isReadOnly}
                  value={horario.dia}
                  onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-[#5cc0b6] outline-none disabled:bg-gray-100"
                >
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/2 md:w-1/3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  disabled={isReadOnly}
                  required
                  value={horario.hora_inicio}
                  onChange={(e) => handleHorarioChange(index, 'hora_inicio', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-[#5cc0b6] outline-none disabled:bg-gray-100"
                />
              </div>
              <div className="w-1/2 md:w-1/3 flex items-end gap-2">
                <div className="w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    disabled={isReadOnly}
                    required
                    value={horario.hora_fin}
                    onChange={(e) => handleHorarioChange(index, 'hora_fin', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-[#5cc0b6] outline-none disabled:bg-gray-100"
                  />
                </div>
                {!isReadOnly && horarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHorario(index)}
                    className="p-1.5 mb-0.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
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
