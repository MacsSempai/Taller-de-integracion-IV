// routes/files.routes.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile, getFilesByCaso, downloadFile } from '../controllers/filesController.js';

const router = express.Router();

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'files'); // Ruta absoluta al directorio de uploads/files
    // Crear el directorio si no existe
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFilename);
  }
});

// Inicializar multer con el almacenamiento configurado
const upload = multer({ storage: storage });

// Ruta para subir un archivo
router.post('/upload', upload.single('file'), uploadFile);

// Ruta para obtener archivos por ID_caso
router.get('/caso/:ID_caso', getFilesByCaso);

// Ruta para descargar un archivo por ID_archivo
router.get('/download/:ID_archivo', downloadFile);

export default router;
