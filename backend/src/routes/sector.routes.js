import { Router } from 'express';
import { getSectores, createSector } from '../controllers/sector.controller.js';

const router = Router();

// Ruta para obtener todos los sectores
router.get('/', getSectores);

// Ruta para crear un nuevo sector
router.post('/', createSector);

export default router;
