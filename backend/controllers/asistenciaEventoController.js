// controllers/asistenciaEventoController.js
const AsistenciaEvento = require('../models/AsistenciaEvento');
const Evento = require('../models/Evento');

// @desc    Registrar asistencia del usuario autenticado a un evento
// @route   POST /api/asistencia-eventos
// @access  Private
exports.asistirEvento = async (req, res) => {
  try {
    const { eventoId } = req.body;

    if (!eventoId) {
      return res.status(400).json({ success: false, error: 'El ID del evento es obligatorio' });
    }

    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }
    if (!evento.activo) {
      return res.status(400).json({ success: false, error: 'Este evento no está disponible actualmente' });
    }
    if (new Date() > new Date(evento.fecha_fin)) {
      return res.status(400).json({ success: false, error: 'Este evento ya finalizó y no acepta nuevos registros' });
    }

    const asistenciaExistente = await AsistenciaEvento.findOne({ usuario: req.user.id, evento: eventoId });
    if (asistenciaExistente) {
      return res.status(400).json({ success: false, error: 'Ya estás registrado en este evento' });
    }

    // Decremento atómico: solo procede si aún hay cupo disponible
    const eventoConCupo = await Evento.findOneAndUpdate(
      { _id: eventoId, cupo_disponible: { $gt: 0 } },
      { $inc: { cupo_disponible: -1 } },
      { new: true }
    );

    if (!eventoConCupo) {
      return res.status(400).json({ success: false, error: 'No hay cupos disponibles en este evento' });
    }

    const asistencia = await AsistenciaEvento.create({ usuario: req.user.id, evento: eventoId });

    res.status(201).json({ success: true, data: asistencia, cupo_disponible: eventoConCupo.cupo_disponible });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Ya estás registrado en este evento' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancelar la asistencia del usuario autenticado a un evento
// @route   DELETE /api/asistencia-eventos/:eventoId
// @access  Private
exports.cancelarAsistencia = async (req, res) => {
  try {
    const asistencia = await AsistenciaEvento.findOne({
      usuario: req.user.id,
      evento: req.params.eventoId
    });

    if (!asistencia) {
      return res.status(404).json({ success: false, error: 'No tienes un registro activo en este evento' });
    }

    const evento = await Evento.findById(req.params.eventoId);
    if (evento && new Date() > new Date(evento.fecha_fin)) {
      return res.status(400).json({ success: false, error: 'No puedes cancelar la asistencia a un evento que ya finalizó' });
    }

    await asistencia.deleteOne();

    // Devolver el cupo al evento
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.eventoId,
      { $inc: { cupo_disponible: 1 } },
      { new: true }
    );

    res.status(200).json({ success: true, data: {}, cupo_disponible: eventoActualizado?.cupo_disponible });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al cancelar la asistencia' });
  }
};

// @desc    Verificar si el usuario autenticado está registrado en un evento
// @route   GET /api/asistencia-eventos/estado/:eventoId
// @access  Private
exports.estadoAsistencia = async (req, res) => {
  try {
    const asistencia = await AsistenciaEvento.findOne({
      usuario: req.user.id,
      evento: req.params.eventoId
    });

    res.status(200).json({ success: true, asistiendo: !!asistencia });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al verificar asistencia' });
  }
};

// @desc    Obtener todos los eventos a los que asiste el usuario autenticado
// @route   GET /api/asistencia-eventos/mis-eventos
// @access  Private
exports.misEventos = async (req, res) => {
  try {
    const asistencias = await AsistenciaEvento.find({ usuario: req.user.id })
      .populate('evento', 'titulo fecha_inicio fecha_fin ubicacion imagen_url activo cupo_disponible cupo_maximo tipo precio')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cantidad: asistencias.length, data: asistencias });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener tus eventos' });
  }
};
