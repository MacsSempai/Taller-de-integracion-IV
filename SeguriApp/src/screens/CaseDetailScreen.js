import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Importa el contexto

const CasoDetalle = ({ route }) => {
  const { casoId } = route.params; // El ID del caso que se pasa a la vista
  const { userRole } = useUser(); // Obtén el rol del usuario
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para manejar la apertura de los sectores
  const [openSectors, setOpenSectors] = useState({});

  useEffect(() => {
    const fetchCaso = async () => {
      try {
        const response = await fetch(`http://192.168.1.11:3000/api/casos/${casoId}/completo`);
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
    return <ActivityIndicator style={styles.loadingIndicator} size="large" color="#007bff" />;
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

            {/* Información del cliente - solo visible para Contratista e Inspector */}
            {(userRole === 'Contratista' || userRole === 'Inspector') && (
              <>
                <Text style={styles.subtitle}>Información del Cliente:</Text>
                <Text style={styles.info}>
                  {caso[0].nombre_cliente} {caso[0].apellido_cliente}
                </Text>
                <Text style={styles.info}>Celular: {caso[0].celular_cliente}</Text>
                <Text style={styles.info}>Correo: {caso[0].correo_cliente}</Text>
                <Text style={styles.info}>Dirección: {caso[0].direccion_cliente}</Text>
                <Text style={styles.info}>Comuna: {caso[0].comuna_cliente}</Text>
              </>
            )}

            {/* Información del inspector - solo visible para Contratista y Cliente */}
            {(userRole === 'Contratista' || userRole === 'Cliente') && (
              <>
                <Text style={styles.subtitle}>Información del Inspector:</Text>
                <Text style={styles.info}>
                  {caso[0].nombre_inspector} {caso[0].apellido_inspector}
                </Text>
                <Text style={styles.info}>Celular: {caso[0].celular_inspector}</Text>
                <Text style={styles.info}>Correo: {caso[0].correo_inspector}</Text>
              </>
            )}

            {/* Información del contratista - solo visible para Inspector y Cliente */}
            {(userRole === 'Inspector' || userRole === 'Cliente') && (
              <>
                <Text style={styles.subtitle}>Información del Contratista:</Text>
                <Text style={styles.info}>
                  {caso[0].nombre_contratista} {caso[0].apellido_contratista}
                </Text>
                <Text style={styles.info}>Celular: {caso[0].celular_contratista}</Text>
                <Text style={styles.info}>Correo: {caso[0].correo_contratista}</Text>
                <Text style={styles.info}>Área de trabajo: {caso[0].area_trabajo}</Text>
              </>
            )}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f9fc',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#e74c3c',
  },
  caseInfo: {
    marginBottom: 16,
    padding: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectorInfo: {
    marginBottom: 16,
    padding: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subsectorInfo: {
    marginLeft: 10,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 4,
    color: '#2c3e50',
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
    color: '#34495e',
  },
  info: {
    fontSize: 14,
    marginVertical: 2,
    color: '#555',
  },
});

export default CasoDetalle;
