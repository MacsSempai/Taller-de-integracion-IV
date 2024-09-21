import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ExcelJS from 'exceljs';

export const generateExcel = async (sections, formData, dataJson, resetApp) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Project Data');

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();

    const formattedCatastroDate = `${formData.catastroDia.padStart(2, '0')}/${formData.catastroMes.padStart(2, '0')}/${formData.catastroAno}`;

    const header = [
      ["C&C ", "", "", "", "", "", "", "", ""],
      ["Ingeniería y Obras Menores", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", ""],
      ["PROYECTO", "", "", "", "", "", "", "", ""],
      ["REPARACIÓN DAÑOS EN VIVIENDA", "", "", "", "", "", "", "", ""],
      ["NOMBRE: " + formData.nombre, "", "", "", "", "", "", ""],
      ["RUT: " + formData.rut, "", "", "", "", "", "", ""],
      ["FECHA SINIESTRO: " + formattedCatastroDate, "", "", "", "", "", ""],
      ["DIRECCION: " + formData.direccion, "", "", "", "", "", ""],
      ["COMUNA: " + formData.comuna, "", "", "", "", "", ""],
      ["DETALLE  DE  PARTIDAS   ITEMIZADAS", "", "", "", "", "", "DETERMINACIÓN DE VALORES"],
      ["TIPO DE PARTIDA (recintos, medida y detalles)", "", "", "", "Unidad", "Cant. Real", "Prec. Unit.", "Prec. Total", "Obs"],
      ["DESCRIPCIÓN", "", "", "", "", "", "", "", ""],
    ];

    header.forEach((row, rowIndex) => {
      const rowRef = worksheet.addRow(row);
      rowRef.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 9) {
          cell.border = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
          };
          if (rowIndex < 2 || rowIndex === 3 || rowIndex === 4) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '002060' },
            };
            cell.font = {
              bold: true,
              color: { argb: '00FF00' },
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF' },
            };
            cell.font = {
              bold: true,
              color: { argb: '000000' },
            };
          }
        }
      });
    });

    worksheet.mergeCells('A1:I1');
    worksheet.mergeCells('A2:I2');
    worksheet.mergeCells('A3:I3');
    worksheet.mergeCells('A4:I4');
    worksheet.mergeCells('A5:I5');
    worksheet.mergeCells('A6:G6');
    worksheet.mergeCells('A7:G7');
    worksheet.mergeCells('A8:G8');
    worksheet.mergeCells('A9:G9');
    worksheet.mergeCells('A10:G10');
    worksheet.mergeCells('A11:F11');
    worksheet.mergeCells('A12:D12');
    worksheet.mergeCells('H6:I6');
    worksheet.mergeCells('H7:I7');
    worksheet.mergeCells('H8:I8');
    worksheet.mergeCells('H9:I9');
    worksheet.mergeCells('H10:I10');

    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getColumn(1).width = 35;
    worksheet.getColumn(2).width = 5;
    worksheet.getColumn(3).width = 5;
    worksheet.getColumn(4).width = 5;
    worksheet.getColumn(5).width = 5;
    worksheet.getColumn(6).width = 5;
    worksheet.getColumn(7).width = 10;
    worksheet.getColumn(8).width = 10;
    worksheet.getColumn(9).width = 10;

    worksheet.getCell('H6').value = 'Fecha: ';
    worksheet.getCell('I6').value = formattedDate;
    worksheet.getCell('H7').value = 'Cotización:';
    worksheet.getCell('I7').value = '';

    const cellsWithBorders = ['H6', 'I6', 'H7', 'I7', 'H8', 'I8', 'H9', 'I9', 'H10', 'I10'];
    cellsWithBorders.forEach((cell) => {
      worksheet.getCell(cell).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });

    const applyCurrencyFormat = (cell) => {
      cell.numFmt = '"$"#,##0';
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    };

    let startIndex = header.length;

    sections.forEach((section) => {
      const measurements = section.tempData.measurements || section.measurements;

      const sectionHeader = [
        [`SECTOR: ${section.name || "SECTOR"}`, ` ${measurements.length || ""}`, "x", ` ${measurements.width || ""}`, "x", ` ${measurements.height || ""}`, "", "", ""]
      ];

      const { rows, rowIndex } = generateRows(dataJson, section.tempData, measurements, startIndex + sectionHeader.length);

      const allRows = [...sectionHeader, ...rows];
      allRows.forEach((row, idx) => {
        const rowRef = worksheet.addRow(row);
        rowRef.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= 9) {
            cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } }
            };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'E8F3D3' },
            };
            cell.font = {
              bold: true,
              color: { argb: '000000' },
            };

            if (colNumber === 8) {
              applyCurrencyFormat(cell); // Formato de moneda en "Prec. Total"
            }
            if (colNumber === 7) {
              cell.numFmt = '#,##0'; // Formato numérico sin decimales en "Prec. Unit."
            }
          }
        });
      });

      worksheet.addRow([]);
      startIndex = rowIndex + 1;
    });

    // Añadir la fila de "GENERAL"
    const generalRow = ["GENERAL", "", "", "", "", "", "", "", ""];
    const generalRowRef = worksheet.addRow(generalRow);
    generalRowRef.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 9) {
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '90EE90' },
        };
        cell.font = {
          bold: true,
          color: { argb: '000000' },
        };
      }
    });

    const generalData = [
      ["     Traslado de Materiales a Obra", "GL", 1, 60000, 60000],
      ["     Traslado de Personal a Obra", "GL", 1, 50000, 50000],
      ["     Retiro de Escombro y Traslado a Botadero", "GL", 1, 60000, 60000],
      ["     Acomodo de Mobiliario", "GL", 1, 55000, 55000],
      ["     Protección de Áreas de Trabajo", "GL", 1, 40000, 40000],
      ["     Aseo Diario y Entrega Final", "GL", 1, 45000, 45000],
    ];

    generalData.forEach((item) => {
      const row = [
        item[0],
        "", "", "", item[1], item[2], item[3],
        item[4],
        "",
      ];
      const rowRef = worksheet.addRow(row);
      rowRef.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 9) {
          cell.border = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
          };
          if (colNumber === 8) {
            applyCurrencyFormat(cell);
          }
        }
      });
    });

    worksheet.addRow([]);

    const totalGeneralFormula = `SUM(H${generalRowRef.number + 1}:H${generalRowRef.number + generalData.length})`;

    const totalGeneralRow = worksheet.addRow(["Total General", "", "", "", "", "", "", { formula: totalGeneralFormula }, ""]);
    worksheet.mergeCells(`A${totalGeneralRow.number}:G${totalGeneralRow.number}`);
    worksheet.mergeCells(`H${totalGeneralRow.number}:I${totalGeneralRow.number}`);
    totalGeneralRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    totalGeneralRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    totalGeneralRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const costoDirectoDeObraFormula = `SUM(H13:H${generalRowRef.number + generalData.length})`;
    const costoDirectoDeObraRow = worksheet.addRow(["COSTO DIRECTO DE OBRA", "", "", "", "", "", "", { formula: costoDirectoDeObraFormula }, ""]);
    worksheet.mergeCells(`A${costoDirectoDeObraRow.number}:G${costoDirectoDeObraRow.number}`);
    worksheet.mergeCells(`H${costoDirectoDeObraRow.number}:I${costoDirectoDeObraRow.number}`);
    costoDirectoDeObraRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    costoDirectoDeObraRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    costoDirectoDeObraRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const gastosGeneralesFormula = `H${costoDirectoDeObraRow.number}*0.25`;
    const gastosGeneralesRow = worksheet.addRow(["GASTOS GENERALES Y UTILIDADES 25%", "", "", "", "", "", "", { formula: gastosGeneralesFormula }, ""]);
    worksheet.mergeCells(`A${gastosGeneralesRow.number}:G${gastosGeneralesRow.number}`);
    worksheet.mergeCells(`H${gastosGeneralesRow.number}:I${gastosGeneralesRow.number}`);
    gastosGeneralesRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    gastosGeneralesRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    gastosGeneralesRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const costoNetoFormula = `H${costoDirectoDeObraRow.number}+H${gastosGeneralesRow.number}`;
    const costoNetoRow = worksheet.addRow(["COSTO NETO", "", "", "", "", "", "", { formula: costoNetoFormula }, ""]);
    worksheet.mergeCells(`A${costoNetoRow.number}:G${costoNetoRow.number}`);
    worksheet.mergeCells(`H${costoNetoRow.number}:I${costoNetoRow.number}`);
    costoNetoRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    costoNetoRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    costoNetoRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const ivaFormula = `H${costoNetoRow.number}*0.19`;
    const ivaRow = worksheet.addRow(["IVA 19%", "", "", "", "", "", "", { formula: ivaFormula }, ""]);
    worksheet.mergeCells(`A${ivaRow.number}:G${ivaRow.number}`);
    worksheet.mergeCells(`H${ivaRow.number}:I${ivaRow.number}`);
    ivaRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    ivaRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    ivaRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const costoTotalFormula = `H${costoNetoRow.number}+H${ivaRow.number}`;
    const costoTotalRow = worksheet.addRow(["COSTO TOTAL EN $", "", "", "", "", "", "", { formula: costoTotalFormula }, ""]);
    worksheet.mergeCells(`A${costoTotalRow.number}:G${costoTotalRow.number}`);
    worksheet.mergeCells(`H${costoTotalRow.number}:I${costoTotalRow.number}`);
    costoTotalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    costoTotalRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    costoTotalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.font = {
        name: 'Arial Narrow',
        bold: true,
        color: { argb: '000000' }
      };
      if (colNumber === 8) {
        applyCurrencyFormat(cell);
      }
    });

    const fileName = `${formData.nombre.replace(/ /g, '_')}_${formData.rut}.xlsx`;
    const uri = FileSystem.cacheDirectory + fileName;

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const currentFont = cell.font || {};
        cell.font = {
          ...currentFont,
          name: 'Arial Narrow',
          bold: true,
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    await FileSystem.writeAsStringAsync(uri, buffer.toString('base64'), {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Compartir el archivo Excel
    await Sharing.shareAsync(uri);

    // Reiniciar la aplicación después de generar y compartir el archivo Excel
    resetApp();

  } catch (error) {
    console.error("Error al generar el archivo Excel: ", error);
  }
};
