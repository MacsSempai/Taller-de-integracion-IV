import React, { useState } from 'react';
<<<<<<< HEAD
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
=======
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
>>>>>>> origin/MSierra

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (email) {
      try {
        const response = await fetch('https://tubackend.com/api/recover-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(`Se envió un enlace de recuperación a: ${email}`);
        } else {
          alert(data.message || 'Hubo un problema al intentar recuperar la contraseña.');
        }
      } catch (error) {
        alert('Error de conexión, intenta de nuevo.');
        console.error('Error:', error);
      }
    } else {
      alert('Por favor ingresa tu correo electrónico');
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
=======
      <Text style={styles.title}>Recuperar Contraseña</Text>
>>>>>>> origin/MSierra
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
<<<<<<< HEAD
      <Button title="Recuperar Contraseña" onPress={handlePasswordReset} />
      <Button title="Volver al Login" onPress={() => navigation.navigate('Login')} />
=======
      <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
        <Text style={styles.resetButtonText}>Recuperar Contraseña</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backButtonText}>Volver al Login</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
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
    elevation: 2, // sombra para dar profundidad
  },
  resetButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3, // sombra para el botón
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ccc', // fondo gris para el botón de volver
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
>>>>>>> origin/MSierra
  },
});
