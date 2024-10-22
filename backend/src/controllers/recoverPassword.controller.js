import { pool } from '../config/db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.alu.uct.cl', // Servidor SMTP proporcionado por tu universidad
    port: 587, // Cambia según el puerto que te indique la universidad
    secure: false, // False para TLS (normalmente usado en el puerto 587)
    auth: {
      user: process.env.EMAIL_USER, // Tu correo institucional (ej: tu_nombre@alu.uct.cl)
      pass: process.env.EMAIL_PASS, // La contraseña de tu correo institucional
    },
    tls: {
      rejectUnauthorized: false, // Solo si el servidor usa certificados autofirmados
    },
  });
export const recoverPassword = async (req, res) => {
  const { email } = req.body;

  console.log('Email:', email);

  // Validación básica de entrada
  if (!email) {
    return res.status(400).json({ message: 'El correo es requerido' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE correo = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    // Generar un token de restablecimiento de contraseña
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hora de validez

    // Guardar el token y la expiración en la base de datos
    await pool.query('UPDATE Usuario SET resetToken = ?, resetTokenExpiration = ? WHERE ID_usuario = ?', [
      token,
      tokenExpiration,
      user.ID_usuario,
    ]);

    // Configuración de nodemailer para enviar el correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecimiento de contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="https://tuapp.com/reset-password/${token}">Restablecer Contraseña</a>
      `,
    };

    // Enviar el correo de recuperación
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error.message);
        return res.status(500).json({ message: 'Error al enviar el correo' });
      }
      res.status(200).json({ message: 'Correo de recuperación enviado' });
    });
  } catch (err) {
    console.error('Error en la recuperación de contraseña:', err.message);
    res.status(500).json({ message: 'Error al recuperar la contraseña' });
  }
};
// Controlador para restablecer la contraseña
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    console.log('Token:', token);
  
    // Validación básica de entrada
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }
  
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Usuario WHERE resetToken = ? AND resetTokenExpiration > ?',
        [token, Date.now()]
      );
  
      if (rows.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }
  
      const user = rows[0];
  
      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Actualizar la contraseña en la base de datos
      await pool.query(
        'UPDATE Usuario SET contrasena = ?, resetToken = NULL, resetTokenExpiration = NULL WHERE ID_usuario = ?',
        [hashedPassword, user.ID_usuario]
      );
  
      res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (err) {
      console.error('Error al restablecer la contraseña:', err.message);
      res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
  };
