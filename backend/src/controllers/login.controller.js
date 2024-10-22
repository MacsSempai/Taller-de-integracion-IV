import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('Email:', email);

  // Validación básica de entrada
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE correo = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.contrasena); // Asegúrate de usar 'user.contrasena'

    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.ID_usuario }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Devuelve el token y cualquier otra información del usuario que necesites
    res.json({ token, user: { id: user.ID_usuario, email: user.correo } });
  } catch (err) {
    console.error('Error al iniciar sesión:', err.message);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};
