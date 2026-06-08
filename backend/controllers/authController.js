// controllers/authController.js
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// @desc    Iniciar sesión y enviar cookie con JWT
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que vengan los campos
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor ingrese correo y contraseña' });
    }

    // Verificar que el usuario exista (forzando la selección del password)
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await usuario.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Generar el JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    // Configurar opciones de la Cookie Segura
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 día
      httpOnly: true, // Bloquea acceso desde JavaScript (Previene XSS)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Permite cross-site en prod
      secure: process.env.NODE_ENV === 'production' // Solo viaja por HTTPS en producción
    };

    // Enviar respuesta con la cookie inyectada
    res
      .status(200)
      .cookie('token', token, cookieOptions) 
      .json({
        success: true,
        user: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          role: usuario.role
        }
      });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar que todos los campos existan
    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor complete todos los campos' });
    }

    // Verificar si el usuario ya está registrado
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ success: false, error: 'Ese correo electrónico ya está registrado' });
    }

    // Validaciones de Contraseña Segura
    // Mínimo 8 caracteres, al menos un número, al menos una mayúscula y al menos un carácter no-alfanumérico
    const contraseñaValida = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;
    
    if (!contraseñaValida.test(password)) {
      return res.status(400).json({ 
        success: false, 
        error: 'La contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra mayúscula y al menos un símbolo especial' 
      });
    }

    // Crear el usuario (el password se encriptará en el modelo gracias al .pre('save'))
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      role: 'user'
    });

    // Respuesta sin cookie de autenticación; requiere inicio de sesión manual
    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente. Por favor inicie sesión.',
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cerrar sesión / Limpiar la cookie de autenticación
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  // Las cookies httpOnly no pueden ser eliminadas desde el cliente. Se sobrescriben con una cookie vacía y expirada.
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(200).json({ success: true, mensaje: 'Sesión cerrada correctamente' });
};

// @desc    Obtener datos del usuario logueado actualmente
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.user ya viene inyectado gracias al middleware 'proteger' que se creó antes
    const usuario = await Usuario.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};