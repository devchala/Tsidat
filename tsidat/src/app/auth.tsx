import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    if (!email.trim() || password.length < 8 || (creating && name.trim().length < 2)) {
      Alert.alert(
        "Check your details",
        creating
          ? "Enter your name, email, and a password with at least 8 characters."
          : "Enter your email and password.",
      );
      return;
    }
    setBusy(true);
    try {
      if (creating) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              account_type: "resident",
              display_name: name.trim(),
              phone: phone.trim() || null,
            },
          },
        });
        if (error) throw error;
        if (!data.session)
          Alert.alert(
            "Check your email",
            "Your account was created. Confirm your email, then sign in.",
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      Alert.alert(
        creating ? "Could not create account" : "Could not sign in",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require("../../assets/images/tsidat-logo.png")} style={styles.brandMark} resizeMode="contain" accessibilityLabel="Tsidat logo" />
          <Text style={styles.brand}>
            Tsidat <Text style={styles.amharic}>ጽዳት</Text>
          </Text>
          <Text style={styles.tagline}>Cleaner communities, together.</Text>
          <View style={styles.card}>
            <Text style={styles.title}>
              {creating ? "Create your resident account" : "Welcome back"}
            </Text>
            <Text style={styles.subtitle}>
              {creating
                ? "Use the same account on Tsidat web and mobile."
                : "Sign in with your Tsidat account."}
            </Text>
            {creating ? (
              <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
            ) : null}
            {creating ? (
              <Field
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Pressable
              style={({ pressed }) => [
                styles.primary,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
              onPress={submit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>{creating ? "Create account" : "Sign in"}</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setCreating(!creating)} style={styles.switch}>
              <Text style={styles.switchText}>
                {creating ? "Already have an account? " : "New to Tsidat? "}
                <Text style={styles.switchLink}>{creating ? "Sign in" : "Create account"}</Text>
              </Text>
            </Pressable>
          </View>
          <Text style={styles.privacy}>
            Your reports and account are protected by Tsidat’s database permissions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={label}
        placeholderTextColor="#9ba79f"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#eff5ef" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  brandMark: {
    alignSelf: "center",
    width: 60,
    height: 52,
    marginBottom: 10,
  },
  brand: { textAlign: "center", color: "#183b2a", fontSize: 28, fontWeight: "800" },
  amharic: { color: "#23714f" },
  tagline: { textAlign: "center", color: "#738178", marginTop: 5, marginBottom: 28 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#173e29",
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: { color: "#183b2a", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#748078", marginTop: 7, marginBottom: 20, lineHeight: 20 },
  field: { marginBottom: 14 },
  label: { color: "#445249", fontWeight: "700", fontSize: 13, marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: "#dce6dd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#1c3023",
    backgroundColor: "#fbfdfb",
  },
  primary: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: "#23714f",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.6 },
  switch: { alignItems: "center", paddingTop: 18 },
  switchText: { color: "#6c7a70", fontSize: 14 },
  switchLink: { color: "#23714f", fontWeight: "800" },
  privacy: {
    marginTop: 22,
    textAlign: "center",
    color: "#7d8a81",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 14,
  },
});
