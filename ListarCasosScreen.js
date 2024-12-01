import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function ListarCasosScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [casos, setCasos] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://190.114.253.250:3000/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error al obtener los usuarios:', err);
    }
  };

  // Obtener roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://190.114.253.250:3000/api/rol');
      setRoles(response.data);
    } catch (err) {
      console.error('Error al obtener los roles:', err);
    }
  };

  // Obtener casos de un usuario
  const fetchCasesByUser = async (userId) => {
    try {
      const response = await axios.get(`http://190.114.253.250:3000/api/casos/${userId}/usuario`);
      setCasos(response.data);
    } catch (err) {
      console.error('Error al obtener los casos:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Filtrar usuarios por el rol seleccionado
  const filteredUsers = selectedRole
    ? users.filter((user) => user.ID_rol === selectedRole)
    : users;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listar Casos de Usuario</Text>

      {/* Selector de Rol */}
      <Text style={styles.label}>Selecciona un rol:</Text>
      <Picker
        selectedValue={selectedRole}
        onValueChange={(value) => setSelectedRole(value)}
        style={styles.picker}
      >
        <Picker.Item label="Todos los roles" value="" />
        {roles.map((role) => (
          <Picker.Item key={role.ID_rol} label={role.nombre_rol} value={role.ID_rol} />
        ))}
      </Picker>

      {/* Selector de Usuario */}
      <Text style={styles.label}>Selecciona un usuario:</Text>
      <Picker
        selectedValue={selectedUser}
        onValueChange={(value) => {
          setSelectedUser(value);
          fetchCasesByUser(value);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona un usuario" value="" />
        {filteredUsers.map((user) => (
          <Picker.Item key={user.ID_usuario} label={user.nombre} value={user.ID_usuario} />
        ))}
      </Picker>

      {/* Lista de Casos */}
      <Text style={styles.label}>Casos del Usuario:</Text>
      <FlatList
        data={casos}
        keyExtractor={(item) => item.ID_caso.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.casoText}>
              {item.tipo_siniestro}: {item.descripcion_siniestro}
            </Text>
            <Button
              title="Ver Detalles"
              onPress={() => navigation.navigate("Detalles", { casoId: item.ID_caso })}
              color="#2196F3"
            />
          </View>
        )}
      />
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
  listItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'column',
  },
  casoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
