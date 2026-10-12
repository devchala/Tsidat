import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';

// Mock Assigned Tasks Data
const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Overflowing Bin near Main Market',
    category: 'Overflowing Bin',
    address: 'Sekela, Hawassa',
    latitude: 9.66185,
    longitude: 37.07877,
    status: 'Pending',
    createdAt: '10 mins ago',
  },
  {
    id: '2',
    title: 'Blocked Drainage Channel',
    category: 'Drainage Block',
    address: 'Bole Subcity, Addis Ababa',
    latitude: 8.9806,
    longitude: 38.7578,
    status: 'In Progress',
    createdAt: '1 hour ago',
  },
  {
    id: '3',
    title: 'Illegal Dumping by Riverbed',
    category: 'Illegal Dumping',
    address: 'Lideta, Addis Ababa',
    latitude: 9.0105,
    longitude: 38.7391,
    status: 'Pending',
    createdAt: '3 hours ago',
  },
];

export default function WorkerHomeScreen({ navigation }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Open GPS Coordinates in Native Maps App (Google Maps / Apple Maps)
  const openNavigation = (lat, lng, label) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.select({
      ios: `${scheme}0,0?q=${label}@${lat},${lng}`,
      android: `${scheme}${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps application.');
    });
  };

  // Update Task Status Lifecycle
  const updateTaskStatus = (taskId, currentStatus) => {
    let nextStatus = 'In Progress';
    if (currentStatus === 'In Progress') {
      nextStatus = 'Resolved';
    } else if (currentStatus === 'Resolved') {
      nextStatus = 'Pending';
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task))
    );
  };

  const renderTaskItem = ({ item }) => {
    const isResolved = item.status === 'Resolved';
    const isInProgress = item.status === 'In Progress';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryChip}>{item.category}</Text>
          <View
            style={[
              styles.statusBadge,
              isResolved
                ? styles.statusResolved
                : isInProgress
                  ? styles.statusInProgress
                  : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isResolved
                  ? styles.textResolved
                  : isInProgress
                    ? styles.textInProgress
                    : styles.textPending,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.locationText}>📍 {item.address}</Text>
        <Text style={styles.timeText}>Reported: {item.createdAt}</Text>

        <View style={styles.actionRow}>
          {/* Navigation Button */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => openNavigation(item.latitude, item.longitude, item.title)}
          >
            <Text style={styles.navButtonText}>🗺️ Navigate</Text>
          </TouchableOpacity>

          {/* Status Toggle Button */}
          <TouchableOpacity
            style={[styles.statusButton, isResolved && styles.resolvedButton]}
            onPress={() => updateTaskStatus(item.id, item.status)}
          >
            <Text style={styles.statusButtonText}>
              {item.status === 'Pending'
                ? 'Start Task'
                : item.status === 'In Progress'
                  ? 'Mark Resolved'
                  : 'Reopen Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Worker Operations</Text>
        <Text style={styles.headerSubtitle}>Assigned Waste Pickups & Tasks</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0d9488', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  headerSubtitle: { fontSize: 13, color: '#ccfbf1', marginTop: 2 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPending: { backgroundColor: '#fef3c7' },
  statusInProgress: { backgroundColor: '#dbeafe' },
  statusResolved: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 12, fontWeight: '700' },
  textPending: { color: '#d97706' },
  textInProgress: { color: '#2563eb' },
  textResolved: { color: '#16a34a' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 10 },
  locationText: { fontSize: 14, color: '#0d9488', fontWeight: '600', marginTop: 6 },
  timeText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  navButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  navButtonText: { color: '#334155', fontWeight: '600', fontSize: 13 },
  statusButton: {
    flex: 1,
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolvedButton: { backgroundColor: '#64748b' },
  statusButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
