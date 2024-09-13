import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';  // Importa el stack de navegación
import { UserProvider } from './src/contexts/UserContext';      // Importa el contexto de usuario
import { ClientProvider } from './src/contexts/ClientContext'; // Importa el contexto de cliente

export default function App() {
  return (
    <UserProvider>
      <ClientProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </ClientProvider>
    </UserProvider>
  );
}