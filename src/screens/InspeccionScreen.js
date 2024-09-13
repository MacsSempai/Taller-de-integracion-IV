import React, { useState } from 'react';
import { View, Button, StyleSheet, ScrollView, TextInput, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import dataJson from '../elementos.json';
import { useClient } from '../contexts/ClientContext'; // Importar el hook del contexto del cliente

export default function DetailsScreen({ navigation }) {
  const { client } = useClient();  // Obtener los datos del cliente desde el contexto

  const [sections, setSections] = useState([
    { name: '', realCounts: {}, tempData: {}, confirmationMessage: '', selectedSection: Object.keys(dataJson)[0] }
  ]);

  const [generatedData, setGeneratedData] = useState(null);

  const handleInputChange = (key, value, sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].realCounts[key] = value;
    setSections(newSections);
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

  const generateData = () => {
    let dataString = `Cliente: ${client.nombre}\nRUT: ${client.rut}\nDirección: ${client.direccion}\nComuna: ${client.comuna}\n\n`;

    sections.forEach((section, index) => {
      dataString += `Sección: ${section.name || `Sección ${index + 1}`}\n`;
      Object.keys(section.tempData).forEach((key) => {
        dataString += `${key}: ${section.tempData[key]}\n`;
      });
      dataString += '\n';
    });

    setGeneratedData(dataString);
  };

  return (
    <View style={styles.container}>
      <Text>{`Nombre: ${client.nombre}`}</Text>
      <Text>{`RUT: ${client.rut}`}</Text>
      <Text>{`Dirección: ${client.direccion}`}</Text>
      <Text>{`Comuna: ${client.comuna}`}</Text>
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
      <Button title="Generar Datos" onPress={generateData} />
      {generatedData && (
        <ScrollView style={styles.generatedDataContainer}>
          <Text>{generatedData}</Text>
        </ScrollView>
      )}
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
  },
  sectorInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  confirmationMessage: {
    color: 'green',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    width: '30%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
  },
  itemHeader: {
    fontWeight: 'bold',
  },
  generatedDataContainer: {
    marginTop: 20,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
  },
});
