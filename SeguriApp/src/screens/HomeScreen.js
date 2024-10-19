<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
=======
import React, { useEffect, useState } from 'react'; 
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
>>>>>>> origin/MSierra
import { useUser } from '../contexts/UserContext'; // Importa el contexto
import axios from 'axios';

export default function HomeScreen({ navigation }) {
<<<<<<< HEAD
  const { usuarioId } = useUser(); // Accede al userRole y usuarioId desde el contexto
  const [userRole, setUserRole] = useState(null); // Estado local para el rol del usuario
=======
  const { usuarioId, userRole } = useUser();
>>>>>>> origin/MSierra
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCasos = async () => {
      try {
<<<<<<< HEAD
        const response = await axios.get(`http://192.168.1.4:3000/casos/${usuarioId}`);
        setCasos(response.data);
=======
        const response = await axios.get(`http://192.168.50.101:3000/api/casos/${usuarioId}/usuario`);
        console.log('Casos:', response.data);
        // Filtrar casos para ocultar los que están "Cerrados"
        const casosFiltrados = response.data.filter(caso => getEstadoNombre(caso.ID_estado).toLowerCase() !== 'cerrado');
        setCasos(casosFiltrados);
>>>>>>> origin/MSierra
        setError(null);
      } catch (error) {
        console.error('Error al obtener los casos', error);
        setError('Hubo un problema al obtener los casos. Por favor, intenta nuevamente.');
      }
    };

    if (usuarioId) {
      fetchCasos(); // Llama a la función para obtener los casos
    }
<<<<<<< HEAD

    const fetchUserRole = async () => {
      if (usuarioId) {
        try {
          const response = await axios.get(`http://192.168.1.4:3000/roles/${usuarioId}`);
          const rolData = response.data[0]; // Asegúrate de que la API devuelva el rol en el primer elemento
          setUserRole(rolData ? rolData.nombre : null);
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      }
    };

    fetchUserRole();
  }, [usuarioId]);

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
        <Text style={styles.infoText}>No se encontraron casos para mostrar.</Text>
      </View>
    );
  }

=======
  }, [usuarioId]);

>>>>>>> origin/MSierra
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

<<<<<<< HEAD
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Casos del Usuario</Text>

      {userRole === 'cliente' && (
        <View>
          <Text style={styles.infoText}>
            Aquí puedes ver tus casos asignados como cliente.
          </Text>
          <FlatList
            data={casos}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {userRole === 'inspector' && (
        <View style={styles.container}>
        <FlatList
          data={casos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isClickable = item.estado === 'abierto'; // Verifica si el caso está abierto

            return (
              <TouchableOpacity
                style={[styles.caseButton, !isClickable && styles.disabledButton]} // Aplica el estilo de deshabilitado si no es clickeable
                onPress={() => isClickable && navigation.navigate('Inspeccion', { casoId: item.id, clienteId: item.cliente_id })} // Navega a la pantalla de inspección
                disabled={!isClickable} // Deshabilita la interacción si no está abierto
              >
                <View style={styles.caseContent}>
                  <Text style={styles.caseDescription}>{item.descripcion}</Text>
                  <View style={[styles.statusBox, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      )}

      {userRole === 'liquidador' && (
        <View>
          <Text style={styles.infoText}>
            Estos son los casos que puedes revisar como liquidador.
          </Text>
          <FlatList
            data={casos}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
=======
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
        navigation.navigate('Inspeccion', { casoId: item.id });
        break;
      case 'Liquidador':
        navigation.navigate('Liquidacion', { casoId: item.id });
        break;
      default:
        console.error('Rol no válido:', userRole);
    }
  };

  return (
    <View style={styles.container}>
      {userRole === 'Cliente' && (
        <TouchableOpacity
          style={styles.historialButton}
          onPress={() => navigation.navigate('Historial')} // Navega a la pantalla del historial
        >
          <Text style={styles.historialButtonText}>Ver Historial</Text>
        </TouchableOpacity>
      )}
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
>>>>>>> origin/MSierra
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
<<<<<<< HEAD
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  caseButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15, // Ajustado para mayor responsividad
=======
  caseButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
>>>>>>> origin/MSierra
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
<<<<<<< HEAD
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
=======
>>>>>>> origin/MSierra
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
<<<<<<< HEAD
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
=======
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
>>>>>>> origin/MSierra
  },
});
