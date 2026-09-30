import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export default function ReportIssueScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Overflowing Bin');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Pick Image from Gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 12],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 2. Fetch Live GPS Coordinates & Reverse Geocode
  const resolveLocationAddress = async (latitude, longitude) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (address) {
        const street = address.street || address.name || address.district || '';
        const city = address.city || address.subregion || address.region || 'Ethiopia';
        const country = address.country || 'Ethiopia';

        const formattedAddress = [street, city, country].filter(Boolean).join(', ');
        if (formattedAddress) {
          return formattedAddress;
        }
      }
    } catch (nativeError) {
      if (__DEV__) {
        console.log('Native geocoder unavailable. Using OpenStreetMap fallback.');
      }
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'TsidatMobileApp/1.0',
            Referer: 'https://tsidat.app',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OpenStreetMap lookup failed with status ${response.status}`);
      }

      const data = await response.json();
      const address = data?.address || {};
      const road =
        address.road || address.pedestrian || address.neighbourhood || address.suburb || '';
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.state ||
        'Ethiopia';

      return road ? `${road}, ${city}` : city;
    } catch (fallbackError) {
      if (__DEV__) {
        console.log('Geocoding fallback failed:', fallbackError?.message || fallbackError);
      }
      return `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000,
      });

      const { latitude, longitude } = currentLocation.coords;
      const readableAddress = await resolveLocationAddress(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        readableAddress,
      });
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Failed to fetch GPS coordinates. Ensure Location/GPS is turned ON and your phone is connected to the internet.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  // 3. Submit Report
  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Details', 'Please provide a title and description for the issue.');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Report Submitted!', 'Thank you for helping keep the community clean.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Report Waste Issue</Text>
      <Text style={styles.subtitle}>Upload photos and tag GPS location for quick pickup.</Text>

      <Text style={styles.label}>Issue Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Overflowing dumpster near main market"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {['Overflowing Bin', 'Illegal Dumping', 'Drainage Block'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.activeCategoryChip]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.activeCategoryText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue in detail..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Attach Photo Proof</Text>
      <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
        <Text style={styles.mediaButtonText}>{image ? '📷 Change Photo' : '📷 Select Photo'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <Text style={styles.label}>GPS Location</Text>
      <TouchableOpacity
        style={styles.mediaButton}
        onPress={getCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#0d9488" />
        ) : (
          <Text style={styles.mediaButtonText}>
            {location ? '📍 Update GPS Location' : '📍 Tag Current GPS Location'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Visual Interactive Map Preview */}
      {location && (
        <View style={styles.mapCardContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Waste Location"
              description={location.readableAddress}
            />
          </MapView>
          <View style={styles.locationDetailsCard}>
            <Text style={styles.addressText}>📍 {location.readableAddress}</Text>
            <Text style={styles.locationText}>
              GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Issue Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 4 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  activeCategoryChip: { backgroundColor: '#0d9488' },
  categoryText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  activeCategoryText: { color: '#ffffff', fontWeight: '600' },
  mediaButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  mediaButtonText: { color: '#0d9488', fontWeight: '600', fontSize: 15 },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: 'cover',
  },
  mapCardContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  map: {
    width: '100%',
    height: 180,
  },
  locationDetailsCard: {
    backgroundColor: '#ccfbf1',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
  },
  locationText: { fontSize: 12, color: '#115e59', marginTop: 2, fontWeight: '500' },
  addressText: { fontSize: 14, color: '#0f766e', fontWeight: '700' },
  submitButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 40,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
