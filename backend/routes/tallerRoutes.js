// routes/tallerRoutes.js
const express = require('express');
const { 
  crearTaller, 
  obtenerTalleres, 
  obtenerTallerPorId, 
  actualizarTaller, 
  eliminarTaller, 
  toggleEstadoTaller 
} = require('../controllers/tallerController');
const createUploader = require('../config/cloudinary');
const upload = createUploader('respiraTEC-talleres');
const { proteger, autorizar } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(obtenerTalleres) // Estudiantes y administradores pueden listar todos los talleres
  .post(proteger, autorizar('admin'), upload.single('imagen'), crearTaller); // Solo un administrador puede crear un taller

router.route('/:id')
  .get(obtenerTallerPorId) // Ver los detalles o el horario específico de un taller
  .put(proteger, autorizar('admin'), upload.single('imagen'), actualizarTaller) // Solo un administrador puede modificar campos o la portada
  .delete(proteger, autorizar('admin'), eliminarTaller); // Solo un administrador puede remover el taller de la base de datos

router.route('/:id/estado')
  .patch(proteger, autorizar('admin'), toggleEstadoTaller); // Solo un administrador puede activar/desactivar la visibilidad (Toggle)

module.exports = router;