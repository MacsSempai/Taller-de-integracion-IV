import { Router } from 'express';
import { getTrabajosBySubSector, createTrabajo } from '../controllers/trabajos.controller.js';

const router = Router();

// Ruta para obtener trabajos por ID de SubSector
router.get('/trabajos/:subSectorId', getTrabajosBySubSector);

// Ruta para crear un nuevo trabajo (opcional)
router.post('/trabajos', createTrabajo);

export default router;
