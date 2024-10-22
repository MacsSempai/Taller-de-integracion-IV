import express from 'express';
import { getRol, getRolporID, registerRol } from '../controllers/rol.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/rol:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Registrar un nuevo rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 example: Administrador
 *               puede_editar_precios:
 *                 type: boolean
 *                 example: true
 *               puede_ver_casos:
 *                 type: boolean
 *                 example: true
 *               puede_generar_excel:
 *                 type: boolean
 *                 example: false
 *               puede_generar_informe_pdf:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Rol registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error en el servidor
 */
router.post('/', registerRol);

/**
 * @openapi
 * /api/v1/rol:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Obtener todos los roles
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_rol:
 *                     type: integer
 *                   nombre_rol:
 *                     type: string
 *                   puede_editar_precios:
 *                     type: boolean
 *                   puede_ver_casos:
 *                     type: boolean
 *                   puede_generar_excel:
 *                     type: boolean
 *                   puede_generar_informe_pdf:
 *                     type: boolean
 *       500:
 *         description: Error en el servidor
 */
router.get('/', getRol);

router.get('/:id', getRolporID);

export default router;
