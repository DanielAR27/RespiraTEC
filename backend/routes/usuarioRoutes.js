const express = require('express');
const { 
  buscarUsuarios,
  obtenerPerfil,
  actualizarPerfil,
  obtenerTodosUsuarios,
  cambiarRolUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');
const { proteger, autorizar } = require('../middleware/auth');
const createUploader = require('../config/cloudinary');
const upload = createUploader('respiraTEC-usuarios');

const router = express.Router();

router.use(proteger);

// Rutas de perfil (Accesibles por cualquier usuario autenticado)
router.get('/perfil', obtenerPerfil);
router.put('/perfil', upload.single('foto_perfil'), actualizarPerfil);

// Ruta para búsqueda de usuarios (Para admin/representantes)
router.get('/buscar', buscarUsuarios);

// Rutas de administración (Solo Admins globales)
router.get('/', autorizar('admin'), obtenerTodosUsuarios);
router.put('/:id/rol', autorizar('admin'), cambiarRolUsuario);
router.delete('/:id', autorizar('admin'), eliminarUsuario);

module.exports = router;
