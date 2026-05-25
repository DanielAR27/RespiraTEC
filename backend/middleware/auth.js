// middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para proteger rutas (Verifica si hay un token válido en la cookie)
exports.proteger = async (req, res, next) => {
  let token;

  // Extraer el token directamente de las cookies de la petición
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'No autorizado para acceder a esta ruta' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario dueño del token y adjuntarlo a la petición (req.user)
    req.user = await Usuario.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'El usuario ya no existe' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
};

// Middleware para validar roles específicos
exports.autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `El rol (${req.user ? req.user.role : 'ninguno'}) no tiene permisos para ejecutar esta acción` 
      });
    }
    next();
  };
};