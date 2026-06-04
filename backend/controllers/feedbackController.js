const Feedback = require('../models/Feedback');
const Taller = require('../models/Taller');
const Evento = require('../models/Evento');
const Inscripcion = require('../models/Inscripcion');

const TIPOS_VALIDOS = ['Taller', 'Evento'];

const getTargetModel = (targetTipo) => {
  if (targetTipo === 'Taller') return Taller;
  if (targetTipo === 'Evento') return Evento;
  return null;
};

// @desc    Crear feedback para un taller o evento finalizado
// @route   POST /api/feedback
// @access  Private
exports.crearFeedback = async (req, res) => {
  try {
    const { targetId, targetTipo, rating, comentario } = req.body;

    if (!targetId || !targetTipo || rating == null) {
      return res.status(400).json({ success: false, error: 'targetId, targetTipo y rating son obligatorios' });
    }

    if (!TIPOS_VALIDOS.includes(targetTipo)) {
      return res.status(400).json({ success: false, error: 'targetTipo inválido' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'La calificación debe estar entre 1 y 5' });
    }

    const Model = getTargetModel(targetTipo);
    const target = await Model.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, error: `${targetTipo} no encontrado` });
    }

    if (new Date() <= new Date(target.fecha_fin)) {
      return res.status(400).json({ success: false, error: 'El feedback solo está disponible una vez finalizado' });
    }

    if (targetTipo === 'Taller') {
      const inscripcion = await Inscripcion.findOne({ usuario: req.user.id, taller: targetId });
      if (!inscripcion) {
        return res.status(403).json({ success: false, error: 'Debes haber estado inscrito para dejar feedback' });
      }
    }

    const existente = await Feedback.findOne({ usuario: req.user.id, targetId, targetTipo });
    if (existente) {
      return res.status(400).json({ success: false, error: 'Ya enviaste feedback para este item' });
    }

    const feedback = await Feedback.create({
      usuario: req.user.id,
      targetId,
      targetTipo,
      rating,
      comentario: comentario || ''
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Ya enviaste feedback para este item' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Listar feedbacks de un item
// @route   GET /api/feedback/:targetTipo/:targetId
// @access  Public
exports.listarFeedback = async (req, res) => {
  try {
    const { targetTipo, targetId } = req.params;

    if (!TIPOS_VALIDOS.includes(targetTipo)) {
      return res.status(400).json({ success: false, error: 'targetTipo inválido' });
    }

    const feedbacks = await Feedback.find({ targetId, targetTipo })
      .populate('usuario', 'nombre foto_perfil')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cantidad: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener los feedbacks' });
  }
};

// @desc    Obtener resumen (promedio y total) de feedback de un item
// @route   GET /api/feedback/resumen/:targetTipo/:targetId
// @access  Public
exports.obtenerResumen = async (req, res) => {
  try {
    const { targetTipo, targetId } = req.params;

    if (!TIPOS_VALIDOS.includes(targetTipo)) {
      return res.status(400).json({ success: false, error: 'targetTipo inválido' });
    }

    const mongoose = require('mongoose');
    const result = await Feedback.aggregate([
      { $match: { targetTipo, targetId: new mongoose.Types.ObjectId(targetId) } },
      { $group: { _id: null, promedio: { $avg: '$rating' }, total: { $sum: 1 } } }
    ]);

    const data = result[0]
      ? { promedio: Number(result[0].promedio.toFixed(2)), total: result[0].total }
      : { promedio: 0, total: 0 };

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener el resumen' });
  }
};
