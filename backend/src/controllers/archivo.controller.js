import multer from 'multer';
import ExcelJS from 'exceljs';
import { pool } from '../config/db.js';
import fs from 'fs';

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).single('file');

// Controlador para la subida de archivo Excel
export const uploadExcel = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: 'Error de multer' });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }

      const { ID_caso, tipo_siniestro, descripcion_siniestro, contratista, material, estado, sector, sub_sector } = req.body;
      const filePath = req.file.path;
      const tipo_archivo = req.file.mimetype;
      const nombre_archivo = req.file.filename;

      // Verificar si el archivo existe y no está vacío
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          return res.status(400).json({ message: 'El archivo está vacío o corrupto' });
        }
      } else {
        return res.status(400).json({ message: 'No se encontró el archivo subido' });
      }

      try {
        // Procesar el archivo Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // Crear una nueva hoja con los datos seleccionados del formulario
        const worksheet = workbook.addWorksheet('Detalles del Caso');
        
        // Añadir encabezados de columna
        worksheet.columns = [
          { header: 'Tipo de Siniestro', key: 'tipo_siniestro', width: 30 },
          { header: 'Descripción del Siniestro', key: 'descripcion_siniestro', width: 40 },
          { header: 'Contratista', key: 'contratista', width: 25 },
          { header: 'Material', key: 'material', width: 25 },
          { header: 'Estado', key: 'estado', width: 20 },
          { header: 'Sector', key: 'sector', width: 25 },
          { header: 'Subsector', key: 'sub_sector', width: 25 }
        ];

        // Añadir los datos del formulario a las filas
        worksheet.addRow({
          tipo_siniestro,
          descripcion_siniestro,
          contratista,
          material,
          estado,
          sector,
          sub_sector
        });

        // Guardar el archivo Excel actualizado
        await workbook.xlsx.writeFile(filePath);

      } catch (error) {
        return res.status(400).json({ error: 'Error al procesar el archivo Excel. Puede estar corrupto.' });
      }

      // Guardar información del archivo en la base de datos
      const connection = await pool.getConnection();
      await connection.query(
        'INSERT INTO archivo (ID_caso, tipo_de_archivo, ruta_archivo) VALUES (?, ?, ?)',
        [ID_caso, tipo_archivo, nombre_archivo]
      );
      connection.release();

      res.json({ message: 'Archivo subido y guardado en la base de datos correctamente' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en la subida del archivo' });
  }
};
