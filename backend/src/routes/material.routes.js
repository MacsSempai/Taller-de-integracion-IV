import { Router } from 'express';
import { getMateriales, updateMaterialPrice } from '../controllers/material.controller.js'; // Importar el controlador de materiales

const router = Router();

router.get('/', getMateriales); // Definir ruta para obtener materiales
router.put('/:id', updateMaterialPrice);
export default router;
