import multer from 'multer';
import ExcelJS from 'exceljs';
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Define dónde se almacenarán los archivos subidos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo subido
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño máximo del archivo a 10MB
}).single('excelFile');

// Controlador para la subida de archivo Excel
export const uploadExcel = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: 'Error de multer: ' + err.message });
      } else if (err) {
        console.error('Error de subida:', err);
        return res.status(500).json({ error: err.message });
      }

      // Verificar si se recibió un archivo
      if (!req.file) {
        console.error('No se ha subido ningún archivo');
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      const {
        nombre,
        rut,
        direccion,
        tipo_siniestro,
        descripcion_siniestro,
        ID_contratista,
        sectores, // Array de sectores
        sub_sectores, // Array de subsectores
        trabajosSeleccionados // Array de trabajos seleccionados
      } = req.body;

      const filePath = req.file.path;
      const tipo_archivo = req.file.mimetype;
      const nombre_archivo = req.file.filename;

      // Verificar si el archivo existe y no está vacío
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        console.error('El archivo está vacío o corrupto:', filePath);
        return res.status(400).json({ message: 'El archivo está vacío o corrupto' });
      }

      console.log(`Archivo subido correctamente en: ${filePath}`);

      try {
        // Procesar el archivo Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // Verificar que el workbook tiene al menos una hoja
        if (workbook.worksheets.length === 0) {
          throw new Error('El archivo Excel no contiene hojas');
        }

        // Crear una nueva hoja con los datos seleccionados del formulario
        const worksheet = workbook.addWorksheet('Detalles del Caso');

        // Definir encabezados con estilos
        worksheet.columns = [
          { header: 'Nombre', key: 'nombre', width: 25 },
          { header: 'RUT', key: 'rut', width: 15 },
          { header: 'Dirección', key: 'direccion', width: 30 },
          { header: 'Tipo de Siniestro', key: 'tipo_siniestro', width: 20 },
          { header: 'Descripción del Siniestro', key: 'descripcion_siniestro', width: 40 },
          { header: 'Contratista', key: 'contratista', width: 20 },
          { header: 'Sector', key: 'sector', width: 20 },
          { header: 'SubSector', key: 'sub_sector', width: 20 },
          { header: 'Trabajos Seleccionados', key: 'trabajos', width: 30 },
          { header: 'Costo', key: 'costo', width: 15 },
        ];

        // Aplicar estilos a los encabezados
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' } // Azul
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Manejar trabajosSeleccionados de manera segura
        let trabajosArray = [];
        try {
          trabajosArray = JSON.parse(trabajosSeleccionados);
          if (!Array.isArray(trabajosArray)) {
            throw new Error('trabajosSeleccionados no es un array');
          }
        } catch (parseError) {
          console.error('Error al parsear trabajosSeleccionados:', parseError);
          return res.status(400).json({ error: 'trabajosSeleccionados no es un array válido' });
        }

        // Variable para acumular el costo total
        let totalCosto = 0;

        // Añadir los datos del formulario a las filas con formato
        trabajosArray.forEach(trabajo => {
          const fila = worksheet.addRow({
            nombre,
            rut,
            direccion,
            tipo_siniestro,
            descripcion_siniestro,
            contratista: ID_contratista,
            sector: trabajo.sector || sectores.join(', '), // Manejar sectores
            sub_sector: trabajo.sub_sector || sub_sectores.join(', '), // Manejar subsectores
            trabajos: trabajo.nombre_trabajo,
            costo: parseFloat(trabajo.costo_trabajo)
          });

          // Formatear la fila de datos
          fila.eachCell((cell, colNumber) => {
            if (colNumber === 10) { // Columna 'Costo'
              cell.numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.font = { size: 11 };
          });

          // Acumular el costo
          totalCosto += parseFloat(trabajo.costo_trabajo);
        });

        // Añadir una fila de total
        const totalRow = worksheet.addRow({
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
        });

        // Formatear la fila de total
        totalRow.eachCell((cell, colNumber) => {
          if (colNumber === 9) { // Columna 'Trabajos Seleccionados'
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
          if (colNumber === 10) { // Columna 'Costo'
            cell.numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFE699' } // Amarillo claro
            };
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.border = {
              top: { style: 'double' },
              left: { style: 'thin' },
              bottom: { style: 'double' },
              right: { style: 'thin' }
            };
          } else {
            cell.border = {
              top: { style: 'double' },
              left: { style: 'thin' },
              bottom: { style: 'double' },
              right: { style: 'thin' }
            };
          }
        });

        // Guardar el archivo Excel actualizado
        const processedFileName = `processed-${nombre_archivo}`;
        const processedFilePath = path.join('src/uploads/', processedFileName);

        await workbook.xlsx.writeFile(processedFilePath);

        console.log(`Archivo Excel actualizado y guardado en: ${processedFilePath}`);
      } catch (error) {
        console.error(`Error al procesar el archivo Excel: ${error.message}`);
        return res.status(400).json({ error: 'Error al procesar el archivo Excel. Puede estar corrupto.' });
      }

      // Guardar información del archivo en la base de datos
      try {
        const connection = await pool.getConnection();

        // Insertar en la tabla 'caso'
        const [casoResult] = await connection.query(
          'INSERT INTO caso (tipo_siniestro, descripcion_siniestro, ID_contratista) VALUES (?, ?, ?)',
          [tipo_siniestro, descripcion_siniestro, ID_contratista]
        );

        const ID_caso = casoResult.insertId; // Obtener el ID del caso creado

        // Insertar en la tabla 'archivo'
        const [archivoResult] = await connection.query(
          'INSERT INTO archivo (ID_caso, tipo_de_archivo, ruta_archivo) VALUES (?, ?, ?)',
          [ID_caso, tipo_archivo, `processed-${nombre_archivo}`] // Guardar el nombre del archivo procesado
        );

        connection.release();

        console.log('Archivo guardado correctamente en la base de datos');
        res.json({ message: 'Archivo subido y guardado en la base de datos correctamente', ID_archivo: archivoResult.insertId });
      } catch (dbError) {
        console.error('Error al interactuar con la base de datos:', dbError);
        return res.status(500).json({ error: 'Error al guardar en la base de datos' });
      }
    });
  } catch (err) {
    console.error('Error general:', err);
    return res.status(500).json({ error: 'Error en la subida del archivo' });
  }
};
