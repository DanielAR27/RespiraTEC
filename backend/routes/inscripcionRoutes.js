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

// Debe ir antes de /:tallerId para que Express no lo confunda con un parámetro
router.get('/mis-inscripciones', misInscripciones);

router.route('/:tallerId')
  .delete(cancelarInscripcion);

module.exports = router;
