import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function HomeScreen({ navigation }) {
  const { userRole } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Página Principal</Text>

      {userRole === 'Admin' && (
        <Button
          title="Ir a Pantalla de Admin"
          onPress={() => navigation.navigate('Admin')}
        />
      )}

      <Button
        title="Abrir Inspección"
        onPress={() => navigation.navigate('Inspeccion')}
      />
    </View>
  );
}
