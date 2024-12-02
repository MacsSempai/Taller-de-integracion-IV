import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
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
      const response = await axios.post('http://190.114.253.250:3000/api/users/login', { 
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
          if (userRole === 'Administrador') {
            navigation.navigate('Admin'); // Redirigir automáticamente al Admin
          } else {
            navigation.navigate('Home'); // Redirigir a Home para otros roles
          }
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
      const roleResponse = await axios.get(`http://190.114.253.250:3000/api/rol/${usuarioId}`); // Cambia esta URL según tu API
      return roleResponse.data; // Asegúrate de que esto devuelva el rol correctamente
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      setError('No se pudo obtener el rol del usuario');
      return null; // Devuelve null si hay un error
    }
  };

  return (
    <View style={styles.container}>
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
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {loading ? ( // Mostrar spinner de carga
        <ActivityIndicator color="#6200EE" />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  },
});
