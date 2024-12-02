import { pool } from '../config/db.js';

// Obtener todos los sectores
export const getSectores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sector');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener sectores:', error);
    res.status(500).json({ message: 'Error al obtener sectores' });
  }
};

// Crear un nuevo sector
export const createSector = async (req, res) => {
  const { nombre_sector, dano_sector, porcentaje_perdida, total_costo, ID_caso } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Sector (nombre_sector, dano_sector, porcentaje_perdida, total_costo, ID_caso) VALUES (?, ?, ?, ?, ?)',
      [nombre_sector, dano_sector, porcentaje_perdida, total_costo, ID_caso]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear sector:', error);
    res.status(500).json({ message: 'Error al crear sector' });
  }
};
