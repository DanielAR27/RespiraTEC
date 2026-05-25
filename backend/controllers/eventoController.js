// controllers/eventoController.js
const Evento = require('../models/Evento');

// @desc    Crear un nuevo evento con imagen
// @route   POST /api/eventos
exports.crearEvento = async (req, res) => {
  try {
    // Si Multer hizo bien su trabajo, la URL de Cloudinary estará en req.file.path
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Por favor sube una imagen para el evento' });
    }

    const dataEvento = {
      ...req.body,
      imagen_url: req.file.path, // Guarda el enlace directo de Cloudinary
      cupo_disponible: req.body.cupo_maximo // Inicialmente el cupo disponible es el máximo
    };

    const nuevoEvento = await Evento.create(dataEvento);
    
    res.status(201).json({
      success: true,
      data: nuevoEvento
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Obtener todos los eventos
// @route   GET /api/eventos
exports.obtenerEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ createdAt: -1 }); // Los más nuevos primero
    res.status(200).json({ success: true, cantidad: eventos.length, data: eventos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
};

// @desc    Obtener un solo evento por ID
// @route   GET /api/eventos/:id
exports.obtenerEventoPorId = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }
    res.status(200).json({ success: true, data: evento });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor o ID inválido' });
  }
};

// @desc    Actualizar un evento
// @route   PUT /api/eventos/:id
exports.actualizarEvento = async (req, res) => {
  try {
    let evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }

    const dataAActualizar = { ...req.body };

    // Si viene una nueva imagen, actualiza la url
    if (req.file) {
      dataAActualizar.imagen_url = req.file.path;
    }

    // Actualiza el evento
    evento = await Evento.findByIdAndUpdate(req.params.id, dataAActualizar, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: evento });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Eliminar un evento
// @route   DELETE /api/eventos/:id
exports.eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }

    await evento.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al eliminar' });
  }
};

// @desc    Activar/Desactivar un evento (Toggle status)
// @route   PATCH /api/eventos/:id/estado
exports.toggleEstadoEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }

    // Alternar estado
    evento.activo = !evento.activo;
    await evento.save();

    res.status(200).json({ success: true, data: evento });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al cambiar estado' });
  }
};