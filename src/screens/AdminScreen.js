import React from 'react';
import { View, Text, Button } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function AdminScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Pantalla de Admin</Text>
      <Text style={globalStyles.text}>Esta es la pantalla de Admin.</Text>
    </View>
  );
}