import { pool } from '../config/db.js';

export const createTrabajo = async (req, res) => {
  const { Nombre_trabajo, coste_trabajo, tipo, ID_contratista } = req.body;

  if (!Nombre_trabajo || !coste_trabajo || !tipo || !ID_contratista) {
    return res.status(400).json({
      message: 'Faltan datos necesarios para crear el trabajo.',
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Trabajos (Nombre_trabajo, coste_trabajo, tipo, ID_contratista)
       VALUES (?, ?, ?, ?)`,
      [Nombre_trabajo, coste_trabajo, tipo, ID_contratista]
    );

    const TrabajoID = result.insertId;

    res.status(201).json({ message: 'Trabajo creado.', TrabajoID });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTrabajo = async (req, res) => {
  try {
    const [trabajos] = await pool.query('SELECT * FROM Trabajos');

    res.status(200).json(trabajos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTrabajoByID = async (req, res) => {
  const { id } = req.params;

  try {
    const [trabajo] = await pool.query(
      'SELECT * FROM Trabajos WHERE ID_trabajo = ?',
      [id]
    );

    if (trabajo.length === 0) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    res.status(200).json(trabajo[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTrabajo = async (req, res) => {
  const { id } = req.params;
  const { Nombre_trabajo, coste_trabajo, tipo, ID_contratista } = req.body;

  if (!Nombre_trabajo || !coste_trabajo || !tipo || !ID_contratista) {
    return res.status(400).json({
      message: 'Faltan datos necesarios para actualizar el trabajo.',
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Trabajos SET Nombre_trabajo = ?, coste_trabajo = ?, tipo = ?, ID_contratista = ?
       WHERE ID_trabajo = ?`,
      [Nombre_trabajo, coste_trabajo, tipo, ID_contratista, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    res.status(200).json({ message: 'Trabajo actualizado.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTrabajo = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM Trabajos WHERE ID_trabajo = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    res.status(200).json({ message: 'Trabajo eliminado.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
