import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const DetalleCliente = ({ route }) => {
  const { casoId } = route.params;
  const [detalleCaso, setDetalleCaso] = useState(null);
  const [sectores, setSectores] = useState([]);
  const [subsectores, setSubsectores] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetalleCaso = async () => {
      try {
        const response = await axios.get(`http://192.168.50.101:3000/casos/${casoId}`);
        const caso = response.data.find(c => c.id === casoId);
        setDetalleCaso(caso || null);
        console.log(caso);

        // Cargar sectores
        const sectoresResponse = await axios.get(`http://192.168.50.101:3000/sectores/${casoId}`);
        setSectores(sectoresResponse.data);
        console.log(sectoresResponse.data);

        // si se encontró un sector, cargar subsectores
        if (sectoresResponse.data.length > 0) {
          const subsectoresResponse = await axios.get(`http://192.168.50.101:3000/subsectores/${sectoresResponse.data[0].id}`);
          setSubsectores(subsectoresResponse.data);
          console.log(subsectoresResponse.data);
        }
      } catch (error) {
        console.error("Error al obtener el detalle del caso:", error);
        setError("Error al cargar los detalles del caso. Intenta nuevamente más tarde.");
      }
    };

    fetchDetalleCaso();
  }, [casoId]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
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
      <Text><Text style={styles.label}>Descripción:</Text> {detalleCaso.descripcion || 'N/A'}</Text>
      <Text><Text style={styles.label}>Estado:</Text> {detalleCaso.estado || 'N/A'}</Text>
      <Text style={styles.subtitle}>Sectores:</Text>
      {sectores.length > 0 ? (
        sectores.map((sector, index) => (
          <View key={index} style={styles.sector}>
            <Text><Text style={styles.label}>Sector:</Text> {sector.nombre || 'N/A'}</Text>
            {subsectores.length > 0 ? (
              subsectores.map((subsector, index) => (
                <View key={index} style={styles.subsector}>
                  <Text><Text style={styles.label}>Subsector:</Text> {subsector.nombre || 'N/A'}</Text>
                  <Text><Text style={styles.label}>Cantidad:</Text> {subsector.cantidad_material || 'N/A'}</Text>
                  <Text><Text style={styles.label}>costo total:</Text> {subsector.costo_total || 'N/A'}</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  sector: {
    marginBottom: 15,
  },
  subsector: {
    marginLeft: 20,
    marginTop: 10,
  },
});

export default DetalleCliente;
