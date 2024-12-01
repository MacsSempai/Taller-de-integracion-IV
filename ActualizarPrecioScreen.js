import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ActualizarPrecioScreen() {
  const [materiales, setMateriales] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // Obtener la lista de materiales
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://190.114.253.250:3000/api/materiales');
      setMateriales(response.data);
    } catch (err) {
      console.error('Error al obtener los materiales:', err);
    }
  };

  // Confirmar el cambio de precio
  const confirmUpdateMaterialPrice = () => {
    if (!selectedMaterial || newPrice === '') {
      Alert.alert('Error', 'Selecciona un material y escribe un nuevo precio.');
      return;
    }
    Alert.alert(
      'Confirmar Cambio de Precio',
      `Material: ${selectedMaterial.nombre}\nPrecio Actual: ${selectedMaterial.precio}\nNuevo Precio: ${newPrice}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: updateMaterialPrice }
      ]
    );
  };

  // Actualizar el precio del material
  const updateMaterialPrice = async () => {
    try {
      await axios.put(`http://190.114.253.250:3000/api/materiales/${selectedMaterial.ID_material}`, {
        precio: newPrice,
      });
      Alert.alert('Éxito', 'Precio del material actualizado correctamente.');
      // Actualizar localmente el precio del material
      setMateriales((prevMateriales) =>
        prevMateriales.map((mat) =>
          mat.ID_material === selectedMaterial.ID_material
            ? { ...mat, precio: newPrice }
            : mat
        )
      );
      setSelectedMaterial(null);
      setNewPrice('');
    } catch (err) {
      console.error('Error al actualizar el precio:', err);
      Alert.alert('Error', 'No se pudo actualizar el precio del material.');
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Precio de Material</Text>
      <FlatList
        data={materiales}
        keyExtractor={(item) => item.ID_material.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nombre}</Text>
            <Button
              title="Seleccionar"
              onPress={() => {
                setSelectedMaterial(item);
                setNewPrice(''); // Limpiar el campo de precio nuevo
              }}
              color="#2196F3"
            />
          </View>
        )}
      />
      {selectedMaterial && (
        <View style={styles.form}>
          <Text style={styles.selectedTitle}>Material Seleccionado:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0' }]}
            value={selectedMaterial.precio.toString()}
            editable={false}
          />
          <TextInput
            placeholder="Nuevo Precio"
            style={styles.input}
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="numeric"
          />
          <Button title="Actualizar Precio" onPress={confirmUpdateMaterialPrice} color="#4CAF50" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
  },
  form: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    elevation: 2,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
