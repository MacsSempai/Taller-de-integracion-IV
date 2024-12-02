import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Asegúrate de tener instalada esta librería

export default function AdminHomeScreen({ navigation }) {
  // Configura el ícono en el encabezado
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcons
          name="menu"
          size={28}
          color="#333"
          style={{ marginRight: 15 }}
          onPress={() => navigation.navigate('Perfil')}
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Crear Usuario"
          onPress={() => navigation.navigate('CrearUsuario')}
          color="#4CAF50"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Eliminar Usuario"
          onPress={() => navigation.navigate('EliminarUsuario')}
          color="#F44336"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Actualizar Precio de Material"
          onPress={() => navigation.navigate('ActualizarPrecio')}
          color="#2196F3"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Listar Casos de Usuario"
          onPress={() => navigation.navigate('ListarCasos')}
          color="#FF9800"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 15,
    width: '80%',
  },
});
