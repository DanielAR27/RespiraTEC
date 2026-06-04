const express = require('express');
const { descargarCertificado } = require('../controllers/certificadoController');
const { proteger } = require('../middleware/auth');

const router = express.Router();

router.use(proteger);

router.get('/:tallerId', descargarCertificado);

module.exports = router;
