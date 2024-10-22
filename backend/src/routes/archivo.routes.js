import express from 'express';
import { uploadExcel } from '../controllers/archivo.controller.js'; // Asegúrate de importar el controlador correcto

const router = express.Router();

// Definir la ruta POST para subir el archivo Excel
router.post('/upload-excel', uploadExcel);

export default router;
