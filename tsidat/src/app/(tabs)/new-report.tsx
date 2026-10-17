import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, colors, ErrorMessage, Heading, Input, Screen } from "@/components/resident-ui";
import LocationPicker from "@/components/location-picker";
import { useAuth } from "@/lib/auth";
import { CATEGORIES } from "@/lib/resident-data";
import { supabase } from "@/lib/supabase";

type LocationOption = { id: string; name: string };
type PickedPhoto = { uri: string; mimeType: string; fileName: string; fileSize?: number };

export default function NewReportScreen() {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id,name")
      .order("name")
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        const rows = (data ?? []) as LocationOption[];
        setLocations(rows);
        if (rows.length === 1) setSelectedLocation(rows[0].id);
        setLoadingLocations(false);
      });
  }, []);

  async function choosePhoto(camera: boolean) {
    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        return Alert.alert(
          "Camera access needed",
          "Allow camera access to photograph the waste you want to report.",
        );
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.82,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.82,
        });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024)
      return Alert.alert("Photo too large", "Choose a photo smaller than 8 MB.");
    const mimeType = asset.mimeType ?? "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType))
      return Alert.alert("Unsupported photo", "Use a JPG, PNG, or WEBP image.");
    setPhoto({
      uri: asset.uri,
      mimeType,
      fileName: asset.fileName ?? `report.${mimeType.split("/")[1]}`,
      fileSize: asset.fileSize ?? undefined,
    });
  }

  async function locate() {
    setError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted)
      return setError(
        "Allow location access to pin where the waste is. You can still enter a nearby landmark below.",
      );
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    } catch {
      setError(
        "Could not get your location. Try again outdoors or check your device location settings.",
      );
    }
  }

  async function submitReport() {
    if (!profile) return;
    if (
      !photo ||
      !category ||
      !description.trim() ||
      description.trim().length < 10 ||
      !position ||
      !selectedLocation
    ) {
      return setError(
        "Add a photo, category, description (at least 10 characters), service location, and GPS position.",
      );
    }
    setBusy(true);
    setError(null);
    let uploadedPath: string | null = null;
    try {
      const { data: nearby, error: nearbyError } = await supabase.rpc("location_nearby_reports", {
        _lat: position.latitude,
        _lng: position.longitude,
        _location: selectedLocation,
      });
      if (nearbyError) throw nearbyError;
      if (nearby?.length) {
        const proceed = await new Promise<boolean>((resolve) =>
          Alert.alert(
            "A nearby report exists",
            `${nearby.length} open report${nearby.length === 1 ? "" : "s"} are already near this spot. Submit yours too?`,
            [
              { text: "Review my report", style: "cancel", onPress: () => resolve(false) },
              { text: "Submit anyway", onPress: () => resolve(true) },
            ],
            { cancelable: false },
          ),
        );
        if (!proceed) return;
      }

      const extension = photo.mimeType.split("/")[1] || "jpg";
      const fileId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      uploadedPath = `${profile.id}/${fileId}.${extension}`;
      const localFile = await fetch(photo.uri);
      const bytes = await localFile.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(uploadedPath, bytes, { contentType: photo.mimeType, upsert: false });
      if (uploadError) throw uploadError;
      const { data, error: insertError } = await supabase
        .from("reports")
        .insert({
          resident_id: profile.id,
          category,
          description: description.trim(),
          image_path: uploadedPath,
          latitude: position.latitude,
          longitude: position.longitude,
          location_description: locationDescription.trim() || null,
          location_id: selectedLocation,
        })
        .select("id,reference")
        .single();
      if (insertError) throw insertError;
      Alert.alert("Report sent", `${data.reference} has been received by your local Tsidat team.`, [
        {
          text: "View report",
          onPress: () => router.replace({ pathname: "/reports/[id]", params: { id: data.id } }),
        },
      ]);
    } catch (err) {
      if (uploadedPath) await supabase.storage.from("report-images").remove([uploadedPath]);
      setError(
        err instanceof Error ? err.message : "Could not submit your report. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>HELP YOUR COMMUNITY</Text>
        <Heading
          title="Report waste"
          subtitle="Add a photo and location so the right local team can respond."
        />
        {error ? (
          <View style={styles.errorWrap}>
            <ErrorMessage>{error}</ErrorMessage>
          </View>
        ) : null}

        <Text style={styles.stepTitle}>1. Show us the problem</Text>
        {photo ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photo.uri }} style={styles.preview} />
            <Pressable onPress={() => setPhoto(null)} style={styles.remove}>
              <Text style={styles.removeText}>Remove photo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <Pressable onPress={() => void choosePhoto(true)} style={styles.photoButton}>
              <Text style={styles.photoIcon}>◎</Text>
              <Text style={styles.photoButtonTitle}>Take a photo</Text>
              <Text style={styles.small}>Use your camera</Text>
            </Pressable>
            <Pressable onPress={() => void choosePhoto(false)} style={styles.photoButton}>
              <Text style={styles.photoIcon}>▧</Text>
              <Text style={styles.photoButtonTitle}>Choose photo</Text>
              <Text style={styles.small}>From your library</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.stepTitle}>2. Choose a category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setCategory(item.value)}
              style={[styles.chip, category === item.value && styles.chipSelected]}
            >
              <Text style={[styles.chipText, category === item.value && styles.chipTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.stepTitle}>3. Add details</Text>
        <View style={styles.textBox}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is happening? Add useful details for the collection team."
            placeholderTextColor="#9ba79f"
            multiline
            maxLength={1000}
            textAlignVertical="top"
            style={styles.textArea}
          />
          <Text style={styles.counter}>
            {description.trim().length}/1000 · 10 characters minimum
          </Text>
        </View>
        <Input
          label="Nearby landmark (optional)"
          value={locationDescription}
          onChangeText={setLocationDescription}
          placeholder="Street, building, or landmark"
          maxLength={300}
        />

        <Text style={styles.stepTitle}>4. Pin the location</Text>
        <View style={styles.locationBox}>
          <Text style={styles.locationLabel}>Service area</Text>
          {loadingLocations ? (
            <ActivityIndicator color={colors.green} />
          ) : locations.length ? (
            <View style={styles.chips}>
              {locations.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedLocation(item.id)}
                  style={[styles.chip, selectedLocation === item.id && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedLocation === item.id && styles.chipTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.small}>No service areas are configured yet.</Text>
          )}
          <Text style={styles.small}>Tap the map to place the pin, or drag it to adjust.</Text>
          <LocationPicker value={position} onChange={setPosition} />
          <Pressable style={styles.gpsButton} onPress={() => void locate()}>
            <Text style={styles.gpsIcon}>⌖</Text>
            <Text style={styles.gpsTitle}>
              {position ? "Update GPS pin" : "Use my current location"}
            </Text>
          </Pressable>
          {position ? (
            <Text style={styles.coordinates}>
              Pinned at {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.small}>Location access is used only to place this report pin.</Text>
          )}
        </View>

        <View style={styles.submitBox}>
          <Text style={styles.submitNote}>
            Your report will be visible to your local Tsidat team. You can track its status in My
            reports.
          </Text>
          <Button
            title={busy ? "Sending report…" : "Submit report"}
            onPress={() => void submitReport()}
            disabled={busy}
          />
          {busy ? <ActivityIndicator style={{ marginTop: 10 }} color={colors.green} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 42 },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  errorWrap: { marginBottom: 16 },
  stepTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 10,
  },
  photoButtons: { flexDirection: "row", gap: 10 },
  photoButton: {
    flex: 1,
    minHeight: 132,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  photoIcon: { fontSize: 27, color: colors.green, marginBottom: 5 },
  photoButtonTitle: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  small: { color: colors.muted, fontSize: 12, marginTop: 5 },
  photoWrap: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: { width: "100%", height: 210, resizeMode: "cover" },
  remove: { padding: 11 },
  removeText: { color: colors.red, textAlign: "center", fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 99,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.pale, borderColor: colors.green },
  chipText: { color: "#58665d", fontSize: 12, fontWeight: "700" },
  chipTextSelected: { color: colors.green },
  textBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: "#fff",
    padding: 12,
  },
  textArea: { minHeight: 112, color: colors.ink, fontSize: 15, lineHeight: 21 },
  counter: { color: "#929e95", fontSize: 11, textAlign: "right" },
  locationBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 11,
  },
  locationLabel: { color: "#435349", fontWeight: "800", fontSize: 13 },
  gpsButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.pale,
  },
  gpsIcon: { color: colors.green, fontSize: 20 },
  gpsTitle: { color: colors.green, fontWeight: "800" },
  coordinates: { color: colors.green, fontSize: 12, fontWeight: "700", textAlign: "center" },
  submitBox: { marginTop: 24, backgroundColor: "#e7f0e8", borderRadius: 17, padding: 16 },
  submitNote: { color: "#5e6f63", fontSize: 12, lineHeight: 18, marginBottom: 12 },
});
