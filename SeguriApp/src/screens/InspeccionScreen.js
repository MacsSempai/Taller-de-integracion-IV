import React, { useState, useEffect } from 'react';
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
