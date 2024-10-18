import { Router } from 'express';
import { createCaso, getCasos,  } from '../controllers/caso.controller.js';

const router = Router();

// Ruta para crear un caso
router.post('/', createCaso);

// Ruta para obtener todos los casos
router.get('/', getCasos);



export default router;
