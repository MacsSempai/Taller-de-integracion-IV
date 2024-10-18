import { Router } from 'express';
import { uploadExcel } from '../controllers/archivo.controller.js';

const router = Router();

// Ruta para la subida de archivos Excel
router.post('/upload-excel', uploadExcel);

export default router;
