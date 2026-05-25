// controllers/descuentoController.js
const Descuento = require('../models/Descuento');

// @desc    Crear un nuevo descuento con imagen/logo
// @route   POST /api/descuentos
exports.crearDescuento = async (req, res) => {
  try {
    // Si Multer hizo bien su trabajo, la URL de Cloudinary estará en req.file.path
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Por favor sube una imagen o logo para el comercio' });
    }

    const { fecha_expiracion } = req.body;

    // Validación: Evitar que la fecha de expiración sea menor a la fecha actual
    if (fecha_expiracion && new Date(fecha_expiracion) < new Date()) {
      return res.status(400).json({ success: false, error: 'La fecha de expiración no puede ser una fecha pasada' });
    }

    const dataDescuento = {
      ...req.body,
      imagen_url: req.file.path // Guarda el enlace directo de Cloudinary
    };

    const nuevoDescuento = await Descuento.create(dataDescuento);
    
    res.status(201).json({
      success: true,
      data: nuevoDescuento
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Obtener todos los descuentos (Panel Admin)
// @route   GET /api/descuentos
exports.obtenerDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.find().sort({ createdAt: -1 }); // Los más nuevos primero
    res.status(200).json({ success: true, cantidad: descuentos.length, data: descuentos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
};

// @desc    Obtener un solo descuento por ID
// @route   GET /api/descuentos/:id
exports.obtenerDescuentoPorId = async (req, res) => {
  try {
    const descuento = await Descuento.findById(req.params.id);
    if (!descuento) {
      return res.status(404).json({ success: false, error: 'Descuento no encontrado' });
    }
    res.status(200).json({ success: true, data: descuento });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor o ID inválido' });
  }
};

// @desc    Actualizar un descuento
// @route   PUT /api/descuentos/:id
exports.actualizarDescuento = async (req, res) => {
  try {
    let descuento = await Descuento.findById(req.params.id);

    if (!descuento) {
      return res.status(404).json({ success: false, error: 'Descuento no encontrado' });
    }

    const { fecha_expiracion } = req.body;

    // Validación de fecha en caso de que decidan actualizarla
    if (fecha_expiracion && new Date(fecha_expiracion) < new Date()) {
      return res.status(400).json({ success: false, error: 'La fecha de expiración no puede ser una fecha pasada' });
    }

    const dataAActualizar = { ...req.body };

    // Si viene una nueva imagen/logo, actualiza la url
    if (req.file) {
      dataAActualizar.imagen_url = req.file.path;
    }

    // Actualiza el descuento
    descuento = await Descuento.findByIdAndUpdate(req.params.id, dataAActualizar, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: descuento });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Eliminar un descuento
// @route   DELETE /api/descuentos/:id
exports.eliminarDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findById(req.params.id);

    if (!descuento) {
      return res.status(404).json({ success: false, error: 'Descuento no encontrado' });
    }

    await descuento.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al eliminar' });
  }
};

// @desc    Activar/Desactivar un descuento (Toggle status)
// @route   PATCH /api/descuentos/:id/estado
exports.toggleEstadoDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findById(req.params.id);

    if (!descuento) {
      return res.status(404).json({ success: false, error: 'Descuento no encontrado' });
    }

    // Alternar el booleano 'activo' que se definió en el modelo
    descuento.activo = !descuento.activo;
    await descuento.save();

    res.status(200).json({ success: true, data: descuento });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al cambiar estado' });
  }
};