import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { setUserRole, setUsuarioId } = useUser(); // Obtén los setters desde el contexto

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.1.4:3000/login', { correo: username, contraseña: password });
      const { userRole, usuarioId } = response.data;
      setUserRole(userRole); // Actualiza el rol del usuario
      setUsuarioId(usuarioId); // Actualiza el ID del usuario
      navigation.navigate('Home');
    }
    catch (error) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Olvidé mi contraseña" onPress={() => navigation.navigate('ForgotPassword')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#fff',
  },
});
