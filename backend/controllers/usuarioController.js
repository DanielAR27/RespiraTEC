const Usuario = require('../models/Usuario');

// @desc    Buscar usuarios por email o nombre
// @route   GET /api/usuarios/buscar
// @access  Private (Admin o Representante)
exports.buscarUsuarios = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Se requiere un término de búsqueda' });
    }

    // Se busca usuarios cuyo nombre o email coincida con la búsqueda (case-insensitive)
    const regex = new RegExp(query, 'i');
    const usuarios = await Usuario.find({
      $or: [
        { nombre: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    }).select('nombre email _id role foto_perfil telefono residencia'); // Devuelve datos seguros y útiles

    res.status(200).json({ success: true, count: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al buscar usuarios' });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/usuarios/perfil
// @access  Private
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener el perfil' });
  }
};

// @desc    Actualizar perfil del usuario autenticado
// @route   PUT /api/usuarios/perfil
// @access  Private
exports.actualizarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Si se desea cambiar la contraseña
    if (req.body.nuevaContrasena) {
      if (!req.body.contrasenaActual) {
        return res.status(400).json({ success: false, error: 'Debe ingresar su contraseña actual para cambiarla' });
      }

      // Validar contraseña actual (buscar usuario incluyendo password)
      const usuarioConPassword = await Usuario.findById(req.user.id).select('+password');
      const isMatch = await usuarioConPassword.matchPassword(req.body.contrasenaActual);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'La contraseña actual es incorrecta' });
      }

      // Validar fortaleza de la nueva contraseña
      const contrasenaValida = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;
      if (!contrasenaValida.test(req.body.nuevaContrasena)) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra mayúscula y al menos un símbolo especial (!@#$%^&*)'
        });
      }

      usuario.password = req.body.nuevaContrasena;
    }

    // Actualizar otros campos
    if (req.body.nombre) usuario.nombre = req.body.nombre;
    if (req.body.telefono !== undefined) usuario.telefono = req.body.telefono;
    if (req.body.residencia !== undefined) usuario.residencia = req.body.residencia;
    
    if (req.file && req.file.path) {
      usuario.foto_perfil = req.file.path;
    }

    await usuario.save();

    // Devolver objeto seguro
    const usuarioActualizado = {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role,
      foto_perfil: usuario.foto_perfil,
      telefono: usuario.telefono,
      residencia: usuario.residencia,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    };

    res.status(200).json({ success: true, data: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar el perfil: ' + error.message });
  }
};

// @desc    Obtener todos los usuarios (Admin)
// @route   GET /api/usuarios
// @access  Private/Admin
exports.obtenerTodosUsuarios = async (req, res) => {
  try {
    let query = {};
    if (req.query.q) {
      const regex = new RegExp(req.query.q, 'i');
      query = {
        $or: [
          { nombre: { $regex: regex } },
          { email: { $regex: regex } }
        ]
      };
    }

    const usuarios = await Usuario.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
  }
};

// @desc    Cambiar rol de un usuario (Admin)
// @route   PUT /api/usuarios/:id/rol
// @access  Private/Admin
exports.cambiarRolUsuario = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Rol no válido' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'No puedes cambiar tu propio rol administrativo' });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    usuario.role = role;
    await usuario.save();

    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al cambiar el rol' });
  }
};

// @desc    Eliminar usuario y todas sus afiliaciones en cascada (Admin)
// @route   DELETE /api/usuarios/:id
// @access  Private/Admin
exports.eliminarUsuario = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'No puedes eliminar tu propio usuario' });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Borrado en cascada de afiliaciones
    const Afiliacion = require('../models/Afiliacion');
    await Afiliacion.deleteMany({ usuario: req.params.id });

    // Borrar el usuario
    await usuario.deleteOne();

    res.status(200).json({ success: true, message: 'Usuario y sus afiliaciones eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
};
