import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore para obtener el rol del usuario

export default function UserScreen({ onLogout }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Estado para almacenar el rol del usuario
  const [permissions, setPermissions] = useState([]); // Estado para almacenar permisos
  const auth = getAuth();
  const firestore = getFirestore();

  // Función para asignar permisos basados en el rol del usuario
  const assignPermissions = (userRole) => {
    switch (userRole) {
      case 'inspector':
        return ['ver_inspecciones', 'crear_inspecciones', 'editar_inspecciones', 'aprobar_inspecciones'];
      case 'liquidador':
        return ['ver_inspecciones', 'editar_inspecciones', 'liquidar_inspecciones'];
      case 'administrador':
        return ['ver_inspecciones', 'crear_inspecciones', 'editar_inspecciones', 'eliminar_inspecciones', 'administrar_usuarios', 'cambiar_precios'];
      case 'usuario':
      default:
        return ['ver_inspecciones'];
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);

      // Obtener el rol del usuario desde Firestore
      const fetchUserRole = async () => {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role || 'usuario'; // Rol por defecto es 'usuario'
          setRole(userRole);
          setPermissions(assignPermissions(userRole)); // Asignar permisos según el rol
        }
      };

      fetchUserRole();
    }
  }, [auth, firestore]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        onLogout(); // Actualiza el estado de autenticación en la App.js
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.profileImage}
        source={require('./assets/icon.png')} // icono de usuario
      />
      <Text style={styles.label}>Correo Electrónico</Text>
      <Text style={styles.text}>{email}</Text>

      <Text style={styles.label}>Rol</Text>
      <Text style={styles.text}>{role}</Text>

      <Text style={styles.label}>Permisos</Text>
      {permissions.map((permission, index) => (
        <Text key={index} style={styles.text}>{permission}</Text>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderColor: '#2980b9',
    borderWidth: 3,
  },
  label: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
