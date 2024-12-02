import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const VerifyCodeScreen = ({ route }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación.');
      return;
    }

    if (code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      Alert.alert('Error', 'El código debe tener 6 caracteres alfanuméricos.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://190.114.253.250:3000/api/password/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        setIsCodeVerified(true);
      } else {
        Alert.alert('Error', data.message || 'Código incorrecto.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error al verificar el código:', error.message || error);
      Alert.alert('Error', 'No se pudo verificar el código. Inténtalo nuevamente.');
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://190.114.253.250:3000/api/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error al cambiar la contraseña:', error.message || error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Inténtalo nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      {!isCodeVerified ? (
        <>
          <Text style={styles.title}>Verificar Código</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eaeaea' }]}
            value={email}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Código de verificación"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Verificar Código" onPress={handleVerifyCode} />
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Restablecer Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Cambiar Contraseña" onPress={handleResetPassword} />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});

export default VerifyCodeScreen;
