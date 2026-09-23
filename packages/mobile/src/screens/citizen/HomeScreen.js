import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CitizenHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citizen Portal</Text>
      <Text style={styles.subtitle}>Report waste and track cleanup status.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
});
