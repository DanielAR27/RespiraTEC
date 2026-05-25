const express = require('express');
const {
  crearAsociacion,
  obtenerAsociaciones,
  actualizarAsociacion,
  eliminarAsociacion,
  toggleEstadoAsociacion,
  obtenerAsociacionPorId
} = require('../controllers/asociacionController');

const { proteger, autorizar } = require('../middleware/auth');
const createUploader = require('../config/cloudinary');
const upload = createUploader('respiraTEC-asociaciones');

const router = express.Router();

router.route('/')
  .get(obtenerAsociaciones)
  .post(proteger, autorizar('admin'), upload.single('logo'), crearAsociacion);

router.route('/:id')
  .get(proteger, obtenerAsociacionPorId)
  .put(proteger, upload.single('logo'), actualizarAsociacion) // Puede ser admin o representante, validado en el controlador
  .delete(proteger, autorizar('admin'), eliminarAsociacion);

router.route('/:id/estado')
  .patch(proteger, toggleEstadoAsociacion);

module.exports = router;
