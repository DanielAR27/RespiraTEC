// routes/eventoRoutes.js
const express = require('express');
const { crearEvento, obtenerEventos, obtenerEventoPorId, actualizarEvento, eliminarEvento, toggleEstadoEvento } = require('../controllers/eventoController');
const createUploader = require('../config/cloudinary');
const upload = createUploader('respiraTEC-eventos');
const { proteger, autorizar } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(obtenerEventos) // Cualquiera puede ver los eventos
  .post(proteger, autorizar('admin'), upload.single('imagen'), crearEvento); // Solo Admin logueado puede crear

router.route('/:id')
  .get(obtenerEventoPorId) // Cualquiera puede ver detalles de un evento
  .put(proteger, autorizar('admin'), upload.single('imagen'), actualizarEvento) // Solo admin puede editar
  .delete(proteger, autorizar('admin'), eliminarEvento); // Solo admin puede eliminar

router.route('/:id/estado')
  .patch(proteger, autorizar('admin'), toggleEstadoEvento); // Solo admin puede activar/desactivar

module.exports = router;