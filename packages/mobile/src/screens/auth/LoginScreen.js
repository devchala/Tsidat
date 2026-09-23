import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [loadingRole, setLoadingRole] = useState(null);

  const handleLogin = async (role) => {
    setLoadingRole(role);
    // Simulate API network latency
    setTimeout(() => {
      const mockToken = `jwt-token-${role}-${Date.now()}`;
      signIn({ token: mockToken, role });
      setLoadingRole(null);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>Tsidat</Text>
      <Text style={styles.subtitle}>Select portal environment to sign in</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.citizenButton]}
          onPress={() => handleLogin('citizen')}
          disabled={loadingRole !== null}
        >
          {loadingRole === 'citizen' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Continue as Citizen</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.workerButton]}
          onPress={() => handleLogin('worker')}
          disabled={loadingRole !== null}
        >
          {loadingRole === 'worker' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Continue as Cleanup Worker</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citizenButton: {
    backgroundColor: '#2e7d32',
  },
  workerButton: {
    backgroundColor: '#1565c0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
