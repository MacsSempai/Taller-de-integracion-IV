import express from 'express';
import { recoverPassword, verifyCode, resetPassword } from '../controllers/passwordController.js';

const router = express.Router();

// Ruta para solicitar el código de recuperación
router.post('/recover-password', recoverPassword);

// Ruta para verificar el código
router.post('/verify-code', verifyCode);

// Ruta para restablecer la contraseña
router.post('/reset-password', resetPassword);

export default router;
