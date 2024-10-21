import React, { useState, useEffect } from 'react'; 
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Button,
  Switch,
} from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer'; // Importar Buffer para la conversión

// Asegurar que Buffer esté disponible globalmente
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const BASE_URL = 'http://192.168.1.10:3000/api'; // Asegúrate de que esta IP es correcta y accesible

const InspectionForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    tipo_siniestro: '',
    descripcion_siniestro: '',
    ID_contratista: '',
    sector: '',
    sub_sector: '',
    trabajosSeleccionados: [],
  });

  const [contratistas, setContratistas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [subSectores, setSubSectores] = useState([]);
  const [subSectoresFiltrados, setSubSectoresFiltrados] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [modalVisible, setModalVisible] = useState({
    contratista: false,
    sector: false,
    subSector: false,
  });

  const getPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesitan permisos para acceder al almacenamiento');
    }
  };

  useEffect(() => {
    getPermissions();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const contratistasResponse = await axios.get(`${BASE_URL}/contratistas`);
      setContratistas(contratistasResponse.data);

      const sectoresResponse = await axios.get(`${BASE_URL}/sectores`);
      setSectores(sectoresResponse.data);

      const subSectoresResponse = await axios.get(`${BASE_URL}/subsectores`);
      setSubSectores(subSectoresResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los datos del backend');
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      sector: value,
      sub_sector: '',
      trabajosSeleccionados: [],
    }));

    const subSectoresFiltrados = subSectores.filter(
      (subsector) => String(subsector.ID_sector) === String(value)
    );
    setSubSectoresFiltrados(subSectoresFiltrados);
  };

  const handleSubSectorChange = async (value) => {
    setFormData((prev) => ({
      ...prev,
      sub_sector: value,
      trabajosSeleccionados: [],
    }));

    try {
      const trabajosResponse = await axios.get(
        `${BASE_URL}/trabajos/${value}`
      );
      setTrabajos(trabajosResponse.data);
    } catch (error) {
      console.error('Error al cargar trabajos:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los trabajos');
    }
  };

  const toggleTrabajoSeleccionado = (trabajoId) => {
    setFormData((prev) => {
      const { trabajosSeleccionados } = prev;
      if (trabajosSeleccionados.includes(trabajoId)) {
        return {
          ...prev,
          trabajosSeleccionados: trabajosSeleccionados.filter(id => id !== trabajoId),
        };
      } else {
        return {
          ...prev,
          trabajosSeleccionados: [...trabajosSeleccionados, trabajoId],
        };
      }
    });
  };

  const createExcelFile = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();

      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new();

      // Datos a incluir en la hoja
      const wsData = [
        ["Reporte de Inspección", ""], // Añadir una segunda columna vacía para mantener la consistencia
        ["Fecha", formattedDate],
        ["Nombre", formData.nombre || 'No especificado'],
        ["RUT", formData.rut || 'No especificado'],
        ["Dirección", formData.direccion || 'No especificado'],
        ["Tipo de Siniestro", formData.tipo_siniestro || 'No especificado'],
        ["Descripción del Siniestro", formData.descripcion_siniestro || 'No especificado'],
        ["Contratista", contratistas.find(c => String(c.ID_contratista) === String(formData.ID_contratista))?.area_trabajo || 'No especificado'],
        ["Sector", sectores.find(s => String(s.ID_sector) === String(formData.sector))?.nombre_sector || 'No especificado'],
        ["Subsector", subSectores.find(ss => String(ss.ID_sub_sector) === String(formData.sub_sector))?.nombre_sub_sector || 'No especificado'],
      ];

      // Agregar trabajos seleccionados si existen
      const trabajosSeleccionadosList = trabajos.filter(trabajo => formData.trabajosSeleccionados.includes(trabajo.ID_trabajo));
      if (trabajosSeleccionadosList.length > 0) {
        wsData.push(["Trabajos Seleccionados", ""]); // Título con 2 columnas
        trabajosSeleccionadosList.forEach(trabajo => {
          wsData.push([
            trabajo.Nombre_trabajo || 'Sin nombre',
            `${trabajo.coste_trabajo || 0} CLP`,
          ]);
        });
      }

      // Depuración: Verificar el contenido de wsData
      console.log('Contenido de wsData:', wsData);

      // Crear la hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Validación adicional: Asegúrate de que no hay campos vacíos o incorrectos
      if (!ws || Object.keys(ws).length === 0) {
        throw new Error('La hoja de trabajo está vacía o mal formateada.');
      }

      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Inspección');

      // Convertir a binario
      const binary = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      // Convertir el binario a base64
      const base64 = Buffer.from(binary, 'binary').toString('base64');

      // Verificar que 'base64' no esté vacío
      if (!base64 || base64.length === 0) {
        throw new Error('El contenido del archivo Excel está vacío.');
      }

      // Sanitizar el nombre del archivo
      const sanitizeFileName = (name) => {
        const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '');
        return sanitized || 'Reporte'; // Valor predeterminado si está vacío
      };
      const sanitizedNombre = sanitizeFileName(formData.nombre);
      const sanitizedRut = sanitizeFileName(formData.rut);
      const fileName = `Inspeccion_${sanitizedNombre}_${sanitizedRut}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Guardar el archivo en el sistema de archivos
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

      // Verificar si el archivo se creó correctamente
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        console.error('El archivo no se creó correctamente:', fileUri);
        throw new Error('El archivo no se creó correctamente.');
      }

      // Opcional: Guardar en la biblioteca de medios para verificación
      await MediaLibrary.createAssetAsync(fileUri);

      return { fileUri, fileName };
    } catch (error) {
      console.error('Error al crear el archivo Excel:', error);
      Alert.alert('Error', 'No se pudo crear el archivo Excel. Revise los datos e intente nuevamente.');
      return null;
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (
        !formData.nombre ||
        !formData.rut ||
        !formData.direccion ||
        !formData.tipo_siniestro ||
        !formData.descripcion_siniestro ||
        !formData.ID_contratista ||
        !formData.sector ||
        !formData.sub_sector
      ) {
        Alert.alert('Error', 'Por favor, completa todos los campos requeridos');
        return;
      }

      const excelFile = await createExcelFile();
      if (!excelFile) {
        return;
      }

      const { fileUri, fileName } = excelFile;
      const formDataToSend = new FormData();
      formDataToSend.append('excelFile', {
        uri: fileUri,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: fileName,
      });

      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${BASE_URL}/archivos/upload-excel`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Éxito', 'Archivo Excel creado y enviado correctamente');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Hubo un problema al enviar el archivo');
      }

      // Reiniciar el formulario después del envío exitoso
      setFormData({
        nombre: '',
        rut: '',
        direccion: '',
        tipo_siniestro: '',
        descripcion_siniestro: '',
        ID_contratista: '',
        sector: '',
        sub_sector: '',
        trabajosSeleccionados: [],
      });
      setTrabajos([]);
    } catch (error) {
      console.error('Error al enviar el archivo:', error.message);
      Alert.alert('Error', 'Hubo un problema al enviar el archivo');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          value={formData.nombre}
          onChangeText={(value) => handleChange('nombre', value)}
          placeholder="Ingrese su nombre"
        />

        <Text style={styles.label}>RUT:</Text>
        <TextInput
          style={styles.input}
          value={formData.rut}
          onChangeText={(value) => handleChange('rut', value)}
          placeholder="Ingrese su RUT"
        />

        <Text style={styles.label}>Dirección:</Text>
        <TextInput
          style={styles.input}
          value={formData.direccion}
          onChangeText={(value) => handleChange('direccion', value)}
          placeholder="Ingrese su dirección"
        />

        <Text style={styles.label}>Tipo de Siniestro:</Text>
        <TextInput
          style={styles.input}
          value={formData.tipo_siniestro}
          onChangeText={(value) => handleChange('tipo_siniestro', value)}
          placeholder="Ingrese el tipo de siniestro"
        />

        <Text style={styles.label}>Descripción del Siniestro:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.descripcion_siniestro}
          onChangeText={(value) => handleChange('descripcion_siniestro', value)}
          placeholder="Describa el siniestro"
          multiline
        />

        {/* Contratista */}
        <Text style={styles.label}>Contratista:</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setModalVisible((prev) => ({ ...prev, contratista: true }))}
        >
          <Text style={[styles.selectText, { color: formData.ID_contratista ? '#333' : '#999' }]}>
            {contratistas.find(c => String(c.ID_contratista) === String(formData.ID_contratista))?.area_trabajo || 'Seleccione contratista'}
          </Text>
        </TouchableOpacity>

        {/* Modal para seleccionar contratista */}
        <Modal visible={modalVisible.contratista} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={contratistas}
                keyExtractor={(item) => item.ID_contratista.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleChange('ID_contratista', item.ID_contratista);
                      setModalVisible((prev) => ({ ...prev, contratista: false }));
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.area_trabajo}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Cerrar" onPress={() => setModalVisible((prev) => ({ ...prev, contratista: false }))} />
            </View>
          </View>
        </Modal>

        {/* Sector */}
        <Text style={styles.label}>Sector:</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setModalVisible((prev) => ({ ...prev, sector: true }))}
        >
          <Text style={[styles.selectText, { color: formData.sector ? '#333' : '#999' }]}>
            {formData.sector ? sectores.find(s => String(s.ID_sector) === String(formData.sector))?.nombre_sector : 'Seleccione sector'}
          </Text>
        </TouchableOpacity>

        {/* Modal para seleccionar sector */}
        <Modal visible={modalVisible.sector} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={sectores}
                keyExtractor={(item) => item.ID_sector.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleSectorChange(item.ID_sector);
                      setModalVisible((prev) => ({ ...prev, sector: false }));
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.nombre_sector}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Cerrar" onPress={() => setModalVisible((prev) => ({ ...prev, sector: false }))} />
            </View>
          </View>
        </Modal>

        {/* SubSector */}
        <Text style={styles.label}>SubSector:</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => {
            if (formData.sector) {
              setModalVisible((prev) => ({ ...prev, subSector: true }));
            } else {
              Alert.alert('Atención', 'Primero seleccione un sector');
            }
          }}
        >
          <Text style={[styles.selectText, { color: formData.sub_sector ? '#333' : '#999' }]}>
            {formData.sub_sector ? subSectores.find(ss => String(ss.ID_sub_sector) === String(formData.sub_sector))?.nombre_sub_sector : 'Seleccione subsector'}
          </Text>
        </TouchableOpacity>

        {/* Modal para seleccionar subsector */}
        <Modal visible={modalVisible.subSector} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={subSectoresFiltrados}
                keyExtractor={(item) => item.ID_sub_sector.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleSubSectorChange(item.ID_sub_sector);
                      setModalVisible((prev) => ({ ...prev, subSector: false }));
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.nombre_sub_sector}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Cerrar" onPress={() => setModalVisible((prev) => ({ ...prev, subSector: false }))} />
            </View>
          </View>
        </Modal>

        {/* Trabajos */}
        {formData.sub_sector && trabajos.length > 0 && (
          <>
            <Text style={styles.label}>Seleccione los trabajos:</Text>
            {trabajos.map((trabajo) => (
              <View key={trabajo.ID_trabajo} style={styles.trabajoItem}>
                <Text style={styles.trabajoText}>
                  {trabajo.Nombre_trabajo} - {trabajo.coste_trabajo} CLP
                </Text>
                <Switch
                  value={formData.trabajosSeleccionados.includes(trabajo.ID_trabajo)}
                  onValueChange={() => toggleTrabajoSeleccionado(trabajo.ID_trabajo)}
                />
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Registrar Caso</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f7f9fc',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  trabajoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trabajoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 18,
    borderRadius: 8,
    marginVertical: 30,
    alignSelf: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default InspectionForm;
