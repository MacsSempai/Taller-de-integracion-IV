// InspectionForm.js

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ExcelJS from 'exceljs';
import { Picker } from '@react-native-picker/picker';

// Configurar Buffer para React Native
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

const BASE_URL = 'http://190.114.253.250:3000/api';

const InspectionForm = ({ route }) => {
  const { casoId } = route.params; // Recibe el casoId desde la navegación
  const [formData, setFormData] = useState({}); // Datos del caso
  const [clienteData, setClienteData] = useState({}); // Datos del cliente
  const [sectoresData, setSectoresData] = useState([]); // Lista de sectores
  const [subSectoresData, setSubSectoresData] = useState([]); // Lista de subsectores
  const [selectedSector, setSelectedSector] = useState(null); // Sector seleccionado
  const [selectedSectorDetails, setSelectedSectorDetails] = useState(null); // Detalles del sector seleccionado
  const [selectedSubSector, setSelectedSubSector] = useState(null); // Subsector seleccionado
  const [selectedSubSectorDetails, setSelectedSubSectorDetails] = useState(null); // Detalles del subsector seleccionado

  useEffect(() => {
    // Cargar los datos del caso cuando se monte el componente
    if (casoId) {
      fetchCasoData(casoId);
    }
  }, [casoId]);

  const fetchCasoData = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/casos/${id}`);
      const caso = response.data;

      if (caso && Object.keys(caso).length > 0) {
        setFormData({
          descripcion_siniestro: caso.descripcion_siniestro || '',
          tipo_siniestro: caso.tipo_siniestro || '',
          ID_Cliente: caso.ID_Cliente || null,
          Fecha_Creacion: caso.Fecha_Creacion || '',
        });

        if (caso.ID_Cliente) {
          fetchClienteData(caso.ID_Cliente);
        }

        // Cargar los sectores asociados al caso
        fetchSectoresData(id);
      } else {
        Alert.alert('Error', 'No se encontraron datos para el caso seleccionado.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del caso:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos del caso');
    }
  };

  const fetchClienteData = async (idCliente) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${idCliente}`);
      const cliente = response.data;

      if (cliente) {
        setClienteData({
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          celular: cliente.celular || '',
          correo: cliente.correo || '',
          direccion: cliente.direccion || '',
          comuna: cliente.comuna || '',
        });
      } else {
        Alert.alert('Error', 'No se encontraron datos del cliente.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del cliente:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos del cliente');
    }
  };

  const fetchSectoresData = async (idCaso) => {
    try {
      const response = await axios.get(`${BASE_URL}/sectores`);
      const sectores = response.data;

      // Filtrar los sectores que corresponden al caso actual
      const sectoresDelCaso = sectores.filter((sector) => sector.ID_caso === idCaso);

      setSectoresData(sectoresDelCaso);

      // Si hay sectores, seleccionar el primero por defecto
      if (sectoresDelCaso.length > 0) {
        const firstSectorId = sectoresDelCaso[0].ID_sector;
        setSelectedSector(firstSectorId);
        setSelectedSectorDetails(sectoresDelCaso[0]);
        fetchSubSectoresData(firstSectorId);
      }
    } catch (error) {
      console.error('Error al cargar los datos de sectores:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos de sectores');
    }
  };

  const fetchSubSectoresData = async (idSector) => {
    try {
      const response = await axios.get(`${BASE_URL}/subsectores`);
      const subSectores = response.data;

      // Filtrar los subsectores que corresponden al sector seleccionado
      const subSectoresDelSector = subSectores.filter(
        (subSector) => subSector.ID_sector === idSector
      );

      setSubSectoresData(subSectoresDelSector);

      // Si hay subsectores, seleccionar el primero por defecto
      if (subSectoresDelSector.length > 0) {
        const firstSubSectorId = subSectoresDelSector[0].ID_sub_sector;
        setSelectedSubSector(firstSubSectorId);
        setSelectedSubSectorDetails(subSectoresDelSector[0]);
      } else {
        setSelectedSubSector(null);
        setSelectedSubSectorDetails(null);
      }
    } catch (error) {
      console.error('Error al cargar los datos de subsectores:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos de subsectores');
    }
  };

  const handleSectorChange = (sectorId) => {
    setSelectedSector(sectorId);
    // Obtener los detalles del sector seleccionado
    const sectorSeleccionado = sectoresData.find((sector) => sector.ID_sector === sectorId);
    setSelectedSectorDetails(sectorSeleccionado);
    // Cargar los subsectores para el nuevo sector seleccionado
    fetchSubSectoresData(sectorId);
  };

  const handleSubSectorChange = (subSectorId) => {
    setSelectedSubSector(subSectorId);
    // Obtener los detalles del subsector seleccionado
    const subSectorSeleccionado = subSectoresData.find(
      (subSector) => subSector.ID_sub_sector === subSectorId
    );
    setSelectedSubSectorDetails(subSectorSeleccionado);
  };

  const generateExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inspección');

      // Estilos comunes
      const headerFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      const titleFont = { name: 'Arial', size: 12, bold: true };
      const contentFont = { name: 'Arial', size: 12 };
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } };
      const sectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
      const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Títulos del reporte
      worksheet.mergeCells('A1', 'E1');
      worksheet.getCell('A1').value = 'Reporte de Inspección';
      worksheet.getCell('A1').font = { name: 'Arial', size: 18, bold: true };
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 25;

      // Fecha del reporte
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      worksheet.mergeCells('A2', 'E2');
      worksheet.getCell('A2').value = `Fecha: ${formattedDate}`;
      worksheet.getCell('A2').font = { name: 'Arial', size: 12 };
      worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(2).height = 20;

      // Espacio
      worksheet.addRow([]);

      // Información del siniestro
      worksheet.addRow(['Descripción del Siniestro', formData.descripcion_siniestro || 'No especificado']);
      worksheet.addRow(['Tipo de Siniestro', formData.tipo_siniestro || 'No especificado']);
      worksheet.addRow(['Fecha de Creación', formData.Fecha_Creacion || 'No especificado']);

      // Estilos para la información del siniestro
      worksheet.getColumn(1).width = 25;
      worksheet.getColumn(2).width = 50;
      for (let i = 4; i <= 6; i++) {
        worksheet.getRow(i).font = contentFont;
        worksheet.getCell(`A${i}`).font = titleFont;
        worksheet.getCell(`A${i}`).fill = sectionFill;
        worksheet.getRow(i).height = 20;
        worksheet.getCell(`A${i}`).border = borderStyle;
        worksheet.getCell(`B${i}`).border = borderStyle;
      }

      // Espacio
      worksheet.addRow([]);

      // Información del cliente
      worksheet.mergeCells(`A${worksheet.lastRow.number + 1}:E${worksheet.lastRow.number + 1}`);
      worksheet.addRow(['Información del Cliente']);
      const infoClienteRow = worksheet.lastRow.number;
      worksheet.getCell(`A${infoClienteRow}`).font = headerFont;
      worksheet.getCell(`A${infoClienteRow}`).fill = headerFill;
      worksheet.getCell(`A${infoClienteRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(infoClienteRow).height = 25;

      // Datos del cliente
      worksheet.addRow(['Nombre', clienteData?.nombre || 'No especificado']);
      worksheet.addRow(['Apellido', clienteData?.apellido || 'No especificado']);
      worksheet.addRow(['Celular', clienteData?.celular || 'No especificado']);
      worksheet.addRow(['Correo', clienteData?.correo || 'No especificado']);
      worksheet.addRow(['Dirección', clienteData?.direccion || 'No especificado']);
      worksheet.addRow(['Comuna', clienteData?.comuna || 'No especificado']);

      // Estilos para la información del cliente
      for (let i = infoClienteRow + 1; i <= worksheet.lastRow.number; i++) {
        worksheet.getRow(i).font = contentFont;
        worksheet.getCell(`A${i}`).font = titleFont;
        worksheet.getCell(`A${i}`).fill = sectionFill;
        worksheet.getRow(i).height = 20;
        worksheet.getCell(`A${i}`).border = borderStyle;
        worksheet.getCell(`B${i}`).border = borderStyle;
      }

      // Espacio
      worksheet.addRow([]);

      // Sectores y Subsectores
      worksheet.mergeCells(`A${worksheet.lastRow.number + 1}:E${worksheet.lastRow.number + 1}`);
      worksheet.addRow(['Sectores y Subsectores']);
      const sectoresHeaderRow = worksheet.lastRow.number;
      worksheet.getCell(`A${sectoresHeaderRow}`).font = headerFont;
      worksheet.getCell(`A${sectoresHeaderRow}`).fill = headerFill;
      worksheet.getCell(`A${sectoresHeaderRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(sectoresHeaderRow).height = 25;

      // Añadir datos de sectores y subsectores
      if (sectoresData.length > 0) {
        sectoresData.forEach((sector) => {
          worksheet.addRow([]);
          const sectorTitleRow = worksheet.lastRow.number + 1;
          worksheet.mergeCells(`A${sectorTitleRow}:E${sectorTitleRow}`);
          worksheet.addRow([`Sector: ${sector.nombre_sector || 'No especificado'}`]);
          worksheet.getCell(`A${sectorTitleRow}`).font = titleFont;
          worksheet.getCell(`A${sectorTitleRow}`).fill = sectionFill;
          worksheet.getCell(`A${sectorTitleRow}`).alignment = { vertical: 'middle', horizontal: 'left' };
          worksheet.getRow(sectorTitleRow).height = 20;

          // Detalles del sector
          worksheet.addRow(['Daño', sector.dano_sector || 'No especificado']);
          worksheet.addRow(['Porcentaje de Pérdida', sector.porcentaje_perdida || 0, '%']);
          worksheet.addRow(['Total Costo', sector.total_costo || 0]);
          const costRow = worksheet.lastRow.number;
          worksheet.getCell(`B${costRow}`).numFmt = '$#,##0.00';

          // Estilos de las filas del sector
          for (let i = sectorTitleRow + 1; i <= worksheet.lastRow.number; i++) {
            worksheet.getRow(i).font = contentFont;
            worksheet.getCell(`A${i}`).font = titleFont;
            worksheet.getCell(`A${i}`).fill = sectionFill;
            worksheet.getRow(i).height = 20;
            worksheet.getCell(`A${i}`).border = borderStyle;
            worksheet.getCell(`B${i}`).border = borderStyle;
            worksheet.getCell(`C${i}`).border = borderStyle;
          }

          // Subsectores del sector actual
          const subSectoresDelSector = subSectoresData.filter(
            (subSector) => subSector.ID_sector === sector.ID_sector
          );

          if (subSectoresDelSector.length > 0) {
            worksheet.addRow([]);
            const subSectorHeaderRow = worksheet.lastRow.number + 1;
            worksheet.mergeCells(`A${subSectorHeaderRow}:E${subSectorHeaderRow}`);
            worksheet.addRow(['Subsectores']);
            worksheet.getCell(`A${subSectorHeaderRow}`).font = titleFont;
            worksheet.getCell(`A${subSectorHeaderRow}`).fill = sectionFill;
            worksheet.getCell(`A${subSectorHeaderRow}`).alignment = {
              vertical: 'middle',
              horizontal: 'left',
            };
            worksheet.getRow(subSectorHeaderRow).height = 20;

            subSectoresDelSector.forEach((subSector) => {
              worksheet.addRow([
                'Nombre Subsector',
                subSector.nombre_sub_sector || 'No especificado',
              ]);
              worksheet.addRow([
                'Cantidad Material',
                subSector.cantidad_material || 'No especificado',
              ]);
              worksheet.addRow([
                'Tipo Reparación',
                subSector.tipo_reparacion || 'No especificado',
              ]);

              // Estilos de las filas del subsector
              for (let i = worksheet.lastRow.number - 2; i <= worksheet.lastRow.number; i++) {
                worksheet.getRow(i).font = contentFont;
                worksheet.getCell(`A${i}`).font = titleFont;
                worksheet.getCell(`A${i}`).fill = sectionFill;
                worksheet.getRow(i).height = 20;
                worksheet.getCell(`A${i}`).border = borderStyle;
                worksheet.getCell(`B${i}`).border = borderStyle;
              }
            });
          } else {
            worksheet.addRow(['No hay subsectores para este sector.']);
            const noSubSectorRow = worksheet.lastRow.number;
            worksheet.getCell(`A${noSubSectorRow}`).font = contentFont;
            worksheet.getRow(noSubSectorRow).height = 20;
          }
        });
      } else {
        worksheet.addRow(['No hay sectores disponibles.']);
        const noSectorRow = worksheet.lastRow.number;
        worksheet.getCell(`A${noSectorRow}`).font = contentFont;
        worksheet.getRow(noSectorRow).height = 20;
      }

      // Ajustar automáticamente el ancho de las columnas según su contenido
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 20 ? 20 : maxLength;
      });

      // Definir el nombre y la URI del archivo Excel
      const fileName = `Inspeccion_${clienteData?.nombre || 'Cliente'}_${
        formData?.tipo_siniestro || 'Siniestro'
      }.xlsx`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Escribir el buffer del workbook en el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferStr = buffer.toString('base64');

      await FileSystem.writeAsStringAsync(fileUri, bufferStr, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Subir el archivo Excel a la API
      await uploadExcelFile(fileUri, fileName);

      // Compartir el archivo Excel utilizando expo-sharing
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri);
      } else {
        const mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const UTI = 'com.microsoft.excel.xlsx';
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: 'Compartir archivo Excel',
          UTI,
        });
      }

      Alert.alert('Éxito', 'Archivo Excel generado, subido y compartido correctamente');
    } catch (error) {
      console.error('Error al generar el archivo Excel: ', error);
      Alert.alert('Error', 'Hubo un problema al generar el archivo Excel.');
    }
  };

  const uploadExcelFile = async (fileUri, fileName) => {
    try {
      const dataForm = new FormData();
      dataForm.append('excelFile', {
        uri: fileUri,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: fileName,
      });

      // Agregar ID_caso al FormData
      dataForm.append('ID_caso', casoId); // Asegúrate de que casoId tiene el valor correcto

      // Enviar el archivo a la API
      const response = await fetch(`${BASE_URL}/archivos/upload-excel`, {
        method: 'POST',
        body: dataForm,
      });

      if (response.ok) {
        console.log('Archivo subido correctamente');
      } else {
        const errorData = await response.json();
        console.error('Error al subir el archivo:', errorData);
        Alert.alert(
          'Error',
          errorData.error || 'Hubo un problema al subir el archivo Excel a la API.'
        );
      }
    } catch (error) {
      console.error('Error al subir el archivo Excel:', error);
      Alert.alert('Error', 'Hubo un problema al subir el archivo Excel.');
    }
  };

  const handleSubmit = async () => {
    try {
      // Generar el archivo Excel, subirlo y compartirlo
      await generateExcel();
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error.message);
      Alert.alert('Error', `Hubo un problema al generar el archivo Excel: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Descripción del Siniestro:</Text>
        <TextInput
          style={styles.input}
          value={formData?.descripcion_siniestro || ''}
          editable={false}
        />

        <Text style={styles.label}>Tipo de Siniestro:</Text>
        <TextInput
          style={styles.input}
          value={formData?.tipo_siniestro || ''}
          editable={false}
        />

        {clienteData && (
          <>
            <Text style={styles.label}>Nombre del Cliente:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.nombre || ''}
              editable={false}
            />

            <Text style={styles.label}>Apellido del Cliente:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.apellido || ''}
              editable={false}
            />

            <Text style={styles.label}>Celular:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.celular || ''}
              editable={false}
            />

            <Text style={styles.label}>Correo:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.correo || ''}
              editable={false}
            />

            <Text style={styles.label}>Dirección:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.direccion || ''}
              editable={false}
            />

            <Text style={styles.label}>Comuna:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.comuna || ''}
              editable={false}
            />
          </>
        )}

        {sectoresData.length > 0 && (
          <>
            <Text style={styles.label}>Selecciona un Sector:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSector}
                onValueChange={(itemValue) => handleSectorChange(itemValue)}
                style={styles.picker}
              >
                {sectoresData.map((sector) => (
                  <Picker.Item
                    key={sector.ID_sector}
                    label={`${sector.nombre_sector || 'Sector'} - $${sector.total_costo || 0}`}
                    value={sector.ID_sector}
                  />
                ))}
              </Picker>
            </View>

            {/* Mostrar detalles del sector seleccionado */}
            {selectedSectorDetails && (
              <View style={styles.sectorDetails}>
                <Text style={styles.detailLabel}>Daño del Sector:</Text>
                <Text style={styles.detailText}>
                  {selectedSectorDetails.dano_sector || 'No especificado'}
                </Text>

                <Text style={styles.detailLabel}>Porcentaje de Pérdida:</Text>
                <Text style={styles.detailText}>
                  {selectedSectorDetails.porcentaje_perdida || '0'}%
                </Text>

                <Text style={styles.detailLabel}>Total Costo:</Text>
                <Text style={styles.detailText}>
                  ${selectedSectorDetails.total_costo || '0'}
                </Text>
              </View>
            )}

            {subSectoresData.length > 0 && (
              <>
                <Text style={styles.label}>Selecciona un Subsector:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSubSector}
                    onValueChange={(itemValue) => handleSubSectorChange(itemValue)}
                    style={styles.picker}
                  >
                    {subSectoresData.map((subSector) => (
                      <Picker.Item
                        key={subSector.ID_sub_sector}
                        label={subSector.nombre_sub_sector || 'Subsector'}
                        value={subSector.ID_sub_sector}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Mostrar detalles del subsector seleccionado */}
                {selectedSubSectorDetails && (
                  <View style={styles.subSectorDetails}>
                    <Text style={styles.detailLabel}>Cantidad de Material:</Text>
                    <Text style={styles.detailText}>
                      {selectedSubSectorDetails.cantidad_material || 'No especificado'}
                    </Text>

                    <Text style={styles.detailLabel}>Tipo de Reparación:</Text>
                    <Text style={styles.detailText}>
                      {selectedSubSectorDetails.tipo_reparacion || 'No especificado'}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}

        <TouchableOpacity style={styles.exportButton} onPress={handleSubmit}>
          <Text style={styles.exportButtonText}>Generar y Subir Excel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f7f9fc',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  sectorDetails: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
  },
  subSectorDetails: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  detailText: {
    marginBottom: 10,
    color: '#333',
    fontSize: 14,
  },
  exportButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 18,
    borderRadius: 8,
    marginVertical: 30,
    alignSelf: 'center',
    width: '100%',
  },
  exportButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default InspectionForm;
