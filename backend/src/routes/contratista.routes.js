import { Router } from 'express';
import { getContratistas } from '../controllers/contratista.controller.js';

const router = Router();

// Ruta para obtener todos los contratistas
router.get('/', getContratistas);

export default router;
