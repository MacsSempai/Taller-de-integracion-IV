import { pool } from '../config/db.js';

// Controlador para obtener todos los contratistas
export const getContratistas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Contratista');
    
    // Verificar si hay contratistas en la respuesta
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron contratistas' });
    }

    // Responder con los datos en formato JSON
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener contratistas:', error);
    res.status(500).json({ message: 'Error al obtener contratistas' });
  }
};
