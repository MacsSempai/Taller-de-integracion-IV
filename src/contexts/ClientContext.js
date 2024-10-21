import React, { createContext, useState, useContext } from 'react';

// Datos de prueba del cliente
const defaultClient = {
  nombre: 'Cliente Ejemplo',
  rut: '87654321-0',
  direccion: 'Calle Falsa 123',
  comuna: 'Springfield'
};

// Crear el contexto del cliente
const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [client, setClient] = useState(defaultClient);

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

// Hook para acceder al contexto del cliente
export const useClient = () => {
  return useContext(ClientContext);
};
