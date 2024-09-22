import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const DetalleCliente = ({ route }) => {
  const { casoId } = route.params;
  const [detalleCaso, setDetalleCaso] = useState(null);
  const [sectores, setSectores] = useState([]);
  const [subsectoresMap, setSubsectoresMap] = useState({});
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
      } catch (error) {
        console.error("Error al obtener el detalle del caso:", error);
        setError("Error al cargar los detalles del caso. Intenta nuevamente más tarde.");
      }
    };

    fetchDetalleCaso();
  }, [casoId]);

  useEffect(() => {
    const fetchSubsectores = async () => {
      const subsectoresPromises = sectores.map(async (sector) => {
        try {
          const response = await axios.get(`http://192.168.50.101:3000/subsectores/${sector.id}`);
          return { [sector.id]: response.data }; // Mapear por sector.id
        } catch (error) {
          console.error("Error al obtener subsectores:", error);
          return { [sector.id]: [] }; // Retorna un array vacío en caso de error
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
            {subsectoresMap[sector.id] && subsectoresMap[sector.id].length > 0 ? (
              subsectoresMap[sector.id].map((subsector, subIndex) => (
                <View key={subIndex} style={styles.subsector}>
                  <Text><Text style={styles.label}>Subsector:</Text> {subsector.nombre || 'N/A'}</Text>
                  <Text><Text style={styles.label}>Cantidad:</Text> {subsector.cantidad_material || 'N/A'}</Text>
                  <Text><Text style={styles.label}>Costo total:</Text> {subsector.costo_total || 'N/A'}</Text>
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
