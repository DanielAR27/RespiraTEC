const mongoose = require('mongoose');

const afiliacionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  asociacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asociacion',
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },
  rol_asociacion: {
    type: String,
    enum: ['miembro', 'representante'],
    default: 'miembro'
  },
  comentarios: {
    type: String
  }
}, { timestamps: true });

// Índice único para asegurar que un usuario solo pueda tener una solicitud/afiliación por asociación
afiliacionSchema.index({ usuario: 1, asociacion: 1 }, { unique: true });

module.exports = mongoose.model('Afiliacion', afiliacionSchema);
