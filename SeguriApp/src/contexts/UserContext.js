import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto del usuario
const UserContext = createContext();
const ClientContext = createContext();
const ContractorContext = createContext();

// Proveer el contexto del usuario
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('Inspector'); // los roles son 'Admin', 'Inspector', 'Cliente', 'Liquidador', 'Contratista'

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Proveer el contexto del cliente
export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [client, setClient] = useState(null); // Estado inicial vacío

  useEffect(() => {
    // Obtener datos del cliente desde la API
    const fetchClientData = async () => {
      try {
        const response = await fetch('/api/client'); // Ajusta la ruta según tu API
        const data = await response.json();
        setClient(data); // Asignar los datos del cliente desde la API
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

// Proveer el contexto de los contratistas
export const useContractors = () => useContext(ContractorContext);

export const ContractorProvider = ({ children }) => {
  const [contractors, setContractors] = useState([]); // Estado inicial vacío

  useEffect(() => {
    // Obtener datos de los contratistas desde la API
    const fetchContractorsData = async () => {
      try {
        const response = await fetch('/api/contractors'); // Ajusta la ruta según tu API
        const data = await response.json();
        setContractors(data); // Asignar los datos de los contratistas desde la API
      } catch (error) {
        console.error('Error fetching contractors data:', error);
      }
    };

    fetchContractorsData();
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <ContractorContext.Provider value={{ contractors, setContractors }}>
      {children}
    </ContractorContext.Provider>
  );
};
