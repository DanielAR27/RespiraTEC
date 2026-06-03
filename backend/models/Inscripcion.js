const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  taller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taller',
    required: [true, 'El taller es obligatorio']
  }
}, { timestamps: true });

// Un usuario solo puede inscribirse una vez por taller
inscripcionSchema.index({ usuario: 1, taller: 1 }, { unique: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
