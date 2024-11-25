import multer from 'multer';
import ExcelJS from 'exceljs';
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('excelFile');

// Controlador para subir un archivo Excel
export const uploadExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(500).json({ error: `Error de subida: ${err.message}` });
    } else if (err) {
      console.error('Error general en subida:', err);
      return res.status(500).json({ error: 'Error general en la subida del archivo' });
    }

    if (!req.file) {
      console.error('Archivo no proporcionado');
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const filePath = req.file.path;
    const { mimetype: tipo_archivo, filename: nombre_archivo } = req.file;
    const {
      nombre,
      rut,
      direccion,
      tipo_siniestro,
      descripcion_siniestro,
      ID_contratista,
      sectores,
      sub_sectores,
      trabajosSeleccionados
    } = req.body;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      console.error('Archivo vacío o corrupto:', filePath);
      return res.status(400).json({ error: 'El archivo está vacío o es inválido' });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      if (workbook.worksheets.length === 0) {
        throw new Error('El archivo Excel no tiene hojas válidas');
      }

      const worksheet = workbook.addWorksheet('Detalles del Caso');
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'RUT', key: 'rut', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 30 },
        { header: 'Tipo de Siniestro', key: 'tipo_siniestro', width: 20 },
        { header: 'Descripción', key: 'descripcion_siniestro', width: 40 },
        { header: 'Contratista', key: 'contratista', width: 20 },
        { header: 'Sector', key: 'sector', width: 20 },
        { header: 'Subsector', key: 'sub_sector', width: 20 },
        { header: 'Trabajo', key: 'trabajos', width: 30 },
        { header: 'Costo', key: 'costo', width: 15 }
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      const trabajosArray = Array.isArray(JSON.parse(trabajosSeleccionados))
        ? JSON.parse(trabajosSeleccionados)
        : [];

      let totalCosto = 0;
      trabajosArray.forEach((trabajo) => {
        const fila = worksheet.addRow({
          nombre,
          rut,
          direccion,
          tipo_siniestro,
          descripcion_siniestro,
          contratista: ID_contratista,
          sector: trabajo.sector || sectores.join(', '),
          sub_sector: trabajo.sub_sector || sub_sectores.join(', '),
          trabajos: trabajo.nombre_trabajo,
          costo: parseFloat(trabajo.costo_trabajo)
        });

        fila.getCell('costo').numFmt = '"$"#,##0.00';
        totalCosto += parseFloat(trabajo.costo_trabajo);
      });

      worksheet.addRow({
        nombre: '',
        rut: '',
        direccion: '',
        tipo_siniestro: '',
        descripcion_siniestro: '',
        contratista: '',
        sector: '',
        sub_sector: '',
        trabajos: 'Total',
        costo: totalCosto
      }).getCell('costo').numFmt = '"$"#,##0.00';

      const processedFilePath = path.join('src/uploads/', `processed-${nombre_archivo}`);
      await workbook.xlsx.writeFile(processedFilePath);

      const connection = await pool.getConnection();
      const [casoResult] = await connection.query(
        'INSERT INTO caso (tipo_siniestro, descripcion_siniestro, ID_contratista) VALUES (?, ?, ?)',
        [tipo_siniestro, descripcion_siniestro, ID_contratista]
      );

      const ID_caso = casoResult.insertId;
      const [archivoResult] = await connection.query(
        'INSERT INTO archivo (ID_caso, tipo_archivo, ruta) VALUES (?, ?, ?)',
        [ID_caso, tipo_archivo, `processed-${nombre_archivo}`]
      );

      connection.release();

      res.json({ message: 'Archivo procesado y guardado', ID_archivo: archivoResult.insertId });
    } catch (error) {
      console.error('Error procesando el archivo:', error);
      res.status(500).json({ error: 'Error procesando el archivo' });
    }
  });
};

// Controlador para descargar un archivo
export const downloadArchive = async (req, res) => {
  const { ID_caso } = req.params; // Obtener el ID del caso desde los parámetros de la URL
  console.log('ID_caso:', ID_caso);

  try {
    const connection = await pool.getConnection();
    const [archivoResult] = await connection.query('SELECT ruta_archivo FROM archivo WHERE ID_caso = ?', [ID_caso]);
    connection.release();

    if (archivoResult.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const archivo = archivoResult[0];
    const filePath = path.join('src/uploads/', archivo.ruta_archivo);
    console.log('Descargando archivo:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.download(filePath);
  }
  catch (error) {
    console.error('Error al descargar el archivo:', error);
    res.status(500).json({ error: 'Error al descargar el archivo' });
  }
};
