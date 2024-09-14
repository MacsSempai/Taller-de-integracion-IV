import React, { useState } from 'react';
import { View, Button, StyleSheet, ScrollView, TextInput, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useClient } from '../contexts/UserContext'; 
import { useContractors } from '../contexts/UserContext'; 
import dataJson from '../elementos.json';

export default function DetailsScreen({ navigation }) {
  const { client } = useClient();
  const { contractors } = useContractors(); // Asegúrate de usar el hook correcto

  const [sections, setSections] = useState([
    { name: '', quantity: '', tempData: {}, totalCosts: {}, confirmationMessage: '', selectedSection: Object.keys(dataJson)[0], selectedContractor: null }
  ]);

  const [generatedData, setGeneratedData] = useState(null);

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
    setSections([...sections, { name: '', quantity: '', tempData: {}, totalCosts: {}, confirmationMessage: '', selectedSection: Object.keys(dataJson)[0], selectedContractor: null }]);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Detalles del Cliente</Text>
        <Text style={styles.clientText}>{`Nombre: ${client.nombre}`}</Text>
        <Text style={styles.clientText}>{`RUT: ${client.rut}`}</Text>
        <Text style={styles.clientText}>{`Dirección: ${client.direccion}`}</Text>
        <Text style={styles.clientText}>{`Comuna: ${client.comuna}`}</Text>
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

            {Object.keys(dataJson[section.selectedSection]).map((item, subIndex) => (
              <View key={subIndex} style={styles.itemContainer}>
                <Text style={styles.itemHeader}>{item}</Text>
                <Text>{`Costo: ${section.totalCosts[item] || 0}`}</Text>
              </View>
            ))}

            <Picker
              selectedValue={section.selectedContractor}
              style={styles.picker}
              onValueChange={(itemValue) => handleContractorChange(itemValue, sectionIndex)}
            >
              <Picker.Item label="Seleccionar Contratista" value={null} />
              {contractors.filter(c => c.areas.includes(section.selectedSection)).map((contractor) => (
                <Picker.Item key={contractor.id} label={contractor.name} value={contractor.id} />
              ))}
            </Picker>

            <Button title="Enviar Datos" onPress={() => sendSectionData(sectionIndex)} color="#28a745" />
            {section.confirmationMessage ? (
              <Text style={styles.confirmationMessage}>{section.confirmationMessage}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Button title="Generar Datos" onPress={generateData} color="#FFC107" />

      {generatedData && (
        <View style={styles.generatedDataContainer}>
          <ScrollView>
            <Text style={styles.generatedDataText}>{generatedData}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  clientText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityInput: {
    flex: 2,
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  itemContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationMessage: {
    marginTop: 10,
    color: '#28a745',
  },
  generatedDataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  generatedDataText: {
    fontSize: 16,
    color: '#495057',
  },
});
