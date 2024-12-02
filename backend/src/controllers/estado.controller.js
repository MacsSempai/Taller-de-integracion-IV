import { pool } from '../config/db.js';

export const getEstadoCaso = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estado_caso');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron estados de caso' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estados de caso:', error);
    res.status(500).json({ message: 'Error al obtener estados de caso' });
  }
};
