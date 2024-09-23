import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated, Modal, Switch, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../contexts/UserContext';
import dataJson from '../elementos.json';

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
      unitCost: datajson[value]?.unitCost || 0, // Asumimos que unitCost está en elementos.json
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

  };

  const handleConfirm = () => {
    // Lógica para generar el Excel
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
};

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
});
