const Inscripcion = require('../models/Inscripcion');
const Taller = require('../models/Taller');

// @desc    Inscribir al usuario autenticado en un taller
// @route   POST /api/inscripciones
// @access  Private
exports.inscribirse = async (req, res) => {
  try {
    const { tallerId } = req.body;

    if (!tallerId) {
      return res.status(400).json({ success: false, error: 'El ID del taller es obligatorio' });
    }

    const taller = await Taller.findById(tallerId);
    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }
    if (!taller.activo) {
      return res.status(400).json({ success: false, error: 'Este taller no está disponible actualmente' });
    }
    if (new Date() > new Date(taller.fecha_fin)) {
      return res.status(400).json({ success: false, error: 'Este taller ya ha finalizado y no acepta nuevas inscripciones' });
    }

    const inscripcionExistente = await Inscripcion.findOne({ usuario: req.user.id, taller: tallerId });
    if (inscripcionExistente) {
      return res.status(400).json({ success: false, error: 'Ya estás inscrito en este taller' });
    }

    // Decremento atómico: solo procede si aún hay cupo disponible
    const tallerConCupo = await Taller.findOneAndUpdate(
      { _id: tallerId, cupo_disponible: { $gt: 0 } },
      { $inc: { cupo_disponible: -1 } }
    );

    if (!tallerConCupo) {
      return res.status(400).json({ success: false, error: 'No hay cupos disponibles en este taller' });
    }

    const inscripcion = await Inscripcion.create({ usuario: req.user.id, taller: tallerId });

    res.status(201).json({ success: true, data: inscripcion });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Ya estás inscrito en este taller' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancelar la inscripción del usuario autenticado en un taller
// @route   DELETE /api/inscripciones/:tallerId
// @access  Private
exports.cancelarInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findOne({
      usuario: req.user.id,
      taller: req.params.tallerId
    });

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'No tienes una inscripción activa en este taller' });
    }

    // No se puede cancelar la inscripción a un taller que ya terminó
    const taller = await Taller.findById(req.params.tallerId);
    if (taller && new Date() > new Date(taller.fecha_fin)) {
      return res.status(400).json({ success: false, error: 'No puedes cancelar la inscripción de un taller que ya ha finalizado' });
    }

    await inscripcion.deleteOne();

    // Devolver el cupo al taller
    await Taller.findByIdAndUpdate(req.params.tallerId, { $inc: { cupo_disponible: 1 } });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al cancelar la inscripción' });
  }
};

// @desc    Obtener todas las inscripciones del usuario autenticado
// @route   GET /api/inscripciones/mis-inscripciones
// @access  Private
exports.misInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.find({ usuario: req.user.id })
      .populate(
        'taller',
        'titulo instructor nivel fecha_inicio fecha_fin ubicacion imagen_url tiene_certificacion activo cupo_disponible cupo_maximo'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cantidad: inscripciones.length, data: inscripciones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener tus inscripciones' });
  }
};
