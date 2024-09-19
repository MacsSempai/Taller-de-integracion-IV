import React, { useState } from 'react'; 
import { View, TextInput, Button, StyleSheet, Text } from 'react-native'; 
 
export default function LoginScreen({ navigation }) { 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
 
  const handleLogin = () => { 
    if (username === 'admin' && password === 'password') { 
      navigation.navigate('Home'); 
    } else { 
      alert('Credenciales incorrectas'); 
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
    </View> 
  ); 
} 
 
const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
  }, 
  input: { 
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    marginBottom: 20, 
    paddingHorizontal: 10, 
  }, 
}); 
