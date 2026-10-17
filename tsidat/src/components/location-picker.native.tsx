import MapView, { Marker, type LatLng, type Region } from "react-native-maps";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

type Props = { value: LatLng | null; onChange: (point: LatLng) => void };
const DEFAULT_CENTER = { latitude: 9.0108, longitude: 38.7613 };

export default function LocationPicker({ value, onChange }: Props) {
  const map = useRef<MapView>(null);
  const initial = value ?? DEFAULT_CENTER;
  const latitude = value?.latitude;
  const longitude = value?.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const region: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
    map.current?.animateToRegion(region, 250);
  }, [latitude, longitude]);

  return (
    <View style={styles.frame}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...initial, latitudeDelta: 0.035, longitudeDelta: 0.035 }}
        onPress={(event) => onChange(event.nativeEvent.coordinate)}
        showsCompass
        toolbarEnabled={false}
        moveOnMarkerPress={false}
      >
        {value ? (
          <Marker
            coordinate={value}
            draggable
            pinColor="#23714f"
            onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 245,
    width: "100%",
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#e7eee8",
  },
});
