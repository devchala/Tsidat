import { View, Text, StyleSheet } from 'react-native';

// TODO (team): assigned tasks list, navigation link-out, status update
// buttons (En Route / In Progress / Completed), completion photo upload.
export default function TaskListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assigned Tasks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7FAF8' },
  title: { fontSize: 16, fontWeight: '600', color: '#17201A' },
});
