import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const LiquidatorCaseScreen = ({ route }) => {
  const { casoId } = route.params;
  const [detalleCaso, setDetalleCaso] = useState(null);
  const [sectores, setSectores] = useState([]);
  const [subsectoresMap, setSubsectoresMap] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalleCaso = async () => {
      try {
        const response = await axios.get(`http://192.168.50.101:3000/casos/${casoId}`);
        const caso = response.data.find(c => c.id === casoId);
        setDetalleCaso(caso || null);

        const sectoresResponse = await axios.get(`http://192.168.50.101:3000/sectores/${casoId}`);
        setSectores(sectoresResponse.data);
      } catch (error) {
        console.error("Error al obtener el detalle del caso:", error);
        setError("Error al cargar los detalles del caso. Intenta nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleCaso();
  }, [casoId]);

  useEffect(() => {
    const fetchSubsectores = async () => {
      const subsectoresPromises = sectores.map(async (sector) => {
        try {
          const response = await axios.get(`http://192.168.50.101:3000/subsectores/${sector.id}`);
          return { [sector.id]: response.data };
        } catch (error) {
          console.error("Error al obtener subsectores:", error);
          return { [sector.id]: [] };
        }
      });

      const subsectoresArray = await Promise.all(subsectoresPromises);
      const subsectoresMap = Object.assign({}, ...subsectoresArray);
      setSubsectoresMap(subsectoresMap);
    };

    if (sectores.length > 0) {
      fetchSubsectores();
    }
  }, [sectores]);

  const actualizarEstado = async (nuevoEstado) => {
    try {
      await axios.put(`http://192.168.50.101:3000/casos/${casoId}`, { estado: nuevoEstado });
      setDetalleCaso(prev => ({ ...prev, estado: nuevoEstado }));
      Alert.alert("Éxito", `El estado del caso ha sido cambiado a ${nuevoEstado}.`);
    } catch (error) {
      console.error("Error al actualizar el estado del caso:", error);
      Alert.alert("Error", "No se pudo cambiar el estado del caso. Intenta nuevamente.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Cargando detalles del caso...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!detalleCaso) {
    return (
      <View style={styles.container}>
        <Text>No se encontraron detalles del caso.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalles del Caso</Text>
      <Text style={styles.detail}><Text style={styles.label}>Descripción:</Text> {detalleCaso.descripcion || 'N/A'}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Estado:</Text> {detalleCaso.estado || 'N/A'}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => actualizarEstado('aceptado')}>
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={() => actualizarEstado('rechazado')}>
          <Text style={styles.buttonText}>Rechazar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Sectores:</Text>
      {sectores.length > 0 ? (
        sectores.map((sector, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.sectorName}><Text style={styles.label}>Sector:</Text> {sector.nombre || 'N/A'}</Text>
            {subsectoresMap[sector.id] && subsectoresMap[sector.id].length > 0 ? (
              subsectoresMap[sector.id].map((subsector, subIndex) => (
                <View key={subIndex} style={styles.subsector}>
                  <Text style={styles.subsectorDetail}><Text style={styles.label}>Subsector:</Text> {subsector.nombre || 'N/A'}</Text>
                  <Text style={styles.subsectorDetail}><Text style={styles.label}>Cantidad:</Text> {subsector.cantidad_material || 'N/A'} m²</Text>
                  <Text style={styles.subsectorDetail}><Text style={styles.label}>Costo total:</Text> {subsector.costo_total || 'N/A'}</Text>
                </View>
              ))
            ) : (
              <Text>No hay subsectores disponibles.</Text>
            )}
          </View>
        ))
      ) : (
        <Text>No hay sectores disponibles.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  sectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  subsector: {
    marginLeft: 10,
    marginTop: 10,
  },
  subsectorDetail: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default LiquidatorCaseScreen;
