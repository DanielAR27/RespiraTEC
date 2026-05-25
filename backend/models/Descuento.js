// models/Descuento.js
const mongoose = require('mongoose');

const descuentoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título del descuento o beneficio es obligatorio'],
    trim: true
  },
  comercio: {
    type: String,
    required: [true, 'El nombre del comercio o empresa es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción o condiciones del descuento son obligatorias'],
    trim: true
  },
  valor_descuento: {
    type: String,
    required: [true, 'El valor del descuento es obligatorio (ej: 15%, 2x1, ₡2,000)'],
    trim: true
  },
  codigo_promocional: {
    type: String,
    trim: true,
    default: '' // Opcional: para descuentos que se aplican con un cupón en línea
  },
  fecha_expiracion: {
    type: Date,
    required: [true, 'La fecha de expiración es obligatoria']
  },
  imagen_url: {
    type: String,
    required: [true, 'La imagen o logo del comercio es obligatoria']
  },
  activo: {
    type: Boolean,
    default: true // Permite pausar o activar un descuento desde el panel sin borrarlo
  }
}, { 
  timestamps: true // Genera automáticamente createdAt y updatedAt
});

// Índice virtual opcional para saber si el descuento ya expiró en tiempo real
descuentoSchema.virtual('estaExpirado').get(function() {
  return new Date() > this.fecha_expiracion;
});

module.exports = mongoose.model('Descuento', descuentoSchema);