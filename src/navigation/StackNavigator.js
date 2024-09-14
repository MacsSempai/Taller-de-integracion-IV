import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import InspeccionScreen from '../screens/InspeccionScreen';
import CaseDetailScreen from '../screens/CaseDetailScreen';


const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Inspeccion" component={InspeccionScreen} />
      <Stack.Screen name="Detalles" component={CaseDetailScreen} />
    </Stack.Navigator>
  );
}