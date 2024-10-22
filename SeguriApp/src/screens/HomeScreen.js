import React, { useState, useCallback } from 'react'; 
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Importa el contexto
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect

export default function HomeScreen({ navigation }) {
  const { usuarioId, userRole } = useUser();
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  // Función para obtener los casos filtrados por usuario
  const fetchCasosPorUsuario = async () => {
    try {
      const response = await axios.get(`http://192.168.55.1:3000/api/casos/${usuarioId}/usuario`);
      console.log('Casos:', response.data);
      // Filtrar casos para ocultar los que están "Cerrados"
      const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() !== 'cerrado');
      setCasos(casosFiltrados);
      setError(null);
    } catch (error) {
      console.error('Error al obtener los casos por usuario', error);
      setError('Hubo un problema al obtener los casos. Por favor, intenta nuevamente.');
    }
  };

  // Función para obtener todos los casos
  const fetchTodosLosCasos = async () => {
    try {
      const response = await axios.get(`http://192.168.55.1:3000/api/casos`);
      console.log('Todos los casos:', response.data);
      const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() !== 'cerrado');
      setCasos(casosFiltrados);
      setError(null);
    } catch (error) {
      console.error('Error al obtener todos los casos', error);
      setError('Hubo un problema al obtener todos los casos. Por favor, intenta nuevamente.');
    }
  };

  // Usar useFocusEffect para refrescar los datos cada vez que la pantalla esté en foco
  useFocusEffect(
    useCallback(() => {
      if (usuarioId) {
        if (userRole === 'Liquidador') {
          fetchTodosLosCasos(); // Liquidador ve todos los casos
        } else {
          fetchCasosPorUsuario(); // Otros roles ven solo los casos asignados a su usuario
        }
      }
    }, [usuarioId, userRole]) // Dependencias del callback
  );

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
      {(userRole === 'Cliente' || userRole === 'Inspector' || userRole === 'Contratista') && (
        <TouchableOpacity
          style={styles.historialButton}
          onPress={() => navigation.navigate('Historial')}
        >
          <Text style={styles.historialButtonText}>Ver Historial</Text>
        </TouchableOpacity>
      )}
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
            keyExtractor={(item) => item.ID_caso ? item.ID_caso.toString() : Math.random().toString()} // Usa ID_caso como identificador
            renderItem={({ item }) => {
              const estadoNombre = getEstadoNombre(item.ID_estado).toLowerCase(); // Optimización
              return (
                <TouchableOpacity
                  style={[styles.caseButton]} 
                  onPress={() => handleNavigation(item)} 
                >
                  <View style={styles.caseContent}>
                    <Text style={styles.caseDescription}>{item.descripcion_siniestro}</Text>
                    <View style={[styles.statusBox, { backgroundColor: getEstadoColor(estadoNombre) }]}>
                      <Text style={styles.statusText}>{getEstadoNombre(item.ID_estado)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            initialNumToRender={10} // Optimización para FlatList
          />
        )
      )}
      
      {/* Botón para abrir un caso (Solo visible para Cliente) */}
      {userRole === 'Cliente' && (
        <TouchableOpacity
          style={styles.newCaseButton}
          onPress={() => navigation.navigate('AbrirCaso')} // Navega a la pantalla para abrir un nuevo caso
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
