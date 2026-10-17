import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  background: "#f3f7f3",
  card: "#ffffff",
  ink: "#183b2a",
  muted: "#718078",
  green: "#23714f",
  pale: "#e6f1e8",
  border: "#e0e9e1",
  red: "#b5483d",
};

export function Screen({ children }: React.PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {children}
    </SafeAreaView>
  );
}

export function Heading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.headingRow}>
      <View style={styles.headingText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  secondary,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
    </Pressable>
  );
}

export function Input({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#9ba79f" style={styles.input} {...props} />
    </View>
  );
}

export function StatusPill({ status }: { status: string }) {
  const info = statusInfo(status);
  return (
    <View style={[styles.pill, { backgroundColor: `${info.color}18` }]}>
      <Text style={[styles.pillText, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

export function Photo({ uri, style }: { uri: string | null; style?: object }) {
  if (!uri)
    return (
      <View style={[styles.photoFallback, style]}>
        <Text style={styles.photoFallbackText}>No photo</Text>
      </View>
    );
  return <Image source={{ uri }} contentFit="cover" style={[styles.photo, style]} />;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.green} />
      <Text style={styles.subtitle}>{label}</Text>
    </View>
  );
}

export function ErrorMessage({ children }: React.PropsWithChildren) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

import { statusInfo } from "@/lib/resident-data";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  headingText: { flex: 1 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  button: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  buttonSecondary: { backgroundColor: colors.pale },
  buttonSecondaryText: { color: colors.green },
  dim: { opacity: 0.7 },
  inputWrap: { gap: 7, marginBottom: 16 },
  label: { color: "#435349", fontWeight: "700", fontSize: 13 },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  pill: { borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10, alignSelf: "flex-start" },
  pillText: { fontWeight: "800", fontSize: 11 },
  photo: { backgroundColor: colors.pale },
  photoFallback: { backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" },
  photoFallbackText: { fontSize: 11, color: colors.muted },
  loading: { minHeight: 140, alignItems: "center", justifyContent: "center", gap: 10 },
  error: { padding: 12, borderRadius: 12, backgroundColor: "#faeae8" },
  errorText: { color: colors.red, lineHeight: 20 },
});
