import React, { createContext, useState, useContext } from 'react';

// Crear el contexto del usuario
const UserContext = createContext();
const ClientContext = createContext();
const ContractorContext = createContext();

const defaultClient = {
  nombre: 'Juan Pérez',
  rut: '23.423.492-7',
  direccion: 'Calle Falsa 123',
  comuna: 'Temuco'
};

const defaultContractors = [
  { id: '1', name: 'Contratista A', percentage: 10, transportationCost: 10, areas: ['Fisuras', 'Area2'] },
  { id: '2', name: 'Contratista B', percentage: 15, transportationCost: 15, areas: ['Fisuras', 'Area3'] }
];

// Proveer el contexto del usuario
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('Cliente'); // los roles son 'Admin','Inspector', 'Cliente', 'Liquidador' y 'Contratista'

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Proveer el contexto del cliente
export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [client, setClient] = useState(defaultClient);

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

// Proveer el contexto de los contratistas
export const useContractors = () => useContext(ContractorContext);

export const ContractorProvider = ({ children }) => {
  const [contractors, setContractors] = useState(defaultContractors);

  return (
    <ContractorContext.Provider value={{ contractors, setContractors }}>
      {children}
    </ContractorContext.Provider>
  );
};
