import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity, Animated, Platform, Alert, Switch, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ExcelJS from 'exceljs';
import { Picker } from '@react-native-picker/picker';

import dataJson from '../elementos.json';

const calculateTotal = (unidad, largo, ancho, altura, medida) => {
  let total = 0;

  if (medida === 'M2') {
    total = unidad * largo * ancho;
  } else if (medida === 'ML') {
    total = (ancho * 2) + (largo * 2);
  } else if (medida === 'M2.') {
    total = (ancho * altura * 2) + (largo * altura * 2);
  } else {
    total = unidad;
  }

  return Math.round(total * 10) / 10; // Con un decimal
};

const formatCurrency = (value) => {
  return Math.round(value); // Redondear a números enteros
};

const generateRows = (data, realCounts, measurements, startIndex) => {
  const rows = [];
  let rowIndex = startIndex;

  for (const category in data) {
    for (const section in data[category]) {
      let sectionRows = [[section.toUpperCase(), "", "", "", "", "", "", "", ""]];
      let sectionStartIndex = rowIndex + 1;
      rowIndex++;

      let sectionValid = false;

      for (const item in data[category][section]) {
        const { unidad = "", precio = 0, medida = "" } = data[category][section][item] || {};
        const realCount = realCounts[`${category}.${section}.${item}.unidad`] || "0";
        const percentage = realCounts[`${category}.${section}.${item}.percentage`] || "100";
        const largo = measurements.length || 1;
        const ancho = measurements.width || 1;
        const altura = measurements.height || 1;

        let precioUnitario = parseFloat(precio);

        if (item.toLowerCase() === "deteccion de fuga de agua") {
          precioUnitario = parseFloat(realCounts[`${category}.${section}.${item}.precioManual`] || 0);
        }

        let total;
        if (item.toLowerCase() === "análisis y diagnóstico circuito eléctrico") {
          const cantidadPuntos = parseFloat(realCounts[`${category}.${section}.${item}.cantidadPuntos`] || 0);
          total = cantidadPuntos;
        } else {
          total = calculateTotal(realCount, largo, ancho, altura, medida);
          total = total * (parseFloat(percentage) / 100); // Aplicar descuento
        }

        if (realCount !== "0" && realCount !== "") {
          sectionValid = true;
          const discountedTotal = total;
          const totalPrice = discountedTotal * precioUnitario;
          sectionRows.push([
            "     " + item.toUpperCase(),
            "", "", "", medida, discountedTotal.toFixed(1), precioUnitario.toFixed(0),
            formatCurrency(totalPrice),
            ""
          ]);
          rowIndex++;
        }
      }

      if (sectionValid) {
        rows.push(...sectionRows);
        rowIndex++;
      } else {
        rowIndex -= sectionRows.length;
      }
    }
  }

  return { rows, rowIndex };
};

export default function App() {
  const [sections, setSections] = useState([{
    name: '',
    realCounts: {},
    discountRates: {},
    tempData: {},
    confirmationMessage: '',
    selectedCategories: [{ category: 'Cielo', subcategory: 'Seleccione subcategoría' }],
    measurements: { length: '', width: '', height: '' }
  }]);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    catastroDia: '',
    catastroMes: '',
    catastroAno: '',
  });
  const [showMessage, setShowMessage] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (showMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start(() => setShowMessage(false));
        }, 2000);
      });
    }
  }, [showMessage]);

  const handleInputChange = (key, value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts[key] = value;
    setSections(newSections);
  };

  const handlePercentageChange = (key, value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts[`${key}.percentage`] = value;
    setSections(newSections);
  };

  const handleMeasurementChange = (key, value, sectionIndex) => {
    if (!isNaN(value)) {
      const newSections = [...sections];
      newSections[sectionIndex].measurements[key] = value;
      setSections(newSections);
    }
  };

  const handleFormChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value.toUpperCase(),
    });
  };

  const resetInputs = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts = {};
    newSections[sectionIndex].discountRates = {};
    newSections[sectionIndex].measurements = { length: '', width: '', height: '' };
    setSections(newSections);
  };

  const sendSectionData = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].tempData = {
      ...newSections[sectionIndex].realCounts,
      measurements: { ...newSections[sectionIndex].measurements }
    };
    newSections[sectionIndex].confirmationMessage = `Datos enviados: ${newSections[sectionIndex].selectedCategories.map(sc => sc.subcategory).join(', ')}`;
    setSections(newSections);
  };

  const handleCategoryChange = (itemValue, subcategoryIndex, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories[subcategoryIndex].category = itemValue;
    newSections[sectionIndex].selectedCategories[subcategoryIndex].subcategory = 'Seleccione subcategoría';
    newSections[sectionIndex].confirmationMessage = '';
    setSections(newSections);
  };

  const handleSubcategoryChange = (itemValue, subcategoryIndex, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories[subcategoryIndex].subcategory = itemValue;
    newSections[sectionIndex].confirmationMessage = '';
    setSections(newSections);
  };

  const handleSectorNameChange = (text, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].name = text.toUpperCase();
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, {
      name: '',
      realCounts: {},
      discountRates: {},
      tempData: {},
      confirmationMessage: '',
      selectedCategories: [{ category: 'Cielo', subcategory: 'Seleccione subcategoría' }],
      measurements: { length: '', width: '', height: '' }
    }]);
    setShowMessage(true);
  };

  const confirmDeleteSection = (sectionIndex) => {
    setSectionToDelete(sectionIndex);
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta sección?",
      [
        { text: "Cancelar", onPress: () => setSectionToDelete(null), style: "cancel" },
        { text: "Eliminar", onPress: () => deleteSection(sectionIndex) }
      ]
    );
  };

  const deleteSection = (sectionIndex) => {
    const newSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(newSections);
    setSectionToDelete(null);
  };

  const confirmDeleteSubcategory = (sectionIndex, subcategoryIndex) => {
    setSubcategoryToDelete({ sectionIndex, subcategoryIndex });
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta subcategoría?",
      [
        { text: "Cancelar", onPress: () => setSubcategoryToDelete(null), style: "cancel" },
        { text: "Eliminar", onPress: () => deleteSubcategory(sectionIndex, subcategoryIndex) }
      ]
    );
  };

  const deleteSubcategory = (sectionIndex, subcategoryIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories = newSections[sectionIndex].selectedCategories.filter((_, index) => index !== subcategoryIndex);
    setSections(newSections);
    setSubcategoryToDelete(null);
  };

  const addSubcategory = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories.push({ category: 'Cielo', subcategory: 'Seleccione subcategoría' });
    setSections(newSections);
  };

  const generateExcel = async () => {
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

      let lastSectorRowIndex;

      sections.forEach((section, index) => {
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
                applyCurrencyFormat(cell);
              }
              if (colNumber === 7) {
                cell.numFmt = '#,##0';
              }
            }
          });
        });

        lastSectorRowIndex = rowIndex;

        worksheet.addRow([]);
        startIndex = rowIndex + 1;
      });

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

      const generalStartIndex = generalRowRef.number;
      const generalData = [
        ["     Traslado de Materiales a Obra", "GL", 1, 60000, 60000],
        ["     Traslado de Personal a Obra", "GL", 1, 50000, 50000],
        ["     Retiro de Escombro y Traslado a Botadero", "GL", 1, 60000, 60000],
        ["     Acomodo de Mobiliario", "GL", 1, 55000, 55000],
        ["     Protección de Áreas de Trabajo", "GL", 1, 40000, 40000],
        ["     Aseo Diario y Entrega Final", "GL", 1, 45000, 45000],
      ];

      generalData.forEach((item, index) => {
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

      const totalGeneralFormula = `SUM(H${generalStartIndex + 1}:H${generalStartIndex + generalData.length})`;

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

      const costoDirectoDeObraFormula = `SUM(H13:H${generalStartIndex + generalData.length})`;
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

      await Sharing.shareAsync(uri);

      resetApp();

    } catch (error) {
      console.error("Error al generar o subir el archivo Excel: ", error);
    }
  };

  const resetApp = () => {
    setFormData({
      nombre: '',
      rut: '',
      direccion: '',
      comuna: '',
      catastroDia: '',
      catastroMes: '',
      catastroAno: '',
    });

    setSections([{
      name: '',
      realCounts: {},
      discountRates: {},
      tempData: {},
      confirmationMessage: '',
      selectedCategories: [{ category: 'Cielo', subcategory: 'Seleccione subcategoría' }],
      measurements: { length: '', width: '', height: '' }
    }]);
  };

  const handleConfirm = async () => {
    sections.forEach((_, sectionIndex) => sendSectionData(sectionIndex));
    await generateExcel();
    setShowConfirmation(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={formData.nombre}
          onChangeText={(text) => handleFormChange('nombre', text.toUpperCase())}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="RUT"
          value={formData.rut}
          onChangeText={(text) => handleFormChange('rut', text.toUpperCase())}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={formData.direccion}
          onChangeText={(text) => handleFormChange('direccion', text.toUpperCase())}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Comuna"
          value={formData.comuna}
          onChangeText={(text) => handleFormChange('comuna', text.toUpperCase())}
          autoCapitalize="characters"
        />
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Día"
            value={formData.catastroDia}
            onChangeText={(text) => handleFormChange('catastroDia', Math.min(parseInt(text.replace(/[^0-9]/g, ''), 10), 31).toString().slice(0, 2))}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Mes"
            value={formData.catastroMes}
            onChangeText={(text) => handleFormChange('catastroMes', Math.min(parseInt(text.replace(/[^0-9]/g, ''), 10), 12).toString().slice(0, 2))}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Año"
            value={formData.catastroAno}
            onChangeText={(text) => handleFormChange('catastroAno', text.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="numeric"
          />
        </View>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SECTOR {sectionIndex + 1}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteSection(sectionIndex)}>
                <Text style={styles.deleteButtonText}>Eliminar Sección</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.sectorInput}
              placeholder="Nombre del Sector"
              value={section.name}
              onChangeText={(text) => handleSectorNameChange(text.toUpperCase(), sectionIndex)}
              autoCapitalize="characters"
            />
            <View style={styles.measurementsContainer}>
              <TextInput
                style={styles.measurementInput}
                placeholder="Largo"
                value={section.measurements.length}
                onChangeText={(text) => handleMeasurementChange('length', text, sectionIndex)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.measurementInput}
                placeholder="Ancho"
                value={section.measurements.width}
                onChangeText={(text) => handleMeasurementChange('width', text, sectionIndex)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.measurementInput}
                placeholder="Alto"
                value={section.measurements.height}
                onChangeText={(text) => handleMeasurementChange('height', text, sectionIndex)}
                keyboardType="numeric"
              />
            </View>
            {section.selectedCategories.map((selectedCategory, subcategoryIndex) => (
              <View key={subcategoryIndex}>
                <Picker
                  selectedValue={selectedCategory.category}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleCategoryChange(itemValue, subcategoryIndex, sectionIndex)}
                >
                  <Picker.Item label="Cielo" value="Cielo" />
                  <Picker.Item label="Muro" value="Muro" />
                  <Picker.Item label="Piso" value="Piso" />
                  <Picker.Item label="Otros" value="Otros" />
                </Picker>
                <Picker
                  selectedValue={selectedCategory.subcategory}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleSubcategoryChange(itemValue, subcategoryIndex, sectionIndex)}
                >
                  <Picker.Item label="Seleccione subcategoría" value="Seleccione subcategoría" />
                  {selectedCategory.category !== 'Seleccione categoría' && dataJson[selectedCategory.category] && Object.keys(dataJson[selectedCategory.category]).map((subcategoryKey) => (
                    <Picker.Item key={subcategoryKey} label={subcategoryKey.toUpperCase()} value={subcategoryKey} />
                  ))}
                </Picker>
                <ScrollView style={styles.itemScrollView}>
                  <View>
                    <Text style={styles.subcategoryHeader}>{selectedCategory.subcategory.toUpperCase()}</Text>
                    {selectedCategory.category !== 'Seleccione categoría' && selectedCategory.subcategory !== 'Seleccione subcategoría' && dataJson[selectedCategory.category] && dataJson[selectedCategory.category][selectedCategory.subcategory] && Object.keys(dataJson[selectedCategory.category][selectedCategory.subcategory]).map((item, subIndex) => (
                      <View key={subIndex} style={styles.itemContainer}>
                        <Text style={styles.itemHeader}>  {item.toUpperCase()}</Text>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}></Text>
                          <Switch
                            value={section.realCounts[`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.unidad`] === "1"}
                            onValueChange={(value) => handleInputChange(`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.unidad`, value ? "1" : "0", sectionIndex)}
                          />
                          {item === "deteccion de fuga de agua" || item === "Análisis Y Diagnóstico Circuito Eléctrico" ? (
                            <View>
                              <Text> {dataJson[selectedCategory.category][selectedCategory.subcategory][item]?.medida || ''}</Text>

                              {item === "deteccion de fuga de agua" ? (
                                <TextInput
                                  style={styles.input}
                                  placeholder="Ingrese precio"
                                  keyboardType="numeric"
                                  value={section.realCounts[`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.precioManual`] || ''}
                                  onChangeText={(text) => handleInputChange(`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.precioManual`, text, sectionIndex)}
                                />
                              ) : (
                                <TextInput
                                  style={styles.input}
                                  placeholder="Ingrese cantidad de puntos eléctricos"
                                  keyboardType="numeric"
                                  value={section.realCounts[`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.cantidadPuntos`] || ''}
                                  onChangeText={(text) => handleInputChange(`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.cantidadPuntos`, text, sectionIndex)}
                                />
                              )}
                            </View>
                          ) : (
                            <Picker
                              selectedValue={section.realCounts[`${selectedCategory.category}.${selectedCategory.subcategory}.${item}.percentage`] || "100"}
                              style={styles.picker}
                              onValueChange={(itemValue) => handlePercentageChange(`${selectedCategory.category}.${selectedCategory.subcategory}.${item}`, itemValue, sectionIndex)}
                            >
                              <Picker.Item label="100%" value="100" />
                              <Picker.Item label="90%" value="90" />
                              <Picker.Item label="80%" value="80" />
                              <Picker.Item label="70%" value="70" />
                              <Picker.Item label="60%" value="60" />
                              <Picker.Item label="50%" value="50" />
                              <Picker.Item label="40%" value="40" />
                              <Picker.Item label="30%" value="30" />
                              <Picker.Item label="20%" value="20" />
                              <Picker.Item label="10%" value="10" />
                            </Picker>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                {subcategoryIndex > 0 && (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteSubcategory(sectionIndex, subcategoryIndex)}>
                    <Text style={styles.deleteButtonText}>Eliminar Subcategoría</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addSubcategoryButton} onPress={() => addSubcategory(sectionIndex)}>
              <Text style={styles.addSubcategoryButtonText}>Añadir Subcategoría</Text>
            </TouchableOpacity>
            {section.confirmationMessage ? (
              <Text style={styles.confirmationMessage}>{section.confirmationMessage}</Text>
            ) : null}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addSection}>
          <Text style={styles.addButtonText}>Agregar Sección</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateButton} onPress={() => setShowConfirmation(true)}>
          <Text style={styles.generateButtonText}>Generar Excel</Text>
        </TouchableOpacity>
      </ScrollView>
      {showMessage && (
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.messageText}>Sección agregada</Text>
        </Animated.View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmación</Text>
            <Text style={styles.modalText}>Resumen de Sectores y Subsectores:</Text>
            <ScrollView style={styles.scrollViewSummary}>
              {sections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{`Sector ${sectionIndex + 1}: ${section.name}`}</Text>
                  {section.selectedCategories.map((selectedCategory, subcategoryIndex) => (
                    <Text key={subcategoryIndex} style={styles.modalSubcategoryText}>
                      {`- ${selectedCategory.category}: ${selectedCategory.subcategory}`}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleConfirm}
              >
                <Text style={styles.modalButtonText}>Confirmar y Generar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    backgroundColor: '#f0f4f7',
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  sectorInput: {
    width: '100%',
    height: 40,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  scrollViewSummary: {
    maxHeight: 200,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 10,
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  measurementInput: {
    flex: 1,
    height: 40,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    marginRight: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  subcategoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2980b9',
  },
  itemContainer: {
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addSubcategoryButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addSubcategoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubcategoryText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonCancel: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  modalButtonConfirm: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
