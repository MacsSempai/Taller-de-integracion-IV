import React from 'react';
import { View, Text, Button } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function LiquidadorScreen({ navigation }) {
    return (
        <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Pantalla de Liquidador</Text>
        <Text style={globalStyles.text}>Esta es la pantalla de Liquidador.</Text>
        </View>
    );
    }

