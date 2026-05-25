// routes/index.js
const express = require('express');
const router = express.Router();

// Importar las rutas específicas
const eventoRoutes = require('./eventoRoutes');
const authRoutes = require('./authRoutes');
const descuentoRoutes = require('./descuentoRoutes');
const tallerRoutes = require('./tallerRoutes');
const asociacionesRoutes = require('./asociaciones');
const afiliacionesRoutes = require('./afiliaciones');
const usuarioRoutes = require('./usuarioRoutes');

// Montar las rutas en sus respectivos "caminos"
router.use('/eventos', eventoRoutes);
router.use('/auth', authRoutes);
router.use('/descuentos', descuentoRoutes);
router.use('/talleres', tallerRoutes);
router.use('/asociaciones', asociacionesRoutes);
router.use('/afiliaciones', afiliacionesRoutes);
router.use('/usuarios', usuarioRoutes);

module.exports = router;