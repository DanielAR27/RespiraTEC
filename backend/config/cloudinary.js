// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary con llaves del .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para crear un uploader con una carpeta específica
const createUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName, // Nombre de la carpeta dinámica
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Formatos permitidos por seguridad
      transformation: [{ quality: 'auto', fetch_format: 'auto' }] // Mantiene la resolución original optimizando peso y formato automáticamente
    },
  });

  return multer({ storage: storage });
};

module.exports = createUploader;