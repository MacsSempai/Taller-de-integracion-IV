import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const DetalleCliente = ({ route }) => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
        <Text>Cargando detalles del caso...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalles del Caso</Text>
      <Text style={styles.detail}><Text style={styles.label}>Descripción:</Text> {detalleCaso.descripcion || 'N/A'}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Estado:</Text> {detalleCaso.estado || 'N/A'}</Text>
      <Text style={styles.subtitle}>Sectores:</Text>
      {sectores.length > 0 ? (
        sectores.map((sector, index) => (
          <View key={index} style={styles.sector}>
            <Text style={styles.detail}><Text style={styles.label}>Sector:</Text> {sector.nombre || 'N/A'}</Text>
            {subsectoresMap[sector.id] && subsectoresMap[sector.id].length > 0 ? (
              subsectoresMap[sector.id].map((subsector, subIndex) => (
                <View key={subIndex} style={styles.subsector}>
                  <Text style={styles.detail}><Text style={styles.label}>Subsector:</Text> {subsector.nombre || 'N/A'}</Text>
                  <Text style={styles.detail}><Text style={styles.label}>Cantidad:</Text> {subsector.cantidad_material || 'N/A'} m²</Text>
                  <Text style={styles.detail}><Text style={styles.label}>Costo total:</Text> {subsector.costo_total || 'N/A'}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  sector: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  subsector: {
    marginLeft: 20,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default DetalleCliente;
