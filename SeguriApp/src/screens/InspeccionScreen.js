import React, { useState } from 'react';
import { View, Text, TextInput, Button, CheckBox, Alert } from 'react-native';
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';

const InspectionForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    fechaInspeccion: '',
    sectoresAfectados: '',
    subsectores: {
      cielo: false,
      piso: false,
      muro: false,
      otros: false,
    },
    id_caso: '',
  });

  const handleChange = (name, value) => {
    if (typeof value === 'boolean') {
      setFormData((prev) => ({
        ...prev,
        subsectores: { ...prev.subsectores, [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const createExcelFile = async () => {
    // Crear el workbook y la hoja
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Nombre', formData.nombre],
      ['RUT', formData.rut],
      ['Dirección', formData.direccion],
      ['Fecha de Inspección', formData.fechaInspeccion],
      ['Sectores Afectados', formData.sectoresAfectados],
      ['Cielo', formData.subsectores.cielo ? 'Sí' : 'No'],
      ['Piso', formData.subsectores.piso ? 'Sí' : 'No'],
      ['Muro', formData.subsectores.muro ? 'Sí' : 'No'],
      ['Otros', formData.subsectores.otros ? 'Sí' : 'No'],
      ['ID Caso', formData.id_caso],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Inspección');

    // Escribir el archivo a un buffer y guardarlo en el sistema de archivos
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelUri = FileSystem.documentDirectory + 'inspeccion.xlsx';

    await FileSystem.writeAsStringAsync(
      excelUri,
      new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    return excelUri;
  };

  const handleSubmit = async () => {
    try {
      const excelUri = await createExcelFile(); // Generar el archivo Excel

      // Crear el FormData para la solicitud
      const formDataToSend = new FormData();
      const fileInfo = await FileSystem.getInfoAsync(excelUri);

      formDataToSend.append('file', {
        uri: excelUri,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: 'inspeccion.xlsx',
      });
      formDataToSend.append('id_caso', formData.id_caso);

      // Hacer la solicitud POST al backend
      const response = await axios.post('http://localhost:3000/api/archivos/upload-excel', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Éxito', 'Archivo Excel creado y subido correctamente');
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      Alert.alert('Error', 'Hubo un problema al subir el archivo');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Nombre:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.nombre}
        onChangeText={(value) => handleChange('nombre', value)}
      />
      
      <Text>RUT:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.rut}
        onChangeText={(value) => handleChange('rut', value)}
      />
      
      <Text>Dirección:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.direccion}
        onChangeText={(value) => handleChange('direccion', value)}
      />
      
      <Text>Fecha de Inspección:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.fechaInspeccion}
        onChangeText={(value) => handleChange('fechaInspeccion', value)}
      />
      
      <Text>Sectores Afectados:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.sectoresAfectados}
        onChangeText={(value) => handleChange('sectoresAfectados', value)}
      />

      <Text>Subsectores Afectados:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CheckBox
          value={formData.subsectores.cielo}
          onValueChange={(value) => handleChange('cielo', value)}
        />
        <Text>Cielo</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CheckBox
          value={formData.subsectores.piso}
          onValueChange={(value) => handleChange('piso', value)}
        />
        <Text>Piso</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CheckBox
          value={formData.subsectores.muro}
          onValueChange={(value) => handleChange('muro', value)}
        />
        <Text>Muro</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CheckBox
          value={formData.subsectores.otros}
          onValueChange={(value) => handleChange('otros', value)}
        />
        <Text>Otros</Text>
      </View>

      <Text>ID Caso:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={formData.id_caso}
        onChangeText={(value) => handleChange('id_caso', value)}
      />
      
      <Button title="Crear y Subir Excel" onPress={handleSubmit} />
    </View>
  );
};

export default InspectionForm;
