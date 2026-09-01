import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ReportWasteScreen from '../screens/citizen/ReportWasteScreen';
import TaskListScreen from '../screens/worker/TaskListScreen';

const Stack = createNativeStackNavigator();

// TODO (team): add Login/Register screens, role-based initial route,
// and a proper tab navigator per role (citizen vs worker).
export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {user?.role === 'worker' ? (
        <Stack.Screen name="Tasks" component={TaskListScreen} />
      ) : (
        <Stack.Screen name="ReportWaste" component={ReportWasteScreen} options={{ title: 'Report Waste' }} />
      )}
    </Stack.Navigator>
  );
}
