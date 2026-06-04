// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del item es obligatorio']
  },
  targetTipo: {
    type: String,
    required: [true, 'El tipo de item es obligatorio'],
    enum: {
      values: ['Taller', 'Evento'],
      message: '{VALUE} no es un tipo válido'
    }
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es obligatoria'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  comentario: {
    type: String,
    trim: true,
    maxlength: [500, 'El comentario no puede exceder los 500 caracteres'],
    default: ''
  }
}, { timestamps: true });

feedbackSchema.index({ usuario: 1, targetId: 1, targetTipo: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
