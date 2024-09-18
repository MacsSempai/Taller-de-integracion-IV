import React from 'react';
import { View, Text, Button } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function ContractorScreen({ navigation }) {
    return (
        <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Pantalla de Contratista</Text>
        <Text style={globalStyles.text}>Esta es la pantalla de Contratista.</Text>
        </View>
    );
    }
