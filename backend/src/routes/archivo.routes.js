import express from 'express';
import { uploadExcel, downloadArchive } from '../controllers/archivo.controller.js'; // Asegúrate de importar el controlador correcto

const router = express.Router();

// Definir la ruta POST para subir el archivo Excel
router.post('/upload-excel', uploadExcel);

// Definir la ruta GET para descargar el archivo
router.get('/:ID_caso/download', downloadArchive);

export default router;
