// src/controllers/trabajos.controller.js

import { pool } from '../config/db.js';

// Controlador para obtener los trabajos asociados a un SubSector
export const getTrabajosBySubSector = async (req, res) => {
  const { subSectorId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM trabajos WHERE ID_sub_sector = ?',
      [subSectorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron trabajos para este subsector' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener trabajos:', error);
    res.status(500).json({ message: 'Error al obtener trabajos' });
  }
};

// Controlador para crear un nuevo trabajo (opcional)
export const createTrabajo = async (req, res) => {
  const { nombre_trabajo, descripcion, ID_sub_sector } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Trabajo (nombre_trabajo, descripcion, ID_sub_sector) VALUES (?, ?, ?)',
      [nombre_trabajo, descripcion, ID_sub_sector]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear trabajo:', error);
    res.status(500).json({ message: 'Error al crear trabajo' });
  }
};
