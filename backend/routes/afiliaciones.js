const express = require('express');
const {
  solicitarAfiliacion,
  responderSolicitud,
  modificarRolAfiliacion,
  misAsociaciones,
  miembrosPorAsociacion,
  eliminarAfiliacion,
  agregarRepresentanteDirecto
} = require('../controllers/afiliacionController');

const { proteger, autorizar } = require('../middleware/auth');

const router = express.Router();

router.use(proteger); // Todas las rutas de afiliaciones requieren autenticación

// Base: /api/afiliaciones
router.route('/')
  .post(solicitarAfiliacion);

router.post('/representante', autorizar('admin'), agregarRepresentanteDirecto);

router.get('/mis-asociaciones', misAsociaciones);
router.get('/asociacion/:asociacionId', miembrosPorAsociacion);

router.route('/:id/estado')
  .put(responderSolicitud);

router.route('/:id/rol')
  .put(autorizar('admin'), modificarRolAfiliacion);

router.route('/:id')
  .delete(eliminarAfiliacion);

module.exports = router;
