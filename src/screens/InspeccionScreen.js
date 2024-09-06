


import React, { useState } from 'react';
import { View, Button, StyleSheet, ScrollView, TextInput, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ExcelJS from 'exceljs';
import { Picker } from '@react-native-picker/picker'; // Importa Picker desde @react-native-picker/picker

import dataJson from '../components/elementos.json'; // Importa el archivo JSON

const generateRows = (data, realCounts) => {
  const rows = [];
  let rowIndex = 15; // Inicia después del header

  for (const section in data) {
    let sectionRows = [[section.toUpperCase(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]];
    rowIndex++;
    
    let sectionValid = false;

    for (const item in data[section]) {
      const { unidad = "", precio = 0 } = data[section][item] || {};
      const realCount = realCounts[`${section}.${item}.unidad`] || "0";

      if (realCount !== "0" && realCount !== "") {
        sectionValid = true;
        sectionRows.push([
          "     " + item,
          "", "", "", "", unidad, realCount, precio.toString().replace('.', ','), 
          { formula: `G${rowIndex}*H${rowIndex}` }, 
          "0", 
          { formula: `I${rowIndex}-(I${rowIndex}*J${rowIndex}/100)` }, 
          "", "", "", "", "", "", "", "", "", "", "", "", ""
        ]);
        rowIndex++;
      }
    }

    if (sectionValid) {
      rows.push(...sectionRows);
    } else {
      rowIndex -= sectionRows.length;
    }
  }

  // Agregar la fila Total Partida
  const totalPartidaFormula = `SUM(K2:K${rowIndex - 1})`;
  rows.push(["Total Partida", "", "", "", "", "", "", "", "", "", "", { formula: totalPartidaFormula }, "", "", "", "", "", "", "", "", "", "", ""]);
  rowIndex++;

  rows.push(["GENERAL", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
  rowIndex++;
  const generalData = [
    ["     Traslado de Materiales a Obra", "GL", "1", "60000", "60000"],
    ["     Traslado de Personal a Obra", "GL", "1", "50000", "50000"],
    ["     Retiro de Escombro y Traslado a Botadero", "GL", "1", "60000", "60000"],
    ["     Acomodo de Mobiliario", "GL", "1", "55000", "55000"],
    ["     Protección de Áreas de Trabajo", "GL", "1", "40000", "40000"],
    ["     Aseo Diario y Entrega Final", "GL", "1", "45000", "45000"],
  ];

  generalData.forEach((item) => {
    rows.push([
      item[0],
      "", "", "", "", item[1], item[2], item[3].replace('.', ','), 
      { formula: `G${rowIndex}*H${rowIndex}` }, 
      "0", 
      { formula: `I${rowIndex}-(I${rowIndex}*J${rowIndex}/100)` }, 
      "", "", "", "", "", "", "", "", "", "", "", "", ""
    ]);
    rowIndex++;
  });

  const totalGeneralFormula = `SUM(K${rowIndex - generalData.length}:K${rowIndex - 1})`;
  rows.push(["Total General", "", "", "", "", "", "", "", "", "", "", { formula: totalGeneralFormula }, "", "", "", "", "", "", "", "", "", "", ""]);

  return rows;
};

export default function DetailsScreen({ navigation }) {
  const [sections, setSections] = useState([
    { name: '', realCounts: {}, tempData: {}, confirmationMessage: '', selectedSection: Object.keys(dataJson)[0] }
  ]);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    comuna: ''
  });

  const handleInputChange = (key, value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts[key] = value;
    setSections(newSections);
  };

  const handleFormChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const resetInputs = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts = {};
    setSections(newSections);
  };

  const sendSectionData = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].tempData = { ...newSections[sectionIndex].tempData, ...newSections[sectionIndex].realCounts };
    newSections[sectionIndex].confirmationMessage = `Datos enviados: ${newSections[sectionIndex].selectedSection}`;
    resetInputs(sectionIndex);
    setSections(newSections);
  };

  const handleSectionChange = (itemValue, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedSection = itemValue;
    newSections[sectionIndex].confirmationMessage = '';
    resetInputs(sectionIndex);
    setSections(newSections);
  };

  const handleSectorNameChange = (text, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].name = text;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { name: '', realCounts: {}, tempData: {}, confirmationMessage: '', selectedSection: Object.keys(dataJson)[0] }]);
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    sections.forEach((section, index) => {
      const worksheet = workbook.addWorksheet(section.name || `Sheet ${index + 1}`);
      const updatedHeader = [
        ["C&C ", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["Ingeniería y Obras Menores", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["PROYECTO", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["REPARACIÓN DAÑOS EN VIVIENDA", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["NOMBRE", formData.nombre, "", "", "", "", "", "", "", "Fecha: ", "", "", ""],
        ["RUT", formData.rut, "", "", "", "", "", "", "", "Cotización:", "", "", ""],
        ["DIRECCION", formData.direccion, "", "", "", "", "", "", "", "", "", "", ""],
        ["COMUNA", formData.comuna, "", "", "", "", "", "", "", "", "", "", ""],
        ["DETALLE  DE  PARTIDAS   ITEMIZADAS", "", "", "", "", "", "", "", "", "", "DETERMINACIÓN DE VALORES", "", ""],
        ["TIPO DE PARTIDA (recintos, medida y detalles)", "", "", "", "", "Unidad", "Cant. Real", "Prec. Unit.", "Prec. Total", "% Dcto.", "Total Determinado", "Obs", ""],
        ["DESCRIPCIÓN", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "LARGO", "", "ANCHO", "", "ALTO", "", "", "", "", "", "", ""],
        ["SECTOR", "1.00", "x", "2.00", "x", "3.00", "", "", "", "", "", "", ""]
      ];

      const rows = [...updatedHeader, ...generateRows(dataJson, section.tempData)];
      rows.forEach((row, rowIndex) => {
        const rowRef = worksheet.addRow(row);
        if (rowIndex < updatedHeader.length) {
          rowRef.eachCell((cell, colNumber) => {
            if (rowIndex < 2 || rowIndex === 3 || rowIndex === 4) { // Aplicar estilo especial a las filas 1, 2, 4 y 5
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '002060' }, // Fondo azul
              };
              cell.font = {
                bold: true,
                color: { argb: '00FF00' }, // Texto verde
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
            cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } }
            };
          });
        } else { // Aplicar estilo verde a las filas de datos
          rowRef.eachCell((cell, colNumber) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'E8F3D3' }, // Fondo verde
            };
            cell.font = {
              bold: true,
              color: { argb: '000000' },
            };
            cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } }
            };
          });
        }
      });

      // Unir celdas de las filas 1, 2, 4 y 5 antes de aplicar estilos
      worksheet.mergeCells('A1:M1');
      worksheet.mergeCells('A2:M2');
      worksheet.mergeCells('A4:M4');
      worksheet.mergeCells('A5:M5');

      // Centrar el texto en las celdas combinadas
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getColumn(1).width = 67.43;
      worksheet.getColumn(7).width = 10.43;
      worksheet.getColumn(8).width = 10.43;
      worksheet.getColumn(9).width = 10.43;
      worksheet.getColumn(10).width = 14.43;
      worksheet.getColumn(11).width = 27.43;
      worksheet.getColumn(12).width = 10.43;
      worksheet.getColumn(13).width = 10.43;
      worksheet.getColumn(14).width = 10.43;
      const applyStyles = (cell, fillColor, fontColor, bold = false) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
        cell.font = {
          bold: bold,
          color: { argb: fontColor },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };
      };
      let currentRowIndex = updatedHeader.length + 1;
      for (const sectionKey in dataJson) {
        const sectionRow = worksheet.getRow(currentRowIndex);
        sectionRow.eachCell((cell) => {
          applyStyles(cell, 'FFFFFF', '000000', true);
        });
        currentRowIndex++;
        for (const item in dataJson[sectionKey]) {
          const itemRow = worksheet.getRow(currentRowIndex);
          itemRow.eachCell({ includeEmpty: true }, (cell) => {
            applyStyles(cell, 'E8F3D3', '000000');
          });
          currentRowIndex++;
        }
      }
    });

    // Guardar el archivo en una ubicación temporal
    const buffer = await workbook.xlsx.writeBuffer();
    const uri = FileSystem.cacheDirectory + 'example.xlsx';
    await FileSystem.writeAsStringAsync(uri, buffer.toString('base64'), {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Compartir el archivo usando expo-sharing
    await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="NOMBRE"
        value={formData.nombre}
        onChangeText={(text) => handleFormChange('nombre', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="RUT"
        value={formData.rut}
        onChangeText={(text) => handleFormChange('rut', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="DIRECCION"
        value={formData.direccion}
        onChangeText={(text) => handleFormChange('direccion', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="COMUNA"
        value={formData.comuna}
        onChangeText={(text) => handleFormChange('comuna', text)}
      />
      <Button title="Agregar Sección" onPress={addSection} />
      <ScrollView style={styles.scrollView}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <TextInput
              style={styles.sectorInput}
              placeholder="Nombre del Sector"
              value={section.name}
              onChangeText={(text) => handleSectorNameChange(text, sectionIndex)}
            />
            <Picker
              selectedValue={section.selectedSection}
              style={styles.picker}
              onValueChange={(itemValue) => handleSectionChange(itemValue, sectionIndex)}
            >
              {Object.keys(dataJson).map((sectionKey) => (
                <Picker.Item key={sectionKey} label={sectionKey} value={sectionKey} />
              ))}
            </Picker>
            {section.confirmationMessage ? (
              <Text style={styles.confirmationMessage}>{section.confirmationMessage}</Text>
            ) : null}
            <ScrollView style={styles.scrollView}>
              <View>
                <Text style={styles.sectionHeader}>{section.selectedSection.toUpperCase()}</Text>
                {Object.keys(dataJson[section.selectedSection]).map((item, subIndex) => (
                  <View key={subIndex} style={styles.itemContainer}>
                    <Text style={styles.itemHeader}>  {item}</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>unidad</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Cantidad Real"
                        keyboardType="numeric"
                        value={section.realCounts[`${section.selectedSection}.${item}.unidad`] || ''}
                        onChangeText={(text) => handleInputChange(`${section.selectedSection}.${item}.unidad`, text, sectionIndex)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <Button title="Enviar Datos" onPress={() => sendSectionData(sectionIndex)} />
          </View>
        ))}
      </ScrollView>
      <Button title="Generar Excel" onPress={generateExcel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sectorInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  confirmationMessage: {
    fontSize: 16,
    color: 'green',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    paddingLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingLeft: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});
