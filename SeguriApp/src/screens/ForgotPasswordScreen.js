import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

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
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Recuperar Contraseña" onPress={handlePasswordReset} />
      <Button title="Volver al Login" onPress={() => navigation.navigate('Login')} />
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
