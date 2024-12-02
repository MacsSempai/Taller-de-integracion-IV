import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Importa el contexto
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Importa el Picker

export default function AbrirCasoScreen({ navigation }) {
  const { usuarioId } = useUser();
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState(''); // Estado para el tipo de siniestro
  const [loading, setLoading] = useState(false);

  const handleAbrirCaso = async () => {
    if (!descripcion) {
      Alert.alert('Error', 'Por favor ingresa una descripción del siniestro.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://190.114.253.250:3000/api/casos/nuevo', {
        tipo_siniestro: tipo,
        descripcion_siniestro: descripcion,
        ID_usuario: usuarioId,
        ID_contratista: "6"
      });

      Alert.alert('Éxito', 'El caso ha sido abierto exitosamente.');
      setTipo('');
      setDescripcion('');
      navigation.navigate('Home'); // Navega de vuelta a la pantalla principal
    } catch (error) {
      console.error('Error al abrir el caso:', error);
      Alert.alert('Error', 'Hubo un problema al abrir el caso. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Siniestro</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(itemValue) => setTipo(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione un tipo de siniestro" value="" />
          <Picker.Item label="Accidente de tráfico" value="accidente_trafico" />
          <Picker.Item label="Incendio" value="incendio" />
          <Picker.Item label="Robo" value="robo" />
          <Picker.Item label="Daño por agua" value="danio_agua" />
          <Picker.Item label="Otros" value="otros" />
        </Picker>
      </View>

      <Text style={styles.label}>Descripción del Siniestro</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe el siniestro..."
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAbrirCaso}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Abrir Caso</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 150,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
