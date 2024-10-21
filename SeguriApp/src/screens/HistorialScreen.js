import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Importa el contexto
import axios from 'axios';

export default function HistorialScreen({ navigation }) {
  const { usuarioId, userRole } = useUser();
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCasos = async () => {
      try {
        const response = await axios.get(`http://192.168.1.11:3000/api/casos/${usuarioId}/usuario`);
        console.log('Casos:', response.data);
        // Filtrar casos para solo mostrar los que están "Cerrados"
        const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() === 'cerrado');
        setCasos(casosFiltrados);
        setError(null);
      } catch (error) {
        console.error('Error al obtener los casos', error);
        setError('Hubo un problema al obtener los casos. Por favor, intenta nuevamente.');
      }
    };

    if (usuarioId) {
      fetchCasos(); // Llama a la función para obtener los casos
    }
  }, [usuarioId]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierto':
        return '#3498db'; // Azul
      case 'cerrado':
        return '#95a5a6'; // Gris
      case 'aceptado':
        return '#2ecc71'; // Verde
      case 'rechazado':
        return '#e74c3c'; // Rojo
      default:
        return '#bdc3c7'; // Color por defecto
    }
  };

  const getEstadoNombre = (estadoId) => {
    const estados = {
      1: 'Abierto',
      2: 'Cerrado',
      3: 'Aceptado',
      4: 'Rechazado',
    };
    return estados[estadoId] || 'Desconocido'; // Devuelve 'Desconocido' si el estado no está mapeado
  };

  const handleNavigation = (item) => {
    switch (userRole) {
      case 'Cliente':
        navigation.navigate('Detalles', { casoId: item.ID_caso });
        break;
      case 'Contratista':
        navigation.navigate('Detalles', { casoId: item.id });
        break;
      default:
        console.error('Rol no válido:', userRole);
    }
  };

  return (
    <View style={styles.container}>
      {casos.length === 0 ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No se encontraron casos para mostrar.</Text>
        </View>
      ) : (
        <FlatList
          data={casos}
          keyExtractor={(item) => item.ID_caso ? item.ID_caso.toString() : Math.random().toString()} // Usa ID_caso como identificador
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.caseButton]} 
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
      )}
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
  historialButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  historialButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});