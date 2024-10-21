import { pool } from '../config/db.js';

// Obtener todos los materiales
export const getMateriales = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Material');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    res.status(500).json({ message: 'Error al obtener materiales' });
  }
};

// Actualizar el precio de un material
export const updateMaterialPrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (!price) {
    return res.status(400).json({ message: 'El nuevo precio es obligatorio' });
  }

  try {
    const query = 'UPDATE Material SET precio = ? WHERE ID_material = ?';
    const [result] = await pool.query(query, [price, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    res.json({ message: 'Precio actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el precio del material:', error);
    res.status(500).json({ message: 'Error al actualizar el precio del material' });
  }
};
