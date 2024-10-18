import { Router } from 'express';
import { getSubSectores, createSubSector } from '../controllers/subsector.controller.js';

const router = Router();

// Ruta para obtener todos los subsectores
router.get('/', getSubSectores);

// Ruta para crear un nuevo subsector
router.post('/', createSubSector);

export default router;
