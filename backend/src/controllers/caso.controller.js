import { pool } from '../config/db.js';

// Controlador para crear un nuevo caso
export const createCaso = async (req, res) => {
  try {
    const {
      tipo_siniestro,
      descripcion_siniestro,
      ID_contratista,
      ID_material,
      ID_estado,
      sector,
      sub_sector,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO caso (tipo_siniestro, descripcion_siniestro, ID_contratista, ID_estado)
      VALUES (?, ?, ?, ?)`,
      [tipo_siniestro, descripcion_siniestro, ID_contratista, ID_estado]
    );

    const ID_caso = result.insertId; // ID del caso recién creado
    res.status(201).json({ message: 'Caso creado exitosamente', ID_caso });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el caso', error: error.message });
  }
};

// Controlador para obtener todos los casos
export const getCasos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM caso');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los casos', error: error.message });
  }
};
