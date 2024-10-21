import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import LiquidatorCaseScreen from '../screens/LiquidadorScreen';
import InspeccionScreen from '../screens/InspeccionScreen';
import HistorialScreen from '../screens/HistorialScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detalles" component={CaseDetailScreen} />
      <Stack.Screen name="Liquidacion" component={LiquidatorCaseScreen} />
      <Stack.Screen name="Inspeccion" component={InspeccionScreen} />
      <Stack.Screen name="Historial" component={HistorialScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}
