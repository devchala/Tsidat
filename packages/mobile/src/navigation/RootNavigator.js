import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import CitizenHomeScreen from '../screens/citizen/HomeScreen';
import WorkerDashboardScreen from '../screens/worker/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { authState } = useContext(AuthContext);

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {authState.userToken === null ? (
          // Unauthenticated Flow
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : authState.userRole === 'worker' ? (
          // Worker Protected Flow
          <Stack.Screen
            name="WorkerDashboard"
            component={WorkerDashboardScreen}
            options={{
              title: 'Worker Operations',
              headerStyle: { backgroundColor: '#1565c0' },
              headerTintColor: '#ffffff',
            }}
          />
        ) : (
          // Citizen Protected Flow
          <Stack.Screen
            name="CitizenHome"
            component={CitizenHomeScreen}
            options={{
              title: 'Citizen Portal',
              headerStyle: { backgroundColor: '#2e7d32' },
              headerTintColor: '#ffffff',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
