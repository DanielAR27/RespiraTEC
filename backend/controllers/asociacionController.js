const Asociacion = require('../models/Asociacion');
const Afiliacion = require('../models/Afiliacion');

// @desc    Crear una nueva asociación
// @route   POST /api/asociaciones
// @access  Private (Admin)
exports.crearAsociacion = async (req, res) => {
  try {
    const dataAsociacion = { ...req.body };
    if (req.file) {
      dataAsociacion.logo_url = req.file.path;
    }
    const asociacion = await Asociacion.create(dataAsociacion);
    res.status(201).json({ success: true, data: asociacion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Obtener todas las asociaciones
// @route   GET /api/asociaciones
// @access  Public / Private
exports.obtenerAsociaciones = async (req, res) => {
  try {
    const asociaciones = await Asociacion.find();
    res.status(200).json({ success: true, count: asociaciones.length, data: asociaciones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener asociaciones' });
  }
};

// @desc    Actualizar una asociación
// @route   PUT /api/asociaciones/:id
// @access  Private (Admin o Representante de la Asociación)
exports.actualizarAsociacion = async (req, res) => {
  try {
    const asociacionId = req.params.id;

    // Verificar si existe la asociación
    let asociacion = await Asociacion.findById(asociacionId);
    if (!asociacion) {
      return res.status(404).json({ success: false, error: 'Asociación no encontrada' });
    }

    // Verificar permisos: Si no es admin global, debe ser representante de la asociación
    if (req.user.role !== 'admin') {
      const afiliacion = await Afiliacion.findOne({
        usuario: req.user.id,
        asociacion: asociacionId,
        estado: 'aprobada',
        rol_asociacion: 'representante'
      });

      if (!afiliacion) {
        return res.status(403).json({ success: false, error: 'No tienes permisos para editar esta asociación' });
      }
    }

    const dataAActualizar = { ...req.body };
    if (req.file) {
      dataAActualizar.logo_url = req.file.path;
    }

    asociacion = await Asociacion.findByIdAndUpdate(asociacionId, dataAActualizar, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: asociacion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Activar/Desactivar una asociación (Toggle status)
// @route   PATCH /api/asociaciones/:id/estado
// @access  Private (Admin o Representante)
exports.toggleEstadoAsociacion = async (req, res) => {
  try {
    const asociacionId = req.params.id;
    const asociacion = await Asociacion.findById(asociacionId);

    if (!asociacion) {
      return res.status(404).json({ success: false, error: 'Asociación no encontrada' });
    }

    if (req.user.role !== 'admin') {
      const afiliacion = await Afiliacion.findOne({
        usuario: req.user.id,
        asociacion: asociacionId,
        estado: 'aprobada',
        rol_asociacion: 'representante'
      });

      if (!afiliacion) {
        return res.status(403).json({ success: false, error: 'No tienes permisos para editar esta asociación' });
      }
    }

    asociacion.activa = !asociacion.activa;
    await asociacion.save();

    res.status(200).json({ success: true, data: asociacion });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al cambiar estado' });
  }
};

// @desc    Eliminar una asociación
// @route   DELETE /api/asociaciones/:id
// @access  Private (Admin global)
exports.eliminarAsociacion = async (req, res) => {
  try {
    const asociacionId = req.params.id;

    const asociacion = await Asociacion.findById(asociacionId);
    if (!asociacion) {
      return res.status(404).json({ success: false, error: 'Asociación no encontrada' });
    }

    // Validación: No se puede borrar si tiene usuarios afiliados
    const countAfiliaciones = await Afiliacion.countDocuments({ asociacion: asociacionId });
    if (countAfiliaciones > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la asociación porque tiene ${countAfiliaciones} usuario(s) asociado(s). Elimina las afiliaciones primero.`
      });
    }

    await asociacion.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al eliminar la asociación' });
  }
};

// @desc    Obtener una sola asociación por ID
// @route   GET /api/asociaciones/:id
// @access  Private
exports.obtenerAsociacionPorId = async (req, res) => {
  try {
    const asociacion = await Asociacion.findById(req.params.id);
    if (!asociacion) {
      return res.status(404).json({ success: false, error: 'Asociación no encontrada' });
    }
    res.status(200).json({ success: true, data: asociacion });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener la asociación' });
  }
};

