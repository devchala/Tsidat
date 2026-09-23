import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CitizenHomeScreen from '../screens/citizen/HomeScreen';
import WorkerDashboardScreen from '../screens/worker/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2e7d32' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: '#2e7d32',
        }}
      >
        <Tab.Screen
          name="CitizenHome"
          component={CitizenHomeScreen}
          options={{ title: 'Citizen Portal' }}
        />
        <Tab.Screen
          name="WorkerDashboard"
          component={WorkerDashboardScreen}
          options={{ title: 'Worker Portal' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
