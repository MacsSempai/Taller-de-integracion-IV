import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function AdminScreen() {
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    contrasena: '',
    direccion: '',
    comuna: '',
    ID_rol: ''
  });
  const [materialId, setMaterialId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [users, setUsers] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [casos, setCasos] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  const { width, height } = Dimensions.get('window'); // Para obtener el ancho y altura de la pantalla

  // Función para confirmar la creación de un nuevo usuario
  const confirmCreateUser = () => {
    Alert.alert(
      'Confirmar Creación',
      `Nombre: ${newUser.nombre}\nApellido: ${newUser.apellido}\nCorreo: ${newUser.correo}\nCelular: ${newUser.celular}\nDirección: ${newUser.direccion}\nComuna: ${newUser.comuna}\nRol (ID): ${newUser.ID_rol}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: createUser }
      ]
    );
  };

  // Función para crear un nuevo usuario
  const createUser = async () => {
    try {
      const response = await axios.post('http://192.168.55.1:3000/api/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({
        nombre: '',
        apellido: '',
        correo: '',
        celular: '',
        contrasena: '',
        direccion: '',
        comuna: '',
        ID_rol: ''
      });
      Alert.alert('Éxito', 'Usuario creado correctamente.');
    } catch (err) {
      setError('Error al crear el usuario');
      Alert.alert('Error', 'Hubo un problema al crear el usuario.');
      console.error(err);
    }
  };

  // Función para eliminar un usuario con confirmación
  const deleteUser = async (userId) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.55.1:3000/api/users/${userId}`);
              setUsers(users.filter((user) => user.ID_usuario !== userId));
              Alert.alert('Éxito', 'Usuario eliminado correctamente.');
            } catch (err) {
              setError('Error al eliminar el usuario');
              Alert.alert('Error', 'Hubo un problema al eliminar el usuario.');
              console.error(err);
            }
          }
        }
      ]
    );
  };

  // Función para confirmar el cambio de precio de material
  const confirmUpdateMaterialPrice = () => {
    Alert.alert(
      'Confirmar Cambio de Precio',
      `ID Material: ${materialId}\nNuevo Precio: ${newPrice}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => updateMaterialPrices(materialId, newPrice) }
      ]
    );
  };

  // Función para actualizar el precio del material
  const updateMaterialPrices = async (materialId, newPrice) => {
    try {
      await axios.put(`http://192.168.55.1:3000/api/materiales/${materialId}`, { price: newPrice });
      setMaterialId('');
      setNewPrice('');
      Alert.alert('Éxito', 'Precio de material actualizado correctamente.');
    } catch (err) {
      setError('Error al actualizar el precio del material');
      Alert.alert('Error', 'Hubo un problema al actualizar el precio del material.');
      console.error(err);
    }
  };

  // Función para obtener los casos de un usuario
  const listCasesByUser = async (userId) => {
    try {
      const response = await axios.get(`http://192.168.55.1:3000/api/casos/${userId}/usuario`);
      setCasos(response.data);
    } catch (err) {
      setError('Error al obtener los casos');
      console.error(err);
    }
  };

  // Función para listar los materiales
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://192.168.55.1:3000/api/materiales');
      setMateriales(response.data);
    } catch (err) {
      setError('Error al obtener los materiales');
      console.error(err);
    }
  };

  // Función para listar los roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://192.168.55.1:3000/api/rol');
      setRoles(response.data);
    } catch (err) {
      setError('Error al obtener los roles');
      console.error(err);
    }
  };

  // Función para listar los usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://192.168.55.1:3000/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Error al obtener los usuarios');
      console.error(err);
    }
  };

  // Obtener todos los datos al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchMaterials();
    fetchRoles();
  }, []);

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={[styles.container, { width: width > 600 ? '80%' : '100%', alignSelf: 'center' }]}>
        <Text style={styles.title}>Panel de Administración</Text>

        {/* Crear Usuario */}
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
        <Picker
          selectedValue={newUser.ID_rol}
          onValueChange={(value) => setNewUser({ ...newUser, ID_rol: value })}
          style={styles.input}
        >
          <Picker.Item label="Selecciona un rol" value="" />
          {roles.map((role) => (
            <Picker.Item key={role.ID_rol} label={role.nombre_rol} value={role.ID_rol} />
          ))}
        </Picker>
        <Button title="Crear Usuario" onPress={confirmCreateUser} color="#4CAF50" />

        {/* Eliminar Usuario */}
        <Text style={styles.sectionTitle}>Eliminar Usuario</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => (item.ID_usuario ? item.ID_usuario.toString() : Math.random().toString())}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.nombre} {item.apellido} (Rol ID: {item.ID_rol})</Text>
              <Button title="Eliminar" onPress={() => deleteUser(item.ID_usuario)} color="#F44336" />
            </View>
          )}
        />

        {/* Actualizar Precio de Material */}
        <Text style={styles.sectionTitle}>Actualizar Precio de Material</Text>
        <TextInput
          placeholder="ID Material"
          value={materialId}
          onChangeText={(value) => setMaterialId(value)}
          style={styles.input}
        />
        <TextInput
          placeholder="Nuevo Precio"
          value={newPrice}
          onChangeText={(value) => setNewPrice(value)}
          style={styles.input}
        />
        <Button title="Actualizar Precio" onPress={confirmUpdateMaterialPrice} color="#2196F3" />

        {/* Ver Casos por Usuario */}
        <Text style={styles.sectionTitle}>Ver Casos de Usuario</Text>
        <Picker
          selectedValue={selectedUser}
          onValueChange={(value) => {
            setSelectedUser(value);
            listCasesByUser(value);
          }}
          style={styles.input}
        >
          <Picker.Item label="Selecciona un usuario" value="" />
          {users.map((user) => (
            <Picker.Item key={user.ID_usuario} label={`${user.nombre} ${user.apellido}`} value={user.ID_usuario} />
          ))}
        </Picker>

        <FlatList
          data={casos}
          keyExtractor={(item) => item.ID_caso.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.tipo_siniestro}: {item.descripcion_siniestro}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#555',
  },
  listItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
});

