import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { View, Button, StyleSheet, ScrollView, TextInput, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import dataJson from '../elementos.json';
import { CommonActions } from '@react-navigation/native';

export default function DetailsScreen({ navigation, route }) {
  const { casoId, clienteId } = route.params; // Asumiendo que el casoId se pasa como parámetro
  const [client, setClient] = useState([]); 
  const [contractors, setContractors] = useState([]);
  const [sections, setSections] = useState([{
    name: '',
    quantity: '',
    tempData: {},
    totalCosts: {},
    confirmationMessage: '',
    selectedSection: Object.keys(dataJson)[0], // Valor predeterminado
    selectedContractor: null 
  }]);
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientAndContractors = async () => {
      try {
        const clientResponse = await axios.get(`http://192.168.1.4:3000/cliente/${clienteId}`);
        setClient(clientResponse.data);
  
        const contractorsResponse = await axios.get(`http://192.168.1.4:3000/contratistas`);
        setContractors(contractorsResponse.data);
      } catch (err) {
        console.error('Error al cargar datos', err);
        setError('Hubo un problema al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchClientAndContractors();
  }, [clienteId]);

  const handleQuantityChange = (value, sectionIndex) => {
    const quantity = parseFloat(value) || 0;
    const newSections = [...sections];
    newSections[sectionIndex].quantity = value;

    const selectedSection = newSections[sectionIndex].selectedSection;
    const categoryItems = dataJson[selectedSection];

    newSections[sectionIndex].totalCosts = {};
    Object.keys(categoryItems).forEach((itemKey) => {
      const itemPrice = categoryItems[itemKey].precio;
      newSections[sectionIndex].totalCosts[itemKey] = quantity * itemPrice;
    });

    setSections(newSections);
  };

  const resetInputs = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].quantity = '';
    newSections[sectionIndex].totalCosts = {}; // Limpiar los costos
    setSections(newSections);
  };

  const sendSectionData = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].tempData = { ...newSections[sectionIndex].totalCosts };
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

  const handleContractorChange = (itemValue, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedContractor = itemValue;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { 
      name: '', 
      quantity: '', 
      tempData: {}, 
      totalCosts: {}, 
      confirmationMessage: '', 
      selectedSection: Object.keys(dataJson)[0], // Valor predeterminado
      selectedContractor: null 
    }]);
  };

  const generateData = () => {
    let dataString = `Cliente: ${client.nombre}\nRUT: ${client.rut}\nDirección: ${client.direccion}\nComuna: ${client.comuna}\n\n`;

    let grandTotal = 0;

    sections.forEach((section, index) => {
      dataString += `Sección: ${section.name || `Sección ${index + 1}`}\nCantidad: ${section.quantity}\n`;
      let sectionTotal = 0;

      Object.keys(section.tempData).forEach((key) => {
        dataString += `${key}: ${section.tempData[key]}\n`;
        sectionTotal += section.tempData[key];
      });

      if (section.selectedContractor) {
        const contractor = contractors.find(c => c.id === section.selectedContractor);
        if (contractor) {
          dataString += `Contratista: ${contractor.name}\n`;
          dataString += `Porcentaje: ${contractor.percentage}%\n`;
          const quantity = parseFloat(section.quantity) || 0;
          const transportationCost = quantity * contractor.transportationCost;
          dataString += `Costo Transporte: ${transportationCost.toFixed(2)}\n`;

          const totalWithPercentage = sectionTotal + transportationCost;
          const percentageCost = (totalWithPercentage * contractor.percentage) / 100;
          dataString += `Costo Total con Porcentaje: ${(totalWithPercentage + percentageCost).toFixed(2)}\n`;

          grandTotal += (totalWithPercentage + percentageCost);
        }
      } else {
        grandTotal += sectionTotal;
      }

      dataString += '\n';
    });

    dataString += `Gran Total: ${grandTotal.toFixed(2)}`;

    setGeneratedData(dataString);
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Detalles del Cliente</Text>
      
      {loading ? (
        // Mostrar un indicador de carga mientras los datos se obtienen
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        // Mostrar un mensaje de error si la carga falla
        <Text style={styles.errorText}>{error}</Text>
      ) : client ? (
        // Solo renderizar los datos del cliente si se han cargado correctamente
        <>
          <Text style={styles.clientText}>Nombre: {client.nombre}</Text>
          <Text style={styles.clientText}>RUT: {client.rut}</Text>
          <Text style={styles.clientText}>Dirección: {client.direccion}</Text>
          <Text style={styles.clientText}>Comuna: {client.comuna}</Text>
        </>
      ) : (
        // Mostrar un mensaje temporal mientras se espera la carga
        <Text>No hay datos disponibles del cliente</Text>
      )}
    </View>

      <Button title="Agregar Sección" onPress={addSection} color="#007BFF" />
      
      <ScrollView style={styles.scrollView}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del Sector"
              value={section.name}
              onChangeText={(text) => {
                const newSections = [...sections];
                newSections[sectionIndex].name = text;
                setSections(newSections);
              }}
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
            
            <View style={styles.quantityContainer}>
              <Text style={styles.inputLabel}>Cantidad</Text>
              <TextInput
                style={styles.quantityInput}
                placeholder="Cantidad"
                keyboardType="numeric"
                value={section.quantity}
                onChangeText={(text) => handleQuantityChange(text, sectionIndex)}
              />
            </View>

            <Picker
              selectedValue={section.selectedContractor}
              style={styles.picker}
              onValueChange={(itemValue) => handleContractorChange(itemValue, sectionIndex)}
            >
              <Picker.Item label="Seleccionar Contratista" value={null} />
              {contractors.map((contractor) => (
                <Picker.Item key={contractor.id} label={contractor.name} value={contractor.id} />
              ))}
            </Picker>

            <Button
              title="Enviar Sección"
              onPress={() => sendSectionData(sectionIndex)}
              color="#007BFF"
            />
            
            <Text>{section.confirmationMessage}</Text>
          </View>
        ))}
      </ScrollView>

      <Button title="Generar Excel" onPress={generateData} color="#007BFF" />
      
      {generatedData && (
        <View style={styles.generatedDataContainer}>
          <Text>{generatedData}</Text>
        </View>
      )}
=======
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated, Modal, Switch, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../contexts/UserContext';
import dataJson from '../elementos.json';
import * as ImagePicker from 'expo-image-picker'; // Asegúrate de instalar este paquete

export default function InspeccionScreen() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    catastrodia: '',
    catastromes: '',
    catastroaño: '',
  });
  const [sections, setSections] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleFormChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleMeasurementChange = (key, value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].measurements[key] = value;
    setSections(newSections);
    calculateTotalCost(newSections); // Recalcular total al cambiar medidas
  };

  const handleCategoryChange = (value, subcategoryIndex, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories[subcategoryIndex] = {
      category: value,
      subcategory: 'Seleccione subcategoría',
      unitCost: dataJson[value]?.unitCost || 0, // Asumimos que unitCost está en elementos.json
    };
    newSections[sectionIndex].realCounts = {};
    setSections(newSections);
    calculateTotalCost(newSections); // Recalcular total al cambiar categoría
  };

  const calculateTotalCost = (newSections) => {
    let total = 0;

    newSections.forEach(section => {
      const { measurements, selectedCategories } = section;
      const area = (measurements.largo * measurements.ancho) || 0; // Calcular área

      selectedCategories.forEach(selectedCategory => {
        const { category, unitCost } = selectedCategory;

        if (unitCost && area) {
          total += unitCost * area; // Calcular costo total por categoría
        }
      });
    });

    setTotalCost(total);
  };

  const addSection = () => {
    const newSections = [
      ...sections,
      {
        name: '',
        measurements: { largo: '', ancho: '', alto: '' },
        selectedCategories: [{ category: 'Seleccione categoría', subcategory: 'Seleccione subcategoría', unitCost: 0 }],
        realCounts: {},
        confirmationMessage: '',
      },
    ];
    setSections(newSections);
    showAddSectionMessage();
  };

  const showAddSectionMessage = () => {
    setShowMessage(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setShowMessage(false);
      fadeAnim.setValue(0);
    });
  };

  const handleSectorNameChange = (value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].name = value;
    setSections(newSections);
  };

  const addSubcategory = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].selectedCategories.push({
      category: 'Seleccione categoría',
      subcategory: 'Seleccione subcategoría',
      unitCost: 0,
    });
    setSections(newSections);
  };

  const handleSubcategoryChange = () => {
    // Lógica para manejar el cambio de subcategoría
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch('YOUR_BACKEND_API_URL/generate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          sections,
          images: selectedImages,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el Excel');
      }

      const result = await response.json();
      Alert.alert('Éxito', 'Excel generado y guardado en la base de datos', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setShowConfirmation(false);
  };

  const confirmDeleteSection = (sectionIndex) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar esta sección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => deleteSection(sectionIndex) },
      ],
      { cancelable: false }
    );
  };
  
  const deleteSection = (sectionIndex) => {
    const newSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(newSections);
    calculateTotalCost(newSections); // Recalcular total al eliminar sección
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const images = result.assets.map(asset => asset.uri);
      setSelectedImages(images);
    }
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
                onChangeText={(text) => handleMeasurementChange('largo', Math.min(parseFloat(text.replace(/[^0-9.]/g, '')), 9999).toString(), sectionIndex)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.measurementInput}
                placeholder="Ancho"
                value={section.measurements.ancho}
                onChangeText={(text) => handleMeasurementChange('ancho', Math.min(parseFloat(text.replace(/[^0-9.]/g, '')), 9999).toString(), sectionIndex)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.measurementInput}
                placeholder="Alto"
                value={section.measurements.alto}
                onChangeText={(text) => handleMeasurementChange('alto', Math.min(parseFloat(text.replace(/[^0-9.]/g, '')), 9999).toString(), sectionIndex)}
                keyboardType="numeric"
              />
            </View>
            {section.selectedCategories.map((selectedCategory, subcategoryIndex) => (
              <View key={subcategoryIndex} style={styles.categoryContainer}>
                <Picker
                  selectedValue={selectedCategory.category}
                  onValueChange={(value) => handleCategoryChange(value, subcategoryIndex, sectionIndex)}
                >
                  <Picker.Item label="Seleccione categoría" value="" />
                  {Object.keys(dataJson).map((category) => (
                    <Picker.Item key={category} label={category} value={category} />
                  ))}
                </Picker>
                <TouchableOpacity onPress={() => addSubcategory(sectionIndex)} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Agregar Subcategoría</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.addSectionButton} onPress={addSection}>
          <Text style={styles.addSectionButtonText}>Agregar Sección</Text>
        </TouchableOpacity>
        <View style={styles.imagesContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
            <Text style={styles.imagePickerButtonText}>Seleccionar Imágenes</Text>
          </TouchableOpacity>
          {selectedImages.length > 0 && (
            <ScrollView horizontal>
              {selectedImages.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.selectedImage} />
              ))}
            </ScrollView>
          )}
        </View>
        <Text style={styles.totalCostText}>Costo Total: ${totalCost}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={() => setShowConfirmation(true)}>
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={showConfirmation} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>¿Estás seguro de que deseas confirmar?</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
              <Text>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.modalButton}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
>>>>>>> origin/MSierra
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, padding: 20 },
  headerContainer: { marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  clientText: { fontSize: 18, marginVertical: 2 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  picker: { height: 50, width: '100%' },
  sectionContainer: { marginBottom: 20 },
  scrollView: { marginTop: 20 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { marginRight: 10 },
  quantityInput: { height: 40, borderColor: 'gray', borderWidth: 1, flex: 1, paddingHorizontal: 10 },
  generatedDataContainer: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 18 },
=======
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
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2980b9',
    textAlign: 'center',
    marginVertical: 10,
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
>>>>>>> origin/MSierra
});
