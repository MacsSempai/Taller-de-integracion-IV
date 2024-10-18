import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const {
    nombre,
    apellido,
    celular,
    correo,
    contrasena,
    direccion,
    comuna,
    ID_rol,
  } = req.body;

  // Verificación de campos obligatorios
  if (
    !nombre ||
    !apellido ||
    !celular ||
    !correo ||
    !contrasena ||
    !direccion ||
    !comuna ||
    !ID_rol
  ) {
    return res.status(400).json({
      message: 'Faltan datos necesarios para crear el usuario.',
    });
  }

  try {
    // Cifrar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO Usuario (nombre, apellido, celular, correo, contrasena, direccion, comuna, ID_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido,
        celular,
        correo,
        hashedPassword,
        direccion,
        comuna,
        ID_rol,
      ] // Usa hashedPassword aquí
    );

    const UsuarioID = result.insertId;

    res.status(201).json({ message: 'Usuario creado.', UsuarioID });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT * FROM Usuario');

    res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por ID
export const getUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    const [usuario] = await pool.query(
      'SELECT * FROM Usuario WHERE ID_usuario = ?',
      [id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(usuario[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Actualizar usuario sin contraseña
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, celular, correo, direccion, comuna, ID_rol } =
    req.body;

  // Verificar que los campos requeridos no sean null o undefined
  if (
    !nombre ||
    !apellido ||
    !celular ||
    !correo ||
    !direccion ||
    !comuna ||
    !ID_rol
  ) {
    return res.status(400).json({
      message: 'Faltan datos necesarios para actualizar el usuario.',
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Usuario
       SET nombre = ?, apellido = ?, celular = ?, correo = ?, direccion = ?, comuna = ?, ID_rol = ?
       WHERE ID_usuario = ?`,
      [nombre, apellido, celular, correo, direccion, comuna, ID_rol, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario actualizado.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM Usuario WHERE ID_usuario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Actualizar la contraseña de un usuario
export const updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { contrasenaActual, nuevaContrasena } = req.body;

  // Verificar que se proporcionen ambas contraseñas
  if (!contrasenaActual || !nuevaContrasena) {
    return res.status(400).json({
      message: 'Se requieren la contraseña actual y la nueva contraseña.',
    });
  }

  try {
    // Obtener el usuario actual para verificar la contraseña
    const [usuarios] = await pool.query(
      'SELECT contrasena FROM Usuario WHERE ID_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const usuario = usuarios[0];

    // Verificar que la contraseña actual coincida
    const isMatch = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
    }

    // Cifrar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar la contraseña en la base de datos
    const [result] = await pool.query(
      `UPDATE Usuario SET contrasena = ? WHERE ID_usuario = ?`,
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
