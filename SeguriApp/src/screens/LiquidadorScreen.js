import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { liquidationCase } from '../Casos2'; // Ajusta la ruta según tu estructura de carpetas

const LiquidatorCaseScreen = () => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejected, setIsRejected] = useState(false);

  const { client, contractor, inspector, budget, caseDetails } = liquidationCase;

  const handleApprove = () => {
    Alert.alert('Caso Aprobado', 'El caso ha sido aprobado exitosamente.');
  };

  const handleReject = () => {
    if (!rejectionReason) {
      Alert.alert('Error', 'Por favor, ingresa una razón para el rechazo.');
      return;
    }
    Alert.alert('Caso Rechazado', `El caso ha sido rechazado. Razón: ${rejectionReason}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Detalles del Caso</Text>
      <Text style={styles.detail}>Caso: {caseDetails.caseName}</Text>
      <Text style={styles.detail}>Descripción: {caseDetails.description}</Text>

      <Text style={styles.header}>Datos del Cliente</Text>
      <Text style={styles.detail}>Nombre: {client.name}</Text>
      <Text style={styles.detail}>RUT: {client.rut}</Text>
      <Text style={styles.detail}>Dirección: {client.address}</Text>
      <Text style={styles.detail}>Comuna: {client.comuna}</Text>

      <Text style={styles.header}>Datos del Contratista</Text>
      <Text style={styles.detail}>Nombre: {contractor.name}</Text>
      <Text style={styles.detail}>Porcentaje de Cobro: {contractor.percentage}%</Text>

      <Text style={styles.header}>Datos del Inspector</Text>
      <Text style={styles.detail}>Nombre: {inspector.name}</Text>

      <Text style={styles.header}>Presupuesto</Text>
      <Text style={styles.detail}>Costo de Materiales: ${budget.materialCost}</Text>
      <Text style={styles.detail}>Costo de Mano de Obra: ${budget.laborCost}</Text>
      <Text style={styles.detail}>Costo de Transporte: ${budget.transportationCost}</Text>
      <Text style={styles.detail}>Costo Total: ${budget.totalCost}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Aceptar" onPress={handleApprove} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Rechazar" onPress={() => setIsRejected(true)} />
      </View>

      {isRejected && (
        <View style={styles.rejectionContainer}>
          <Text style={styles.rejectionLabel}>Razón de Rechazo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe la razón del rechazo..."
            value={rejectionReason}
            onChangeText={setRejectionReason}
          />
          <Button title="Enviar Rechazo" onPress={handleReject} />
        </View>
      )}
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
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  rejectionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 5,
  },
  rejectionLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
});

export default LiquidatorCaseScreen;
