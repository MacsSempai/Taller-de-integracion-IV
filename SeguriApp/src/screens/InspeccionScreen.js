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
} from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer'; 

const BASE_URL = 'http://190.114.253.250:3000/api';

const InspectionForm = ({ route }) => {
  const { casoId } = route.params; // Recibe el casoId desde la navegación
  const [formData, setFormData] = useState({}); // Inicializado como objeto vacío
  const [clienteData, setClienteData] = useState({}); // Inicializado como objeto vacío

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
        });

        if (caso.ID_Cliente) {
          fetchClienteData(caso.ID_Cliente);
        }
      } else {
        Alert.alert('Error', 'No se encontraron datos para el caso seleccionado.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del caso:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos del caso');
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permisos para acceder a la biblioteca multimedia para guardar el archivo.'
      );
      throw new Error('Permiso denegado');
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

  const createExcelFile = async () => {
    try {
      // Request permissions before proceeding
      await requestMediaLibraryPermission();
  
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
  
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["Reporte de Inspección", ""],
        ["Fecha", formattedDate],
        ["Descripción del Siniestro", formData.descripcion_siniestro || 'No especificado'],
        ["Tipo de Siniestro", formData.tipo_siniestro || 'No especificado'],
        ["Nombre del Cliente", clienteData?.nombre || 'No especificado'],
        ["Apellido del Cliente", clienteData?.apellido || 'No especificado'],
        ["Celular del Cliente", clienteData?.celular || 'No especificado'],
        ["Correo del Cliente", clienteData?.correo || 'No especificado'],
        ["Dirección del Cliente", clienteData?.direccion || 'No especificado'],
        ["Comuna del Cliente", clienteData?.comuna || 'No especificado'],
      ];
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Inspección');
  
      const binary = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const base64 = Buffer.from(binary, 'binary').toString('base64');
  
      const fileName = `Inspeccion_${clienteData?.nombre || 'Cliente'}_${formData?.tipo_siniestro || 'Siniestro'}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
      // Save file to the file system
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  
      // Save file to the media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
  
      // Optional: Add the file to a specific album
      await MediaLibrary.createAlbumAsync('Inspecciones', asset, false);
  
      // Proceed with file upload
      await uploadExcelFile(fileUri, fileName);
  
      Alert.alert('Éxito', 'Archivo Excel creado y enviado correctamente');
      return { fileUri, fileName };
    } catch (error) {
      console.error('Error al crear el archivo Excel:', error);
      Alert.alert('Error', 'No se pudo crear el archivo Excel. Revise los datos e intente nuevamente.');
    }
  };
  
  const uploadExcelFile = async (fileUri, fileName) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('excelFile', {
        uri: fileUri,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: fileName,
      });

      formDataToSend.append('descripcion_siniestro', formData.descripcion_siniestro || '');
      formDataToSend.append('tipo_siniestro', formData.tipo_siniestro || '');
      formDataToSend.append('nombre_cliente', clienteData.nombre || '');
      formDataToSend.append('apellido_cliente', clienteData.apellido || '');
      formDataToSend.append('celular_cliente', clienteData.celular || '');
      formDataToSend.append('correo_cliente', clienteData.correo || '');
      formDataToSend.append('direccion_cliente', clienteData.direccion || '');
      formDataToSend.append('comuna_cliente', clienteData.comuna || '');

      const response = await fetch(`${BASE_URL}/archivos/upload-excel`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Éxito', 'Archivo Excel creado y enviado correctamente');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Hubo un problema al enviar el archivo');
      }
    } catch (error) {
      console.error('Error al enviar el archivo Excel:', error);
      Alert.alert('Error', 'Hubo un problema al enviar el archivo Excel');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.descripcion_siniestro || !formData.tipo_siniestro) {
        Alert.alert('Error', 'Por favor, completa todos los campos requeridos');
        return;
      }

      await createExcelFile();
    } catch (error) {
      console.error('Error al enviar el archivo:', error.message);
      Alert.alert('Error', 'Hubo un problema al enviar el archivo');
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
              value={clienteData.nombre}
              editable={false}
            />

            <Text style={styles.label}>Apellido del Cliente:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.apellido}
              editable={false}
            />

            <Text style={styles.label}>Celular:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.celular}
              editable={false}
            />

            <Text style={styles.label}>Correo:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.correo}
              editable={false}
            />

            <Text style={styles.label}>Dirección:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.direccion}
              editable={false}
            />

            <Text style={styles.label}>Comuna:</Text>
            <TextInput
              style={styles.input}
              value={clienteData.comuna}
              editable={false}
            />
          </>
        )}

        <TouchableOpacity style={styles.exportButton} onPress={handleSubmit}>
          <Text style={styles.exportButtonText}>Exportar y Subir Excel</Text>
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
