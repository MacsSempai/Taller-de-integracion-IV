// src/components/GeneratePDF.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import axios from 'axios';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE_URL = 'http://192.168.1.10:3000/api'; // Asegúrate de que esta IP sea accesible desde tu dispositivo/emulador

const GeneratePDF = () => {
  const [caseID, setCaseID] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [caseData, setCaseData] = useState(null);

  // Función para validar el ID del caso
  const validateCaseID = (id) => {
    const idNumber = parseInt(id, 10);
    return !isNaN(idNumber) && idNumber > 0;
  };

  // Función para obtener datos del caso desde el backend
  const fetchCaseData = async (id) => {
    if (!validateCaseID(id)) {
      Alert.alert('Formato incorrecto', 'El formato del ID del caso es incorrecto.');
      return;
    }

    console.log('ID del caso ingresado:', id);
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/casos/${id}`);
      if (response.status === 200 && response.data) {
        console.log('Datos obtenidos:', response.data);
        setCaseData(response.data);
      } else {
        console.log('No se encontraron datos para el ID del caso:', id);
        Alert.alert('No encontrado', 'No se encontraron datos para el ID del caso ingresado.');
        setCaseData(null);
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar el contenido HTML del PDF
  const generateHTML = () => {
    if (!caseData) {
      return '<h1>No hay datos para generar el PDF.</h1>';
    }

    let sectoresHTML = '';
    if (caseData.sectores && caseData.sectores.length > 0) {
      sectoresHTML = caseData.sectores.map(sector => `
        <tr>
          <td>${sector.nombre_sector || 'N/A'}</td>
          <td>${sector.descripcion || 'N/A'}</td>
        </tr>
      `).join('');
    } else {
      sectoresHTML = `
        <tr>
          <td colspan="2">No hay sectores dañados.</td>
        </tr>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              padding: 16px; 
              background-color: #f9f9f9; 
              color: #333; 
            }
            h1 { 
              text-align: center; 
              font-size: 26px; 
              color: #2c3e50; 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              background-color: #ffffff; 
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
              font-size: 14px; 
            }
            th { 
              background-color: #34495e; 
              color: #ffffff; 
              font-weight: bold; 
            }
            tr:nth-child(even) {background-color: #f2f2f2;}
            .comments { 
              margin-top: 20px; 
              font-size: 15px; 
              color: #2c3e50; 
            }
            .images { 
              display: flex; 
              flex-wrap: wrap; 
              margin-top: 20px; 
            }
            .image-container { 
              margin: 10px; 
              border: 2px solid #ddd; 
              padding: 5px; 
              background-color: #ffffff; 
              border-radius: 5px; 
            }
            .image-container img { 
              width: 300px; 
              height: 225px; 
              border-radius: 5px; 
            }
          </style>
        </head>
        <body>
          <h1>Inspección de Siniestro</h1>
          <table>
            <tr>
              <th>Nombre</th>
              <td>${caseData.nombre || 'N/A'}</td>
            </tr>
            <tr>
              <th>RUT</th>
              <td>${caseData.rut || 'N/A'}</td>
            </tr>
            <tr>
              <th>Dirección</th>
              <td>${caseData.direccion || 'N/A'}</td>
            </tr>
            <tr>
              <th>Comuna</th>
              <td>${caseData.comuna || 'N/A'}</td>
            </tr>
            <tr>
              <th>Fecha de Siniestro</th>
              <td>${caseData.catastroDia ? caseData.catastroDia.toString().padStart(2, '0') : 'N/A'}/${caseData.catastroMes ? caseData.catastroMes.toString().padStart(2, '0') : 'N/A'}/${caseData.catastroAno || 'N/A'}</td>
            </tr>
          </table>
          <p class="comments"><strong>Comentarios:</strong> ${caseData.comentarios || 'N/A'}</p>
          <table>
            <tr>
              <th>Sector</th>
              <th>Descripción</th>
            </tr>
            ${sectoresHTML}
          </table>
          <div class="images">
            ${caseData.imagenes && caseData.imagenes.length > 0 ? 
              caseData.imagenes.map(img => `<div class="image-container"><img src="${img.url}" /></div>`).join('') 
              : '<p>No hay imágenes disponibles.</p>'
            }
          </div>
        </body>
      </html>
    `;

    return htmlContent;
  };

  // Función para generar el PDF
  const handleGeneratePDF = async () => {
    if (generating || uploading) return;

    if (!caseData) {
      Alert.alert('Sin datos', 'Por favor, asegúrate de ingresar un ID de caso válido y que los datos estén cargados.');
      return;
    }

    setGenerating(true);
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      setPdfUri(uri);
      Alert.alert('Éxito', 'PDF generado exitosamente.');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al generar el PDF.');
    } finally {
      setGenerating(false);
    }
  };

  // Función para subir el PDF al backend
  const handleUploadPDF = async () => {
    if (uploading) return;

    if (!pdfUri) {
      Alert.alert('Sin PDF', 'Por favor, genera el PDF primero.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `Inspeccion_${caseData.nombre.replace(/ /g, '_')}_${caseData.rut.replace(/[-.]/g, '')}.pdf`;

      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: pdfUri,
        type: 'application/pdf',
        name: fileName,
      });
      formDataToSend.append('ID_caso', caseData.ID_caso || null);
      formDataToSend.append('tipo_de_archivo', 'application/pdf');

      const response = await axios.post(`${BASE_URL}/files/upload`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Éxito', 'PDF subido correctamente al servidor.');
        console.log('Respuesta del backend:', response.data);
      } else {
        console.error('Error al subir el PDF:', response.data);
        Alert.alert('Error', 'Hubo un problema al subir el PDF.');
      }
    } catch (error) {
      console.error('Error al subir el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al subir el PDF.');
    } finally {
      setUploading(false);
    }
  };

  // Función para compartir el PDF
  const handleSharePDF = async () => {
    if (!pdfUri) {
      Alert.alert('Sin PDF', 'Por favor, genera el PDF primero.');
      return;
    }

    try {
      await Sharing.shareAsync(pdfUri);
    } catch (error) {
      console.error('Error al compartir el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al compartir el PDF.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>ID del Caso:</Text>
      <TextInput 
        style={styles.input}
        onChangeText={text => setCaseID(text)}
        onBlur={() => fetchCaseData(caseID)}
        value={caseID}
        placeholder="Ingresa el ID del caso"
        placeholderTextColor="#7f8c8d"
        keyboardType="numeric"
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text>Cargando datos del caso...</Text>
        </View>
      )}

      {caseData && (
        <>
          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={handleGeneratePDF}
            disabled={generating}
          >
            <Text style={styles.generateButtonText}>
              {generating ? 'Generando PDF...' : 'Generar PDF'}
            </Text>
          </TouchableOpacity>

          {pdfUri && (
            <>
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleUploadPDF}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Subiendo PDF...' : 'Subir PDF al Servidor'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareButton} 
                onPress={handleSharePDF}
              >
                <Text style={styles.shareButtonText}>Compartir PDF</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  loadingContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GeneratePDF;
