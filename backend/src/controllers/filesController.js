// controllers/filesController.js

import { pool } from '../config/db.js';
import path from 'path';
import fs from 'fs';

// Función para subir un archivo
export const uploadFile = async (req, res) => {
  try {
    const { file } = req;
    const { ID_caso, tipo_de_archivo } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    // Validar tipo de archivo si es necesario (ejemplo: permitir solo PDFs)
    if (tipo_de_archivo && tipo_de_archivo !== 'application/pdf') {
      // Opcional: eliminar el archivo si no cumple con el tipo
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Solo se permiten archivos PDF.' });
    }

    // Insertar la información del archivo en la base de datos
    const ruta_archivo = file.filename; // Puedes almacenar el nombre del archivo o la ruta completa

    const [result] = await pool.query(
      'INSERT INTO archivo (ID_caso, tipo_de_archivo, ruta_archivo) VALUES (?, ?, ?)',
      [ID_caso || null, tipo_de_archivo || file.mimetype, ruta_archivo]
    );

    res.status(200).json({ message: 'Archivo subido correctamente.', ID_archivo: result.insertId });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo.' });
  }
};

// Función para obtener archivos por ID_caso
export const getFilesByCaso = async (req, res) => {
  try {
    const { ID_caso } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM archivo WHERE ID_caso = ?',
      [ID_caso]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los archivos:', error);
    res.status(500).json({ error: 'Error al obtener los archivos.' });
  }
};

// Función para descargar un archivo por ID_archivo
export const downloadFile = async (req, res) => {
  try {
    const { ID_archivo } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM archivo WHERE ID_archivo = ?',
      [ID_archivo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado.' });
    }

    const archivo = rows[0];
    const filePath = path.join(process.cwd(), 'uploads', 'files', archivo.ruta_archivo);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor.' });
    }

    res.download(filePath, archivo.ruta_archivo);
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    res.status(500).json({ error: 'Error al descargar el archivo.' });
  }
};
