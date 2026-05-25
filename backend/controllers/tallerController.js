// controllers/tallerController.js
const Taller = require('../models/Taller');

// @desc    Crear un nuevo taller con imagen
// @route   POST /api/talleres
exports.crearTaller = async (req, res) => {
  try {
    // Si Multer procesó la carga, la URL de Cloudinary estará en req.file.path
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Por favor sube una imagen promocional para el taller' });
    }

    // Si horario_semanal viene como string (desde FormData), se parsea
    if (req.body.horario_semanal && typeof req.body.horario_semanal === 'string') {
      try {
        req.body.horario_semanal = JSON.parse(req.body.horario_semanal);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Formato inválido para horario_semanal' });
      }
    }

    const dataTaller = {
      ...req.body,
      imagen_url: req.file.path, // Guarda el enlace directo de Cloudinary
      // Nota: cupo_disponible se inicializa automáticamente al valor de cupo_maximo 
      // gracias al middleware pre('save') que se definió en el modelo.
    };

    const nuevoTaller = await Taller.create(dataTaller);
    
    res.status(201).json({
      success: true,
      data: nuevoTaller
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Obtener todos los talleres
// @route   GET /api/talleres
exports.obtenerTalleres = async (req, res) => {
  try {
    const talleres = await Taller.find().sort({ createdAt: -1 }); // Los más nuevos primero
    res.status(200).json({ success: true, cantidad: talleres.length, data: talleres });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al obtener talleres' });
  }
};

// @desc    Obtener un solo taller por ID
// @route   GET /api/talleres/:id
exports.obtenerTallerPorId = async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id);
    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }
    res.status(200).json({ success: true, data: taller });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor o ID inválido' });
  }
};

// @desc    Actualizar un taller
// @route   PUT /api/talleres/:id
exports.actualizarTaller = async (req, res) => {
  try {
    let taller = await Taller.findById(req.params.id);

    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }

    const dataAActualizar = { ...req.body };

    // Si horario_semanal viene como string (desde FormData), se parsea
    if (dataAActualizar.horario_semanal && typeof dataAActualizar.horario_semanal === 'string') {
      try {
        dataAActualizar.horario_semanal = JSON.parse(dataAActualizar.horario_semanal);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Formato inválido para horario_semanal' });
      }
    }

    // Si viene una nueva imagen promocional, reemplaza la url
    if (req.file) {
      dataAActualizar.imagen_url = req.file.path;
    }

    // Si en la actualización se modifica el cupo_maximo, se recalcula proporcionalmente el disponible
    if (req.body.cupo_maximo !== undefined) {
      const diferenciaCupo = req.body.cupo_maximo - taller.cupo_maximo;
      dataAActualizar.cupo_disponible = Math.max(0, taller.cupo_disponible + diferenciaCupo);
    }

    // Actualiza el taller aplicando validadores del modelo
    taller = await Taller.findByIdAndUpdate(req.params.id, dataAActualizar, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: taller });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Eliminar un taller por completo
// @route   DELETE /api/talleres/:id
exports.eliminarTaller = async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id);

    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }

    await taller.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al eliminar el taller' });
  }
};

// @desc    Activar/Desactivar visibilidad de un taller (Toggle status)
// @route   PATCH /api/talleres/:id/estado
exports.toggleEstadoTaller = async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id);

    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }

    // Alternar estado booleano
    taller.activo = !taller.activo;
    await taller.save();

    res.status(200).json({ success: true, data: taller });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error del servidor al cambiar estado' });
  }
};