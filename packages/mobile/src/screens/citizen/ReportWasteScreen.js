import { View, Text, Button, StyleSheet } from 'react-native';

// TODO (team): camera capture (expo-image-picker), GPS auto-location
// (expo-location), category picker, description input, submit to
// POST /reports. Mirror the web ReportWaste.jsx flow.
export default function ReportWasteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report waste with a photo and location</Text>
      <Button title="Take Photo" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7FAF8' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#17201A' },
});
