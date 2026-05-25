// index.js (Raíz)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

// Importas un solo archivo: tu Router Central
const apiRoutes = require('./routes/index');

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: 'http://localhost',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🟢 Conectado a MongoDB Local'))
  .catch((err) => console.error('🔴 Error conectando a MongoDB:', err));

// Montas el router central
app.use('/api', apiRoutes); 

app.use((err, req, res, next) => {
  if (err.message && (err.message === 'An unknown file format not allowed' || err.message.toLowerCase().includes('not allowed'))) {
    return res.status(400).json({ success: false, error: 'Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.' });
  }
  
  console.error("GLOBAL ERROR HANDLER CAUGHT:", err);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});