import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Crear el contexto del usuario
const UserContext = createContext();
const ClientContext = createContext();
const ContractorContext = createContext();
const AdminContext = createContext();

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
  const [userRole, setUserRole] = useState(''); // Roles: 'Admin', 'Inspector', 'Cliente', 'Liquidador', 'Contratista'
  const [usuarioId, setUsuarioId] = useState(''); // ID del usuario

  return (
    <UserContext.Provider value={{ userRole, setUserRole, usuarioId, setUsuarioId }}>
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

// Admin Context (Nuevo)
export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Crear usuario
  const createUser = async (userData) => {
    try {
      const response = await axios.post('/admin/create-user', userData);
      setUsers([...users, response.data.user]);
    } catch (err) {
      console.error('Error creando usuario:', err);
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/admin/delete-user/${userId}`);
      setUsers(users.filter(user => user.ID_usuario !== userId));
    } catch (err) {
      console.error('Error eliminando usuario:', err);
    }
  };

  // Listar casos por rol
  const listCasesByRole = async (roleId) => {
    try {
      const response = await axios.get(`/admin/list-cases/${roleId}`);
      setCases(response.data);
    } catch (err) {
      console.error('Error listando casos:', err);
    }
  };

  // Actualizar precios de materiales
  const updateMaterialPrices = async (materialId, newPrice) => {
    try {
      const response = await axios.put(`/admin/update-material/${materialId}`, { price: newPrice });
      setMaterials(materials.map(material => material.ID_material === materialId ? { ...material, precio: newPrice } : material));
    } catch (err) {
      console.error('Error actualizando precio de material:', err);
    }
  };

  return (
    <AdminContext.Provider value={{ users, cases, materials, createUser, deleteUser, listCasesByRole, updateMaterialPrices }}>
      {children}
    </AdminContext.Provider>
  );
};

