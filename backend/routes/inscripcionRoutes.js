const express = require('express');
const {
  inscribirse,
  cancelarInscripcion,
  misInscripciones
} = require('../controllers/inscripcionController');
const { proteger } = require('../middleware/auth');

const router = express.Router();

router.use(proteger); // Todas las rutas de inscripciones requieren autenticación

// Base: /api/inscripciones
router.route('/')
  .post(inscribirse);

// Se define antes de /:tallerId para evitar conflictos de enrutamiento con parámetros
router.get('/mis-inscripciones', misInscripciones);

router.route('/:tallerId')
  .delete(cancelarInscripcion);

module.exports = router;
