import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const LiquidarCaso = ({ route, navigation }) => {
  const { casoId } = route.params;
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSectors, setOpenSectors] = useState({});

  useEffect(() => {
    const fetchCaso = async () => {
      try {
        const response = await fetch(`http://192.168.1.11:3000/api/casos/${casoId}/completo`);
        const data = await response.json();
        setCaso(data);
      } catch (error) {
        console.error('Error al cargar el caso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaso();
  }, [casoId]);

  const toggleSector = (index) => {
    setOpenSectors((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCaseStatusChange = async (nuevoEstado) => {
    // Convertimos el estado a su correspondiente código
    const estadoCodigo = nuevoEstado === 'aceptado' ? 3 : 4; // 3 = aceptado, 4 = rechazado
    try {
      const response = await fetch(`http://192.168.50.101:3000/api/casos/${casoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ID_estado: estadoCodigo }),
      });

      if (response.ok) {
        Alert.alert(`Caso ${nuevoEstado === 'aceptado' ? 'aceptado' : 'rechazado'}`, `El caso ha sido ${nuevoEstado === 'aceptado' ? 'aceptado' : 'rechazado'} con éxito.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al cambiar el estado del caso.');
      }
    } catch (error) {
      console.error(`Error al cambiar el estado del caso:`, error);
      Alert.alert('Error', 'No se pudo cambiar el estado del caso.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando caso...</Text>
      </View>
    );
  }

  if (!caso || caso.length === 0) {
    return <Text style={styles.errorText}>No se encontró información del caso</Text>;
  }

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
            <Text style={styles.header}>Información del Siniestro</Text>
            <Text style={styles.title}>Tipo de Siniestro:</Text>
            <Text style={styles.info}>{caso[0].tipo_siniestro}</Text>
            <Text style={styles.title}>Descripción:</Text>
            <Text style={styles.info}>{caso[0].descripcion_siniestro}</Text>

            <Text style={styles.header}>Cliente</Text>
            <Text style={styles.info}>{caso[0].nombre_cliente} {caso[0].apellido_cliente}</Text>
            <Text style={styles.info}>Teléfono: {caso[0].celular_cliente}</Text>
            <Text style={styles.info}>Correo: {caso[0].correo_cliente}</Text>

            <Text style={styles.header}>Inspector</Text>
            <Text style={styles.info}>{caso[0].nombre_inspector} {caso[0].apellido_inspector}</Text>
            <Text style={styles.info}>Celular: {caso[0].celular_inspector}</Text>
            <Text style={styles.info}>Correo: {caso[0].correo_inspector}</Text>

            <Text style={styles.header}>Contratista</Text>
            <Text style={styles.info}>{caso[0].nombre_contratista} {caso[0].apellido_contratista}</Text>
            <Text style={styles.info}>Celular: {caso[0].celular_contratista}</Text>
            <Text style={styles.info}>Área de trabajo: {caso[0].area_trabajo}</Text>
          </>
        )}
      </View>

      <View>
        {Object.values(groupedSubsectors).map((sector, index) => (
          <View key={index} style={styles.sectorInfo}>
            <TouchableOpacity onPress={() => toggleSector(index)}>
              <Text style={styles.title}>Sector: {sector.nombre_sector}</Text>
            </TouchableOpacity>
            {openSectors[index] && (
              <>
                {sector.dano_sector && <Text style={styles.info}>Daño: {sector.dano_sector}</Text>}
                {sector.porcentaje_perdida && <Text style={styles.info}>Porcentaje Pérdida: {sector.porcentaje_perdida}%</Text>}
                {sector.total_costo && <Text style={styles.info}>Costo Total: {sector.total_costo}</Text>}

                {sector.subsectores.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => toggleSector(`${index}-sub`)}>
                      <Text style={styles.subTitle}>Subsectores</Text>
                    </TouchableOpacity>
                    {openSectors[`${index}-sub`] && sector.subsectores.map((subsector, subIndex) => (
                      <View key={subIndex} style={styles.subsectorInfo}>
                        <Text style={styles.info}>Subsector: {subsector.nombre_sub_sector}</Text>
                        <Text style={styles.info}>Tipo de Reparación: {subsector.tipo_reparacion}</Text>
                        <Text style={styles.info}>Material: {subsector.nombre_material}</Text>
                        <Text style={styles.info}>Cantidad: {subsector.cantidad_material}</Text>
                        <Text style={styles.info}>Precio: {subsector.precio_material}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        ))}
      </View>

      {/* Botones de aceptar y rechazar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleCaseStatusChange('aceptado')}>
          <Text style={styles.buttonText}>Aceptar Caso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={() => handleCaseStatusChange('rechazado')}>
          <Text style={styles.buttonText}>Rechazar Caso</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#e74c3c',
  },
  caseInfo: {
    marginBottom: 20,
    padding: 16,
    borderColor: '#dcdde1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectorInfo: {
    marginBottom: 16,
    padding: 16,
    borderColor: '#dcdde1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subsectorInfo: {
    marginLeft: 10,
    marginTop: 8,
    padding: 12,
    borderColor: '#dcdde1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f0f3f5',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2d3436',
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0984e3',
    marginTop: 10,
  },
  info: {
    fontSize: 14,
    color: '#636e72',
    marginVertical: 4,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2d3436',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LiquidarCaso;
