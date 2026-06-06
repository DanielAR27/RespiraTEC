// routes/asistenciaEventoRoutes.js
const express = require('express');
const {
  asistirEvento,
  cancelarAsistencia,
  estadoAsistencia,
  misEventos
} = require('../controllers/asistenciaEventoController');
const { proteger } = require('../middleware/auth');

const router = express.Router();

router.use(proteger); // Todas las rutas requieren autenticación

// Base: /api/asistencia-eventos
router.route('/')
  .post(asistirEvento);

// Se define antes de /:eventoId para evitar conflictos de enrutamiento con parámetros
router.get('/mis-eventos', misEventos);
router.get('/estado/:eventoId', estadoAsistencia);

router.route('/:eventoId')
  .delete(cancelarAsistencia);

module.exports = router;
