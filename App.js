import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';  // Importa el stack de navegación
import { UserProvider, ClientProvider, ContractorProvider } from './src/contexts/UserContext'; // Importa los proveedores de contexto

export default function App() {
  return (
    <UserProvider>
      <ClientProvider>
        <ContractorProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </ContractorProvider>
      </ClientProvider>
    </UserProvider>
  );
}