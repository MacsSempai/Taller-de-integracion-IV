import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function EliminarUsuarioScreen() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://190.114.253.250:3000/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Error al obtener los usuarios');
      console.error(err);
    }
  };

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
              await axios.delete(`http://190.114.253.250:3000/api/users/${userId}`);
              setUsers(users.filter((user) => user.ID_usuario !== userId));
              Alert.alert('Éxito', 'Usuario eliminado correctamente.');
            } catch (err) {
              setError('Error al eliminar el usuario');
              console.error(err);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eliminar Usuario</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.ID_usuario.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nombre} {item.apellido}</Text>
            <Button title="Eliminar" onPress={() => deleteUser(item.ID_usuario)} color="#F44336" />
          </View>
        )}
      />
      {error && <Text style={styles.error}>{error}</Text>}
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
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
