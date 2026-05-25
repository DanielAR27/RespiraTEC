const mongoose = require('mongoose');

const asociacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la asociación es obligatorio'],
    trim: true
  },
  tipo: {
    type: String,
    enum: ['Académica', 'Cultural', 'Deportiva', 'Recreativa', 'Social', 'Otra'],
    default: 'Otra'
  },
  descripcion: {
    type: String,
    trim: true
  },
  logo_url: {
    type: String
  },
  activa: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Asociacion', asociacionSchema);
