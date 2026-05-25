// routes/descuentoRoutes.js
const express = require('express');
const { 
  crearDescuento, 
  obtenerDescuentos, 
  obtenerDescuentoPorId, 
  actualizarDescuento, 
  eliminarDescuento, 
  toggleEstadoDescuento 
} = require('../controllers/descuentoController');
const createUploader = require('../config/cloudinary');
const upload = createUploader('respiraTEC-descuentos');
const { proteger, autorizar } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(obtenerDescuentos) // Estudiantes y administradores pueden ver los descuentos disponibles
  .post(proteger, autorizar('admin'), upload.single('imagen'), crearDescuento); // Solo un administrador puede registrar un descuento

router.route('/:id')
  .get(obtenerDescuentoPorId) // Ver detalles específicos de un beneficio
  .put(proteger, autorizar('admin'), upload.single('imagen'), actualizarDescuento) // Solo un administrador puede editar campos o el logo
  .delete(proteger, autorizar('admin'), eliminarDescuento); // Solo un administrador puede removerlo por completo

router.route('/:id/estado')
  .patch(proteger, autorizar('admin'), toggleEstadoDescuento); // Solo un administrador puede pausar/activar el beneficio (Toggle)

module.exports = router;