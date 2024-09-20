import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { globalStyles } from '../styles/globalStyles'; // Importa los estilos globales

export default function HomeScreen({ navigation }) {
  const { userRole } = useUser();

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Página Principal</Text>
      
      {userRole === 'Admin' && (
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={globalStyles.buttonText}>Ir a Pantalla de Admin</Text>
        </TouchableOpacity>
      )}

  {userRole === 'Inspector' && (
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Inspeccion')}
        >
          <Text style={globalStyles.buttonText}>Ir a Pantalla de Inspección</Text>
        </TouchableOpacity>
      )}
  
  {userRole === 'Liquidador' && (
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Liquidacion')}
        >
          <Text style={globalStyles.buttonText}>Ir a Pantalla de Liquidación</Text>
        </TouchableOpacity>
      )}
  
  {userRole === 'Asegurado' && (
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Asegurado')}
        >
          <Text style={globalStyles.buttonText}>Ir a Pantalla de Asegurado</Text>
        </TouchableOpacity>
      )}
  
  {userRole === 'Contratista' && (
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Contratista')}
        >
          <Text style={globalStyles.buttonText}>Ir a Pantalla de Contratista</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
