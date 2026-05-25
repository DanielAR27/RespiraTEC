const Afiliacion = require('../models/Afiliacion');
const Asociacion = require('../models/Asociacion');

// Helpers internos para verificar permisos
const tienePermisosSobreAsociacion = async (usuarioReq, asociacionId) => {
  if (usuarioReq.role === 'admin') return true;
  
  const afiliacion = await Afiliacion.findOne({
    usuario: usuarioReq.id,
    asociacion: asociacionId,
    estado: 'aprobada',
    rol_asociacion: 'representante'
  });
  
  return !!afiliacion;
};

// @desc    Solicitar unirse a una asociación
// @route   POST /api/afiliaciones
// @access  Private (Cualquier usuario logueado)
exports.solicitarAfiliacion = async (req, res) => {
  try {
    const { asociacionId } = req.body;

    if (!asociacionId) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar el ID de la asociación' });
    }

    const asociacion = await Asociacion.findById(asociacionId);
    if (!asociacion) {
      return res.status(404).json({ success: false, error: 'Asociación no encontrada' });
    }

    // Verificar si ya existe una solicitud o afiliación previa
    const afiliacionExistente = await Afiliacion.findOne({ usuario: req.user.id, asociacion: asociacionId });
    if (afiliacionExistente) {
      if (afiliacionExistente.estado === 'rechazada') {
        const ahora = new Date();
        const fechaRechazo = new Date(afiliacionExistente.updatedAt);
        const diferenciaHoras = (ahora - fechaRechazo) / (1000 * 60 * 60);

        if (diferenciaHoras < 24) {
          const horasRestantes = Math.ceil(24 - diferenciaHoras);
          return res.status(400).json({ 
            success: false, 
            error: `Tu solicitud fue rechazada. Podrás volver a postularte en ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}.` 
          });
        }

        // Si ya pasaron las 24 horas, reactiva la solicitud cambiándola a 'pendiente'
        afiliacionExistente.estado = 'pendiente';
        afiliacionExistente.comentarios = undefined;
        await afiliacionExistente.save();

        return res.status(200).json({ success: true, data: afiliacionExistente });
      }

      return res.status(400).json({ 
        success: false, 
        error: `Ya tienes una afiliación a esta asociación en estado: ${afiliacionExistente.estado}` 
      });
    }

    const nuevaAfiliacion = await Afiliacion.create({
      usuario: req.user.id,
      asociacion: asociacionId,
      estado: 'pendiente',
      rol_asociacion: 'miembro'
    });

    res.status(201).json({ success: true, data: nuevaAfiliacion });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Ya existe una solicitud para esta asociación' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Responder a una solicitud (Aprobar o Rechazar)
// @route   PUT /api/afiliaciones/:id/estado
// @access  Private (Admin o Representante)
exports.responderSolicitud = async (req, res) => {
  try {
    const { estado, comentarios } = req.body;
    
    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ success: false, error: 'Estado inválido. Debe ser aprobada o rechazada.' });
    }

    let afiliacion = await Afiliacion.findById(req.params.id);
    if (!afiliacion) {
      return res.status(404).json({ success: false, error: 'Afiliación no encontrada' });
    }

    // Validación de permisos
    const tienePermisos = await tienePermisosSobreAsociacion(req.user, afiliacion.asociacion);
    if (!tienePermisos) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para administrar solicitudes de esta asociación' });
    }

    afiliacion.estado = estado;
    if (comentarios) afiliacion.comentarios = comentarios;
    
    await afiliacion.save();

    res.status(200).json({ success: true, data: afiliacion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cambiar rol de un usuario dentro de una asociación (Delegar)
// @route   PUT /api/afiliaciones/:id/rol
// @access  Private (Admin Global - Cambiar delegaciones de cualquier asoc)
exports.modificarRolAfiliacion = async (req, res) => {
  try {
    const { rol_asociacion } = req.body;

    if (!['miembro', 'representante'].includes(rol_asociacion)) {
      return res.status(400).json({ success: false, error: 'Rol inválido. Debe ser miembro o representante.' });
    }

    let afiliacion = await Afiliacion.findById(req.params.id);
    if (!afiliacion) {
      return res.status(404).json({ success: false, error: 'Afiliación no encontrada' });
    }

    // Solo un admin global (o la lógica que definamos) puede otorgar el rol de representante a alguien
    // Según requerimientos: "el admin puede cambiar permisos de delegación de todas las asociaciones"
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Solo los administradores globales pueden delegar permisos de representante' });
    }

    if (afiliacion.estado !== 'aprobada') {
      return res.status(400).json({ success: false, error: 'No se puede cambiar el rol de una afiliación que no está aprobada' });
    }

    afiliacion.rol_asociacion = rol_asociacion;
    await afiliacion.save();

    res.status(200).json({ success: true, data: afiliacion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Obtener todas las asociaciones a las que pertenece el usuario autenticado
// @route   GET /api/afiliaciones/mis-asociaciones
// @access  Private
exports.misAsociaciones = async (req, res) => {
  try {
    const misAfiliaciones = await Afiliacion.find({ usuario: req.user.id })
      .populate('asociacion', 'nombre descripcion logo_url activa');

    res.status(200).json({ success: true, count: misAfiliaciones.length, data: misAfiliaciones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener tus asociaciones' });
  }
};

// @desc    Obtener todos los miembros (y pendientes) de una asociación específica
// @route   GET /api/afiliaciones/asociacion/:asociacionId
// @access  Private (Admin o Representante de la Asociación)
exports.miembrosPorAsociacion = async (req, res) => {
  try {
    const { asociacionId } = req.params;

    let tienePermisos = await tienePermisosSobreAsociacion(req.user, asociacionId);
    
    // Si no tiene permisos de admin/representante, verificar si es miembro aprobado
    if (!tienePermisos) {
      const esMiembro = await Afiliacion.findOne({
        usuario: req.user.id,
        asociacion: asociacionId,
        estado: 'aprobada'
      });
      if (esMiembro) tienePermisos = true;
    }

    if (!tienePermisos) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para ver los miembros de esta asociación' });
    }

    const miembros = await Afiliacion.find({ asociacion: asociacionId })
      .populate('usuario', 'nombre email role foto_perfil');

    res.status(200).json({ success: true, count: miembros.length, data: miembros });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener miembros' });
  }
};

// @desc    Eliminar una afiliación (Expulsar usuario o retirar solicitud)
// @route   DELETE /api/afiliaciones/:id
// @access  Private (Admin, Representante, o el propio usuario cancelando su solicitud)
exports.eliminarAfiliacion = async (req, res) => {
  try {
    const afiliacion = await Afiliacion.findById(req.params.id);
    if (!afiliacion) {
      return res.status(404).json({ success: false, error: 'Afiliación no encontrada' });
    }

    // Permitir si es admin global
    let tienePermiso = (req.user.role === 'admin');

    // Permitir si el propio usuario quiere salirse/cancelar su solicitud
    if (afiliacion.usuario.toString() === req.user.id) {
      tienePermiso = true;
    }

    // Permitir si el usuario que hace la request es Representante de la asociación
    if (!tienePermiso) {
      tienePermiso = await tienePermisosSobreAsociacion(req.user, afiliacion.asociacion);
    }

    if (!tienePermiso) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para eliminar esta afiliación' });
    }

    await afiliacion.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar afiliación' });
  }
};

// @desc    Añadir a un usuario directamente como representante
// @route   POST /api/afiliaciones/representante
// @access  Private (Admin Global)
exports.agregarRepresentanteDirecto = async (req, res) => {
  try {
    const { usuarioId, asociacionId } = req.body;

    if (!usuarioId || !asociacionId) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar usuarioId y asociacionId' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Solo los administradores globales pueden asignar representantes directamente' });
    }

    let afiliacion = await Afiliacion.findOne({ usuario: usuarioId, asociacion: asociacionId });
    if (afiliacion) {
      afiliacion.estado = 'aprobada';
      afiliacion.rol_asociacion = 'representante';
      await afiliacion.save();
    } else {
      afiliacion = await Afiliacion.create({
        usuario: usuarioId,
        asociacion: asociacionId,
        estado: 'aprobada',
        rol_asociacion: 'representante'
      });
    }

    // Populate user info before sending
    await afiliacion.populate('usuario', 'nombre email role foto_perfil');

    res.status(201).json({ success: true, data: afiliacion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
