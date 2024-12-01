import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function CrearUsuarioScreen() {
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    contrasena: '',
    direccion: '',
    comuna: '',
    ID_rol: '',
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  // Obtener la lista de roles desde la API
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://190.114.253.250:3000/api/rol');
      setRoles(response.data);
    } catch (err) {
      console.error('Error al obtener los roles:', err);
      setError('Error al cargar los roles. Por favor, intenta nuevamente.');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Confirmar la creación de usuario
  const confirmCreateUser = () => {
    if (!newUser.ID_rol) {
      Alert.alert('Error', 'Por favor, selecciona un rol.');
      return;
    }
    Alert.alert(
      'Confirmar Creación',
      `Nombre: ${newUser.nombre}\nApellido: ${newUser.apellido}\nCorreo: ${newUser.correo}\nCelular: ${newUser.celular}\nDirección: ${newUser.direccion}\nComuna: ${newUser.comuna}\nRol (ID): ${newUser.ID_rol}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: createUser },
      ]
    );
  };

  // Crear el usuario
  const createUser = async () => {
    try {
      await axios.post('http://190.114.253.250:3000/api/users', newUser);
      Alert.alert('Éxito', 'Usuario creado correctamente.');
      setNewUser({
        nombre: '',
        apellido: '',
        correo: '',
        celular: '',
        contrasena: '',
        direccion: '',
        comuna: '',
        ID_rol: '',
      });
    } catch (err) {
      console.error('Error al crear el usuario:', err);
      Alert.alert('Error', 'No se pudo crear el usuario. Por favor, intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Usuario</Text>
      <TextInput
        placeholder="Nombre"
        value={newUser.nombre}
        onChangeText={(value) => setNewUser({ ...newUser, nombre: value })}
        style={styles.input}
      />
      <TextInput
        placeholder="Apellido"
        value={newUser.apellido}
        onChangeText={(value) => setNewUser({ ...newUser, apellido: value })}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo"
        value={newUser.correo}
        onChangeText={(value) => setNewUser({ ...newUser, correo: value })}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Celular"
        value={newUser.celular}
        onChangeText={(value) => setNewUser({ ...newUser, celular: value })}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Dirección"
        value={newUser.direccion}
        onChangeText={(value) => setNewUser({ ...newUser, direccion: value })}
        style={styles.input}
      />
      <TextInput
        placeholder="Comuna"
        value={newUser.comuna}
        onChangeText={(value) => setNewUser({ ...newUser, comuna: value })}
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={newUser.contrasena}
        onChangeText={(value) => setNewUser({ ...newUser, contrasena: value })}
        style={styles.input}
      />

      {/* Picker para seleccionar el rol */}
      <Text style={styles.label}>Rol del Usuario:</Text>
      <Picker
        selectedValue={newUser.ID_rol}
        onValueChange={(value) => setNewUser({ ...newUser, ID_rol: value })}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona un rol" value="" />
        {roles.map((role) => (
          <Picker.Item key={role.ID_rol} label={role.nombre_rol} value={role.ID_rol} />
        ))}
      </Picker>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Crear Usuario" onPress={confirmCreateUser} color="#4CAF50" />
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
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
