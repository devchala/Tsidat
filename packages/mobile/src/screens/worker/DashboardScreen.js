import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkerDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Portal</Text>
      <Text style={styles.subtitle}>View assigned tasks and navigation routes.</Text>
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
    color: '#1565c0',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
});
