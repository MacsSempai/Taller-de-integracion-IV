import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';

const FormularioPDF = () => {
  const [rut, setRut] = useState('');
  const [comments, setComments] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    catastroDia: '',
    catastroMes: '',
    catastroAno: '',
    sectores: [],
  });

  const formatRUT = (value) => {
    const rutCleaned = value.replace(/[^\dkK]/g, '');
    
    if (rutCleaned.length <= 1) return rutCleaned;

    let rutBody = rutCleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    let rutDigit = rutCleaned.slice(-1);
    
    return `${rutBody}-${rutDigit}`;
  };

  const handleRutChange = (text) => {
    const formattedRUT = formatRUT(text);
    setRut(formattedRUT);
  };

  const validateRUT = (rut) => {
    const rutPattern = /^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/;
    return rutPattern.test(rut);
  };

  const fetchFormData = async (rut) => {
    if (!validateRUT(rut)) {
      Alert.alert('Formato incorrecto', 'El formato del RUT es incorrecto.');
      return;
    }

    console.log('RUT ingresado:', rut);
    setLoading(true);
    try {
      const docRef = doc(db, 'inspections', rut);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Datos obtenidos:', docSnap.data());
        setFormData(docSnap.data());
      } else {
        console.log('No se encontraron datos para el RUT:', rut);
        Alert.alert('No encontrado', 'No se encontraron datos para el RUT ingresado.');
        setFormData({
          nombre: '',
          rut: '',
          direccion: '',
          comuna: '',
          catastroDia: '',
          catastroMes: '',
          catastroAno: '',
          sectores: [],
        });
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Comprimir la imagen antes de agregarla
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Cambia el tamaño de la imagen a 800px de ancho
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Comprime la imagen al 50% de calidad
      );

      setImages([...images, compressedImage.uri]);
    }
  };

  const convertImageToBase64 = async (uri) => {
    if (!uri) {
      console.warn('URI no definida o nula');
      return null;
    }
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error al convertir imagen a base64:', error);
      return null;
    }
  };

  const handleGeneratePDF = async () => {
    const base64Images = await Promise.all(
      images.map(async (uri) => {
        const base64Image = await convertImageToBase64(uri);
        return base64Image ? `<div class="image-container"><img src="${base64Image}" /></div>` : '';
      })
    );
    const imageTags = base64Images.join('');

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
            td { 
              background-color: #ecf0f1; 
            }
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
              <td>${formData.nombre}</td>
            </tr>
            <tr>
              <th>RUT</th>
              <td>${formData.rut}</td>
            </tr>
            <tr>
              <th>Dirección</th>
              <td>${formData.direccion}</td>
            </tr>
            <tr>
              <th>Comuna</th>
              <td>${formData.comuna}</td>
            </tr>
            <tr>
              <th>Fecha de Siniestro</th>
              <td>${formData.catastroDia.padStart(2, '0')}/${formData.catastroMes.padStart(2, '0')}/${formData.catastroAno}</td>
            </tr>
          </table>
          <p class="comments"><strong>Comentarios:</strong> ${comments}</p>
          <div class="images">
            ${imageTags}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (uri) {
        console.log('PDF generado en:', uri);
        const fileName = `${formData.nombre.replace(/ /g, '_')}_${formData.rut}.pdf`;

        // Subir el archivo a Firebase Storage
        const storageRef = ref(storage, `inspections/${formData.rut}/files/${fileName}`);
        const response = await fetch(uri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);

        // Obtener la URL de descarga
        const downloadURL = await getDownloadURL(storageRef);

        // Guardar la metadata en Firestore
        const docRef = doc(db, `inspections/${formData.rut}/files`, fileName);
        await setDoc(docRef, {
          name: fileName,
          url: downloadURL,
          uploadedAt: new Date(),
          type: 'pdf', // Añadir el tipo de archivo
        });

        console.log('Archivo subido y URL guardada en Firestore:', fileName);
        Alert.alert('Éxito', 'PDF generado y subido correctamente.');

        // Compartir el PDF
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('Error al generar o subir el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al generar o subir el PDF.');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10, fontSize: 18, color: '#34495e' }}>RUT:</Text>
      <TextInput 
        style={{ height: 40, borderColor: '#34495e', borderWidth: 1, marginBottom: 20, paddingHorizontal: 8, borderRadius: 4 }}
        onChangeText={handleRutChange} 
        onBlur={() => fetchFormData(rut)} 
        value={rut} 
        placeholder="XX.XXX.XXX-X"
        placeholderTextColor="#7f8c8d"
      />

      {loading && (
        <View style={{ marginVertical: 10 }}>
          <ActivityIndicator size="large" color="#2980b9" />
        </View>
      )}

      <Text style={{ marginBottom: 10, fontSize: 18, color: '#34495e' }}>Comentarios:</Text>
      <TextInput 
        style={{ height: 80, borderColor: '#34495e', borderWidth: 1, marginBottom: 20, paddingHorizontal: 8, borderRadius: 4 }}
        onChangeText={text => setComments(text)} 
        value={comments} 
        multiline 
        placeholder="Escribe tus comentarios aquí..."
        placeholderTextColor="#7f8c8d"
      />

      {formData.sectores && formData.sectores.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 10 }}>Sectores Dañados:</Text>
          {formData.sectores.map((sector, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 16, color: '#2c3e50' }}>{sector.category}</Text>
              <Text style={{ fontSize: 14, color: '#7f8c8d' }}>{sector.subcategory}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={{
          backgroundColor: '#2980b9', 
          padding: 15, 
          borderRadius: 5, 
          alignItems: 'center', 
          marginBottom: 20
        }} 
        onPress={pickImage}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Subir Imagen</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {images.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={{ width: 100, height: 100, marginRight: 10, marginBottom: 10, borderRadius: 5 }} />
        ))}
      </View>

      <TouchableOpacity 
        style={{
          backgroundColor: '#e74c3c', 
          padding: 15, 
          borderRadius: 5, 
          alignItems: 'center'
        }} 
        onPress={handleGeneratePDF}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Generar PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FormularioPDF;
