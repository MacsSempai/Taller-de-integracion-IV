import { Router } from 'express';
import { createCaso, getCasos, getCasosUsuario, getCasoById, getCasoCompletoById, updateEstadoCaso, createNuevoCaso } from '../controllers/caso.controller.js';
const router = Router();

// Ruta para crear un caso
router.post('/', createCaso);

// Ruta para obtener todos los casos
router.get('/', getCasos);

// Ruta para obtener casos del usuario
router.get('/:ID_usuario/usuario', getCasosUsuario);

// Ruta para obtener un caso por ID
router.get('/:ID_caso', getCasoById);

// Ruta para obtener información completa de un caso
router.get('/:ID_caso/completo', getCasoCompletoById);

// Ruta para actualizar un caso
router.put('/:ID_caso', updateEstadoCaso);

// Ruta para crear un nuevo caso
router.post('/nuevo', createNuevoCaso);

export default router;
