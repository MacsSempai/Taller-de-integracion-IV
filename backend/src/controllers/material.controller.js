import { pool } from '../config/db.js';

export const getMateriales = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM material');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    res.status(500).json({ message: 'Error al obtener materiales' });
  }
};
