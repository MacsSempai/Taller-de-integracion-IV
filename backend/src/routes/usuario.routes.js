import express from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  getUserByID,
  updateUserPassword,
} from '../controllers/userController.js';
import { loginUser } from '../controllers/loginController.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error en el servidor
 */
router.post('/', createUser);

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener todos los usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       500:
 *         description: Error en el servidor
 */
router.get('/', getUsers);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar un usuario específico
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
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put('/:id', updateUser);

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error en el servidor
 */
router.post('/login', loginUser);

router.get('/:id', getUserByID);

router.put('/:id/password', updateUserPassword);
export default router;
