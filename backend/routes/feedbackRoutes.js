const express = require('express');
const {
  crearFeedback,
  listarFeedback,
  obtenerResumen
} = require('../controllers/feedbackController');
const { proteger } = require('../middleware/auth');

const router = express.Router();

// Base: /api/feedback
router.get('/resumen/:targetTipo/:targetId', obtenerResumen);
router.get('/:targetTipo/:targetId', listarFeedback);
router.post('/', proteger, crearFeedback);

module.exports = router;
