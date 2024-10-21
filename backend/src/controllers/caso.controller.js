// src/controllers/caso.controller.js

import { pool } from '../config/db.js';

/**
 * Obtener todos los casos.
 * Retorna una lista de objetos que contienen los campos necesarios para generar el PDF.
 */
export const getCasos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ID_caso,
        tipo_siniestro,
        descripcion_siniestro,
        ID_Cliente,
        ID_inspector,
        ID_contratista,
        ID_estado
      FROM caso
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los casos:', error);
    res.status(500).json({ error: 'Error al obtener los casos.' });
  }
};

/**
 * Obtener un caso específico por su ID.
 * Retorna un objeto con los campos necesarios para generar el PDF.
 */
export const getCasoByID = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        ID_caso,
        tipo_siniestro,
        descripcion_siniestro,
        ID_Cliente,
        ID_inspector,
        ID_contratista,
        ID_estado
      FROM caso
      WHERE ID_caso = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener el caso:', error);
    res.status(500).json({ error: 'Error al obtener el caso.' });
  }
};

/**
 * Crear un nuevo caso.
 * Inserta un nuevo registro en la tabla `caso` con los datos proporcionados.
 */
export const createCaso = async (req, res) => {
  try {
    const {
      tipo_siniestro,
      descripcion_siniestro,
      ID_Cliente,       // ID_usuario con ID_rol = 3 (Cliente)
      ID_inspector,     // ID_usuario con ID_rol = 2 (Inspector)
      ID_contratista,
      ID_estado
    } = req.body;

    // Validación básica de los campos requeridos
    if (!tipo_siniestro || !descripcion_siniestro || !ID_Cliente || !ID_inspector || !ID_contratista || !ID_estado) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    // Opcional: Validaciones adicionales para asegurar la integridad de los datos
    // Verificar que ID_Cliente existe y tiene ID_rol = 3
    const [clienteRows] = await pool.query(
      'SELECT * FROM usuario WHERE ID_usuario = ? AND ID_rol = 3',
      [ID_Cliente]
    );
    if (clienteRows.length === 0) {
      return res.status(400).json({ error: 'ID_Cliente inválido o no corresponde a un cliente.' });
    }

    // Verificar que ID_inspector existe y tiene ID_rol = 2
    const [inspectorRows] = await pool.query(
      'SELECT * FROM usuario WHERE ID_usuario = ? AND ID_rol = 2',
      [ID_inspector]
    );
    if (inspectorRows.length === 0) {
      return res.status(400).json({ error: 'ID_inspector inválido o no corresponde a un inspector.' });
    }

    // Verificar que ID_contratista existe
    const [contratistaRows] = await pool.query(
      'SELECT * FROM contratista WHERE ID_contratista = ?',
      [ID_contratista]
    );
    if (contratistaRows.length === 0) {
      return res.status(400).json({ error: 'ID_contratista inválido.' });
    }

    // Verificar que ID_estado existe
    const [estadoRows] = await pool.query(
      'SELECT * FROM estado_caso WHERE ID_estado = ?',
      [ID_estado]
    );
    if (estadoRows.length === 0) {
      return res.status(400).json({ error: 'ID_estado inválido.' });
    }

    // Insertar el nuevo caso en la base de datos
    const [result] = await pool.query(`
      INSERT INTO caso 
        (tipo_siniestro, descripcion_siniestro, ID_Cliente, ID_inspector, ID_contratista, ID_estado)
      VALUES 
        (?, ?, ?, ?, ?, ?)
    `, [tipo_siniestro, descripcion_siniestro, ID_Cliente, ID_inspector, ID_contratista, ID_estado]);

    res.status(201).json({ message: 'Caso creado exitosamente.', ID_caso: result.insertId });
  } catch (error) {
    console.error('Error al crear el caso:', error);
    res.status(500).json({ error: 'Error al crear el caso.' });
  }
};
