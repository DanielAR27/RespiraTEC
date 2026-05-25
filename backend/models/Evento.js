// models/Evento.js
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  fecha_inicio: {
    type: Date,
    required: [true, 'La fecha y hora de inicio son obligatorias']
  },
  fecha_fin: {
    type: Date,
    required: [true, 'La fecha y hora de fin son obligatorias']
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es obligatoria'],
    trim: true,
    maxlength: [150, 'La ubicación no puede exceder 150 caracteres']
  },
  tipo: {
    type: String,
    required: true,
    enum: {
      values: ['gratis', 'pago_interno', 'pago_terceros'],
      message: '{VALUE} no es un tipo de evento válido'
    }
  },
  precio: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  cupo_maximo: {
    type: Number,
    required: true,
    min: [1, 'Debe haber al menos 1 espacio']
  },
  cupo_disponible: {
    type: Number,
    required: true,
    min: [0, 'El cupo no puede ser negativo']
  },
  imagen_url: {
    type: String,
    required: [true, 'La imagen del evento es obligatoria']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);