import React, { createContext, useState, useContext } from 'react';

// Datos de prueba del cliente
const defaultClient = {
  nombre: 'Juan Pérez',
  rut: '23.423.492-7',
  direccion: 'Calle Falsa 123',
  comuna: 'Temuco'
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
