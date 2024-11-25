import { useState, useEffect } from 'react';
import axios from 'axios';

const useAdmin = (usuarioId) => {
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]); // Estado para los usuarios
  const [cases, setCases] = useState([]); // Estado para los casos
  const [materials, setMaterials] = useState([]); // Estado para los materiales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`http://192.168.50.101:3000/api/rol/${usuarioId}`);
        const rolData = response.data[0]; // Asegúrate de que el rol viene en el primer índice
        console.log(rolData);
        setUserRole(rolData ? rolData.nombre : null);
        setLoading(false);
      } catch (error) {
        setError('Error al obtener el rol del usuario');
        setLoading(false);
      }
    };

    if (usuarioId) {
      fetchUserRole();
    }
  }, [usuarioId]);

  // Obtener usuarios de la base de datos
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://192.168.50.101:3000/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Error al obtener los usuarios');
    }
  };

  // Obtener casos de la base de datos
  const fetchCases = async () => {
    try {
      const response = await axios.get('http://192.168.50.101:3000/api/casos');
      setCases(response.data);
    } catch (err) {
      setError('Error al obtener los casos');
    }
  };

  // Obtener materiales de la base de datos
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://192.168.50.101:3000/api/materials');
      setMaterials(response.data);
    } catch (err) {
      setError('Error al obtener los materiales');
    }
  };

  // Crear un nuevo usuario
  const createUser = async (newUser) => {
    try {
      const response = await axios.post('http://192.168.50.101:3000/api/users', newUser);
      setUsers([...users, response.data]); // Agregar el nuevo usuario a la lista
    } catch (err) {
      setError('Error al crear el usuario');
    }
  };

  // Eliminar un usuario
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://192.168.50.101:3000/api/users/${userId}`);
      setUsers(users.filter(user => user.ID_usuario !== userId)); // Filtrar el usuario eliminado
    } catch (err) {
      setError('Error al eliminar el usuario');
    }
  };

  // Actualizar precios de materiales
  const updateMaterialPrices = async (materialId, newPrice) => {
    try {
      const response = await axios.put(`http://192.168.50.101:3000/api/materials/${materialId}`, { price: newPrice });
      setMaterials(materials.map(material => 
        material.ID_material === materialId ? { ...material, price: newPrice } : material
      ));
    } catch (err) {
      setError('Error al actualizar el precio del material');
    }
  };

  // Listar casos según el rol
  const listCasesByRole = async (roleId) => {
    try {
      const response = await axios.get(`http://192.168.50.101:3000/api/casos/role/${roleId}`);
      setCases(response.data);
    } catch (err) {
      setError('Error al listar los casos por rol');
    }
  };

  // Ejecutar al montar para obtener los usuarios, casos y materiales
  useEffect(() => {
    if (userRole) { // Solo si ya tenemos el rol
      fetchUsers();
      fetchCases();
      fetchMaterials();
    }
  }, [userRole]);

  return {
    userRole,
    users,
    cases,
    materials,
    createUser,
    deleteUser,
    listCasesByRole,
    updateMaterialPrices,
    loading,
    error,
  };
};

export default useAdmin;
