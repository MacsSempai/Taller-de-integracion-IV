import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const CaseDetailScreen = () => {
  const { caseName, description, assignedContractor, inspectorName, transportationCost, sectors } = caseDetails;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{caseName}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.detail}>Contratista Asignado: {assignedContractor}</Text>
      <Text style={styles.detail}>Inspector: {inspectorName}</Text>
      <Text style={styles.detail}>Costo de Transporte: ${transportationCost}</Text>

      {sectors.map((sector, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{sector.name}</Text>
          <Text>Tipo de Daño: {sector.damageType}</Text>
          <Text>Porcentaje de Pérdida: {sector.lossPercentage}%</Text>
          <Text>Total del Costo: ${sector.totalCost}</Text>

          {sector.subsectors.map((subsector, subIndex) => (
            <View key={subIndex} style={styles.subsectorContainer}>
              <Text style={styles.subsectorHeader}>Subsector {subIndex + 1}</Text>
              <Text>Material: {subsector.material}</Text>
              <Text>Cantidad: {subsector.quantity}</Text>
              <Text>Costo de Material: ${subsector.materialCost}</Text>
              <Text>Tipo de Trabajo: {subsector.workType}</Text>
              <Text>Costo de Trabajo: ${subsector.workCost}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subsectorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
  },
  subsectorHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default CaseDetailScreen;
