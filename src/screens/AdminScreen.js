import React from 'react';
import { View, Text, Button } from 'react-native';

export default function AdminScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pantalla de Admin</Text>
      <Button
        title="Volver a Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}