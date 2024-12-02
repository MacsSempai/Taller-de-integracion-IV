import { pool } from '../config/db.js';

// Obtener todos los subsectores
export const getSubSectores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subsector');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener subsectores:', error);
    res.status(500).json({ message: 'Error al obtener subsectores' });
  }
};

// Crear un nuevo subsector
export const createSubSector = async (req, res) => {
  const { nombre_sub_sector, cantidad_material, tipo_reparacion, ID_material, ID_sector } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO SubSector (nombre_sub_sector, cantidad_material, tipo_reparacion, ID_material, ID_sector) VALUES (?, ?, ?, ?, ?)',
      [nombre_sub_sector, cantidad_material, tipo_reparacion, ID_material, ID_sector]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear subsector:', error);
    res.status(500).json({ message: 'Error al crear subsector' });
  }
};
