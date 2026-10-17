import { StyleSheet, Text, View } from "react-native";

type Point = { latitude: number; longitude: number };

export default function LocationPicker({
  value,
}: {
  value: Point | null;
  onChange: (point: Point) => void;
}) {
  return (
    <View style={styles.mapFallback}>
      <Text style={styles.title}>{value ? "Location pin selected" : "Choose a location pin"}</Text>
      <Text style={styles.hint}>
        {value
          ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "Use GPS to set the report location."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    height: 245,
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#e7eee8",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  title: { color: "#183b2a", fontWeight: "800" },
  hint: { color: "#718078", marginTop: 6, textAlign: "center" },
});
