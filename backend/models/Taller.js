// models/Taller.js
const mongoose = require('mongoose');

// Subesquema para manejar los días y horas específicas de las sesiones
const horarioSesionSchema = new mongoose.Schema({
  dia: {
    type: String,
    required: [true, 'El día de la semana es obligatorio'],
    enum: {
      values: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      message: '{VALUE} no es un día válido de la semana'
    }
  },
  hora_inicio: {
    type: String,
    required: [true, 'La hora de inicio de la sesión es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Por favor use un formato de hora válido (HH:MM de 24 horas)']
  },
  hora_fin: {
    type: String,
    required: [true, 'La hora de finalización de la sesión es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Por favor use un formato de hora válido (HH:MM de 24 horas)']
  }
}, { _id: false }); // _id: false evita que MongoDB genere un ID para cada día de la lista

const tallerSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título del taller es obligatorio'],
    trim: true
  },
  instructor: {
    type: String,
    required: [true, 'El nombre del instructor o facilitador es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del taller es obligatoria'],
    trim: true
  },
  requisitos: {
    type: String,
    trim: true,
    default: 'Ninguno' // Ej: "Traer computadora con VS Code instalado y Docker"
  },
  nivel: {
    type: String,
    required: [true, 'El nivel del taller es obligatorio'],
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    default: 'Principiante'
  },
  fecha_inicio: {
    type: Date,
    required: [true, 'La fecha de inicio global del taller es obligatoria']
  },
  fecha_fin: {
    type: Date,
    required: [true, 'La fecha de finalización global del taller es obligatoria']
  },
  // Subesquema de horarios recurrentes
  horario_semanal: {
    type: [horarioSesionSchema],
    validate: [v => Array.isArray(v) && v.length > 0, 'El taller debe tener al menos un día y hora de clase asignado']
  },
  cupo_maximo: {
    type: Number,
    required: [true, 'El cupo máximo es obligatorio'],
    min: [1, 'El cupo debe ser de al menos 1 persona']
  },
  cupo_disponible: {
    type: Number
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación o plataforma virtual es obligatoria'],
    trim: true
  },
  imagen_url: {
    type: String,
    required: [true, 'La imagen promocional del taller es obligatoria']
  },
  tiene_certificacion: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Middleware para sincronizar automáticamente el cupo disponible al crear el taller
tallerSchema.pre('save', function() {
  if (this.isNew) {
    this.cupo_disponible = this.cupo_maximo;
  }
  
  // Validación extra: comprobar que la fecha de fin no sea menor a la de inicio
  if (this.fecha_fin < this.fecha_inicio) {
    throw new Error('La fecha de finalización no puede ser previa a la fecha de inicio');
  }
});

module.exports = mongoose.model('Taller', tallerSchema);