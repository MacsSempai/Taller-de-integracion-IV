import React, { useState } from 'react';
<<<<<<< HEAD
import { View, TextInput, Button, StyleSheet } from 'react-native';
=======
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
>>>>>>> origin/MSierra
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
<<<<<<< HEAD
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
=======
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga
  const { setUsuarioId, setUserRole } = useUser(); // Unifica el uso del contexto

  const handleLogin = async () => {
    setLoading(true); // Iniciar carga
    setError(null); // Resetear error al intentar login
    try {
      console.log('Iniciando login...');
      const response = await axios.post('http://192.168.50.101:3000/api/users/login', { 
        email, 
        password 
      });
      
      console.log('Respuesta de login:', response.data);
      const usuarioId = response.data.user.id; // Obtener el ID del usuario
      console.log('ID del usuario:', usuarioId);
      if (usuarioId) {
        const userRole = await fetchUserRole(usuarioId); // Llama a la función para obtener el rol
        console.log('Rol del usuario:', userRole);
        if (userRole) {
          setUsuarioId(usuarioId);
          setUserRole(userRole);
          navigation.navigate('Home');
        } else {
          setError('No se encontraron los datos del rol');
        }
      } else {
        setError('No se encontraron los datos del usuario');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false); // Detener carga
    }
  };

  const fetchUserRole = async (usuarioId) => {
    try {
      const roleResponse = await axios.get(`http://192.168.50.101:3000/api/rol/${usuarioId}`); // Cambia esta URL según tu API
      return roleResponse.data; // Asegúrate de que esto devuelva el rol correctamente
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      setError('No se pudo obtener el rol del usuario');
      return null; // Devuelve null si hay un error
>>>>>>> origin/MSierra
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
=======
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none" // Para evitar que se capitalice el correo
        keyboardType="email-address" // Teclado para correos
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
>>>>>>> origin/MSierra
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
<<<<<<< HEAD
      <Button title="Login" onPress={handleLogin} />
      <Button title="Olvidé mi contraseña" onPress={() => navigation.navigate('ForgotPassword')} />
=======
      {error && <Text style={styles.errorText}>{error}</Text>}
      {loading ? ( // Mostrar spinner de carga
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
>>>>>>> origin/MSierra
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
<<<<<<< HEAD
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
=======
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 16,
    elevation: 2, // sombra
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3, // sombra para el botón
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#6200EE',
    fontSize: 16,
    marginTop: 10,
>>>>>>> origin/MSierra
  },
});
