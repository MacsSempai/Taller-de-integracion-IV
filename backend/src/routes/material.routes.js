import { Router } from 'express';
import { getMateriales } from '../controllers/material.controller.js'; // Importar el controlador de materiales

const router = Router();

router.get('/', getMateriales); // Definir ruta para obtener materiales

export default router;
