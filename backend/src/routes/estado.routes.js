import { Router } from 'express';
import { getEstadoCaso } from '../controllers/estado.controller.js'; // Importar el controlador de estado de caso

const router = Router();

router.get('/', getEstadoCaso); // Definir ruta para obtener estado de casos

export default router;
