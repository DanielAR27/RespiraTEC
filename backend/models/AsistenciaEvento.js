const mongoose = require('mongoose');

const asistenciaEventoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: [true, 'El evento es obligatorio']
  }
}, { timestamps: true });

// Un usuario solo puede registrar asistencia una vez por evento
asistenciaEventoSchema.index({ usuario: 1, evento: 1 }, { unique: true });

module.exports = mongoose.model('AsistenciaEvento', asistenciaEventoSchema);
