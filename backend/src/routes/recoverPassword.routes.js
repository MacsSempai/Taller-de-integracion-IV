import { Router } from 'express';
import { recoverPassword, resetPassword } from '../controllers/recoverPassword.controller.js';

const router = Router();

// Ruta para solicitar el restablecimiento de contraseña
router.post('/recover-password', recoverPassword);

// Ruta para restablecer la contraseña usando el token
router.post('/reset-password', resetPassword);

export default router;
