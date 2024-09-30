import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Importa el contexto
import axios from 'axios';
import useFetchUserRole from '../hooks/useFetchUserRole'; // Importa el hook personalizado

export default function HistorialScreen({ navigation }) {
  const { usuarioId } = useUser(); // Accede al usuarioId desde el contexto
  const { userRole, loading: roleLoading, error: roleError } = useFetchUserRole(usuarioId); // Usa el hook personalizado
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCasos = async () => {
      try {
        const response = await axios.get(`http://192.168.50.101:3000/casos/${usuarioId}`);
        // Filtra los casos que no están en estado "abierto" o "aceptado"
        const casosFiltrados = response.data.filter(
          (caso) => caso.estado !== 'abierto' && caso.estado !== 'aceptado'
        );
        setCasos(casosFiltrados);
        setError(null);
      } catch (error) {
        console.error('Error al obtener los casos', error);
        setError('Hubo un problema al obtener los casos. Por favor, intenta nuevamente.');
      }
    };

    if (usuarioId) {
      fetchCasos(); // Llama a la función para obtener los casos filtrados
    }
  }, [usuarioId]);

  // Si ocurre un error en la carga del rol, lo manejamos aquí
  if (roleError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{roleError}</Text>
      </View>
    );
  }

  // Mostrar indicador de carga mientras se obtiene el rol del usuario
  if (roleLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.infoText}>Cargando rol del usuario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (casos.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.infoText}>No se encontraron casos en el historial.</Text>
      </View>
    );
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'cerrado':
        return '#95a5a6'; // Gris
      case 'rechazado':
        return '#e74c3c'; // Rojo
      default:
        return '#bdc3c7'; // Color por defecto
    }
  };

  const handleNavigation = (item) => {
    switch (userRole) {
      case 'cliente':
        navigation.navigate('Detalles', { casoId: item.id, clienteId: item.cliente_id });
        break;
      default:
        console.error('Rol no válido para el historial:', userRole);
    }
  };

  return (
    <View style={styles.container}>
      {/* Si el caso tiene de estado abierto o aceptado no se muestra */}
        <FlatList
            data={casos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <TouchableOpacity
                style={[styles.caseButton, item.estado === 'cerrado' ? styles.disabledButton : null]}
                onPress={() => handleNavigation(item)}
                disabled={item.estado === 'cerrado'}
            >
                <View style={styles.caseContent}>
                <Text style={styles.caseDescription}>{item.descripcion}</Text>
                <View style={[styles.statusBox, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                </View>
                </View>
            </TouchableOpacity>
            )}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  caseButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  caseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  caseDescription: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  statusBox: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
});
