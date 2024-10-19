<<<<<<< HEAD
import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const CaseDetailScreen = () => {
  const { caseName, description, assignedContractor, inspectorName, transportationCost, sectors } = caseDetails;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{caseName}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.detail}>Contratista Asignado: {assignedContractor}</Text>
      <Text style={styles.detail}>Inspector: {inspectorName}</Text>
      <Text style={styles.detail}>Costo de Transporte: ${transportationCost}</Text>

      {sectors.map((sector, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{sector.name}</Text>
          <Text>Tipo de Daño: {sector.damageType}</Text>
          <Text>Porcentaje de Pérdida: {sector.lossPercentage}%</Text>
          <Text>Total del Costo: ${sector.totalCost}</Text>

          {sector.subsectors.map((subsector, subIndex) => (
            <View key={subIndex} style={styles.subsectorContainer}>
              <Text style={styles.subsectorHeader}>Subsector {subIndex + 1}</Text>
              <Text>Material: {subsector.material}</Text>
              <Text>Cantidad: {subsector.quantity}</Text>
              <Text>Costo de Material: ${subsector.materialCost}</Text>
              <Text>Tipo de Trabajo: {subsector.workType}</Text>
              <Text>Costo de Trabajo: ${subsector.workCost}</Text>
            </View>
          ))}
        </View>
      ))}
=======
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const CasoDetalle = ({ route }) => {
  const { casoId } = route.params; // El ID del caso que se pasa a la vista
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para manejar la apertura de los sectores
  const [openSectors, setOpenSectors] = useState({});

  useEffect(() => {
    const fetchCaso = async () => {
      try {
        const response = await fetch(`http://192.168.50.101:3000/api/casos/${casoId}/completo`);
        const data = await response.json();
        console.log('Datos obtenidos del caso:', data); // Para ver qué datos llegan
        setCaso(data);
      } catch (error) {
        console.error('Error al cargar el caso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaso();
  }, [casoId]);

  // Función para alternar la apertura de un sector
  const toggleSector = (index) => {
    setOpenSectors((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return <Text style={styles.loadingText}>Cargando...</Text>;
  }

  if (!caso || caso.length === 0) {
    return <Text style={styles.errorText}>No se encontró información del caso</Text>;
  }

  // Agrupar subsectores por ID_Sector
  const groupedSubsectors = caso.reduce((acc, sector) => {
    if (!acc[sector.id_sector]) {
      acc[sector.id_sector] = { ...sector, subsectores: [] };
    }
    acc[sector.id_sector].subsectores.push({
      nombre_sub_sector: sector.nombre_sub_sector,
      tipo_reparacion: sector.tipo_reparacion,
      nombre_material: sector.nombre_material,
      cantidad_material: sector.cantidad_material,
      precio_material: sector.precio_material,
    });
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      <View style={styles.caseInfo}>
        {caso[0] && (
          <>
            <Text style={styles.title}>Tipo de Siniestro:</Text>
            <Text style={styles.info}>{caso[0].tipo_siniestro}</Text>
            <Text style={styles.title}>Descripción:</Text>
            <Text style={styles.info}>{caso[0].descripcion_siniestro}</Text>

            {/* Información del inspector */}
            <Text style={styles.subtitle}>Información del Inspector:</Text>
            <Text style={styles.info}>
              {caso[0].nombre_inspector} {caso[0].apellido_inspector}
            </Text>
            <Text style={styles.info}>Celular: {caso[0].celular_inspector}</Text>
            <Text style={styles.info}>Correo: {caso[0].correo_inspector}</Text>

            {/* Información del contratista */}
            <Text style={styles.subtitle}>Información del Contratista:</Text>
            <Text style={styles.info}>
              {caso[0].nombre_contratista} {caso[0].apellido_contratista}
            </Text>
            <Text style={styles.info}>Celular: {caso[0].celular_contratista}</Text>
            <Text style={styles.info}>Correo: {caso[0].correo_contratista}</Text>
            <Text style={styles.info}>Área de trabajo: {caso[0].area_trabajo}</Text>
          </>
        )}
      </View>

      {/* Información de los sectores y subsectores */}
      <View>
        {Object.values(groupedSubsectors).map((sector, index) => (
          <View key={index} style={styles.sectorInfo}>
            <TouchableOpacity onPress={() => toggleSector(index)}>
              <Text style={styles.title}>Sector: {sector.nombre_sector}</Text>
            </TouchableOpacity>
            {openSectors[index] && (
              <>
                {sector.dano_sector && (
                  <Text style={styles.info}>Daño: {sector.dano_sector}</Text>
                )}
                {sector.porcentaje_perdida && (
                  <Text style={styles.info}>
                    Porcentaje Pérdida: {sector.porcentaje_perdida}%
                  </Text>
                )}
                {sector.total_costo && (
                  <Text style={styles.info}>Costo Total: {sector.total_costo}</Text>
                )}

                {/* Subsectores desplegables */}
                {sector.subsectores.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => toggleSector(`${index}-sub`)}>
                      <Text style={styles.title}>Subsectores</Text>
                    </TouchableOpacity>
                    {openSectors[`${index}-sub`] && sector.subsectores.map((subsector, subIndex) => (
                      <View key={subIndex} style={styles.subsectorInfo}>
                        {subsector.nombre_sub_sector && (
                          <Text style={styles.info}>Subsector: {subsector.nombre_sub_sector}</Text>
                        )}
                        {subsector.tipo_reparacion && (
                          <Text style={styles.info}>Tipo de Reparación: {subsector.tipo_reparacion}</Text>
                        )}
                        {subsector.nombre_material && (
                          <Text style={styles.info}>Material: {subsector.nombre_material}</Text>
                        )}
                        {subsector.cantidad_material && (
                          <Text style={styles.info}>Cantidad Material: {subsector.cantidad_material}</Text>
                        )}
                        {subsector.precio_material && (
                          <Text style={styles.info}>Precio del Material: {subsector.precio_material}</Text>
                        )}
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        ))}
      </View>
>>>>>>> origin/MSierra
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subsectorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
  },
  subsectorHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default CaseDetailScreen;
=======
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
  caseInfo: {
    marginBottom: 16,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  sectorInfo: {
    marginBottom: 16,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  subsectorInfo: {
    marginLeft: 10,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#e9e9e9',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 4,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 8,
  },
  info: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default CasoDetalle;
>>>>>>> origin/MSierra
