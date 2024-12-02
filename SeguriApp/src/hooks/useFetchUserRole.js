import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchUserRole = (usuarioId) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`http://190.114.253.250:3000/api/rol/${usuarioId}`);
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

  return { userRole, loading, error };
};

export default useFetchUserRole;
