import express from 'express';
import {
  createTrabajo,
  getTrabajo, 
  getTrabajoByID, 
  updateTrabajo,
  deleteTrabajo,
} from '../controllers/trabajoController.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/trabajos:
 *   post:
 *     tags:
 *       - Trabajos
 *     summary: Crear un nuevo trabajo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre_trabajo:
 *                 type: string
 *                 example: Construcción de muro
 *               coste_trabajo:
 *                 type: number
 *                 example: 1500
 *               tipo:
 *                 type: string
 *                 example: Construcción
 *               ID_contratista:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Trabajo creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error en el servidor
 */
router.post('/', createTrabajo);

/**
 * @openapi
 * /api/v1/trabajos:
 *   get:
 *     tags:
 *       - Trabajos
 *     summary: Obtener todos los trabajos
 *     responses:
 *       200:
 *         description: Lista de trabajos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_trabajo:
 *                     type: integer
 *                   Nombre_trabajo:
 *                     type: string
 *                   coste_trabajo:
 *                     type: number
 *                   tipo:
 *                     type: string
 *                   ID_contratista:
 *                     type: integer
 *       500:
 *         description: Error en el servidor
 */
router.get('/', getTrabajo);

/**
 * @openapi
 * /api/v1/trabajos/{id}:
 *   get:
 *     tags:
 *       - Trabajos
 *     summary: Obtener un trabajo específico
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trabajo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_trabajo:
 *                   type: integer
 *                 Nombre_trabajo:
 *                   type: string
 *                 coste_trabajo:
 *                   type: number
 *                 tipo:
 *                   type: string
 *                 ID_contratista:
 *                   type: integer
 *       404:
 *         description: Trabajo no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get('/:id', getTrabajoByID);

/**
 * @openapi
 * /api/v1/trabajos/{id}:
 *   put:
 *     tags:
 *       - Trabajos
 *     summary: Actualizar un trabajo específico
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre_trabajo:
 *                 type: string
 *                 example: Renovación de fachada
 *               coste_trabajo:
 *                 type: number
 *                 example: 2000
 *               tipo:
 *                 type: string
 *                 example: Renovación
 *               ID_contratista:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Trabajo actualizado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Trabajo no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put('/:id', updateTrabajo);

/**
 * @openapi
 * /api/v1/trabajos/{id}:
 *   delete:
 *     tags:
 *       - Trabajos
 *     summary: Eliminar un trabajo específico
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trabajo eliminado exitosamente
 *       404:
 *         description: Trabajo no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.delete('/:id', deleteTrabajo);

export default router;
