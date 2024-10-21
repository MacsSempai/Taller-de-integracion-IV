// src/routes/caso.routes.js

import express from 'express';
import { getCasos, getCasoByID, createCaso } from '../controllers/caso.controller.js';

const router = express.Router();

// Ruta para obtener todos los casos
router.get('/', getCasos);

// Ruta para obtener un caso por ID
router.get('/:id', getCasoByID);

// Ruta para crear un nuevo caso
router.post('/', createCaso);

export default router;
