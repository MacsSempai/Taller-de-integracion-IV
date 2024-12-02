import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { usuarioId, userRole } = useUser();
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  // Configura el ícono en el encabezado
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Perfil')}
          style={styles.headerMenu}
        >
          <MaterialIcons name="menu" size={28} color="#3498db" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Función para obtener los casos filtrados por usuario
  const fetchCasosPorUsuario = async () => {
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/casos/${usuarioId}/usuario`);
      const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() !== 'cerrado');
      setCasos(casosFiltrados);
      setError(null);
    } catch (error) {
      setError('Hubo un problema al obtener los casos. Por favor, intenta nuevamente.');
    }
  };

  // Función para obtener todos los casos
  const fetchTodosLosCasos = async () => {
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/casos`);
      const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() !== 'cerrado');
      setCasos(casosFiltrados);
      setError(null);
    } catch (error) {
      setError('Hubo un problema al obtener todos los casos. Por favor, intenta nuevamente.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (usuarioId) {
        if (userRole === 'Liquidador') {
          fetchTodosLosCasos();
        } else {
          fetchCasosPorUsuario();
        }
      }
    }, [usuarioId, userRole])
  );

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierto':
        return '#3498db';
      case 'cerrado':
        return '#95a5a6';
      case 'aceptado':
        return '#2ecc71';
      case 'rechazado':
        return '#e74c3c';
      default:
        return '#bdc3c7';
    }
  };

  const getEstadoNombre = (estadoId) => {
    const estados = {
      1: 'Abierto',
      2: 'Cerrado',
      3: 'Aceptado',
      4: 'Rechazado',
    };
    return estados[estadoId] || 'Desconocido';
  };

  const handleNavigation = (item) => {
    switch (userRole) {
      case 'Cliente':
        navigation.navigate('Detalles', { casoId: item.ID_caso });
        break;
      case 'Inspector':
        navigation.navigate('Inspeccion', { casoId: item.ID_caso });
        break;
      case 'Liquidador':
        navigation.navigate('Liquidacion', { casoId: item.ID_caso });
        break;
      case 'Contratista':
        navigation.navigate('Contratista', { casoId: item.ID_caso });
        break;
      default:
        console.error('Rol no válido:', userRole);
    }
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{error}</Text>
        </View>
      ) : (
        casos.length === 0 ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>No se encontraron casos para mostrar.</Text>
          </View>
        ) : (
          <FlatList
            data={casos}
            keyExtractor={(item) => item.ID_caso.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.caseButton}
                onPress={() => handleNavigation(item)}
              >
                <View style={styles.caseContent}>
                  <Text style={styles.caseDescription}>{item.descripcion_siniestro}</Text>
                  <View style={[styles.statusBox, { backgroundColor: getEstadoColor(getEstadoNombre(item.ID_estado).toLowerCase()) }]}>
                    <Text style={styles.statusText}>{getEstadoNombre(item.ID_estado)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      )}

      {userRole === 'Cliente' && (
        <TouchableOpacity
          style={styles.newCaseButton}
          onPress={() => navigation.navigate('AbrirCaso')}
        >
          <Text style={styles.newCaseButtonText}>Abrir Nuevo Caso</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f7f7f7',
  },
  headerMenu: {
    marginRight: 15,
  },
  headerBack: {
    marginLeft: 10,
  },
  caseButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  newCaseButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  newCaseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
