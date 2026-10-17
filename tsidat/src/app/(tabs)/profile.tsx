import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Button, colors, Heading, Screen } from "@/components/resident-ui";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!profile) return;
    if (name.trim().length < 2)
      return Alert.alert("Name required", "Enter at least two characters.");
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim(), phone: phone.trim() || null })
      .eq("id", profile.id);
    setBusy(false);
    if (error) return Alert.alert("Could not update profile", error.message);
    updateProfile({ display_name: name.trim(), phone: phone.trim() || null });
    Alert.alert("Saved", "Your profile has been updated.");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Heading title="Your profile" subtitle="Your resident account is shared with Tsidat web." />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.display_name || "R")[0].toUpperCase()}</Text>
        </View>
        <View style={styles.card}>
          <Field label="Full name" value={name} onChangeText={setName} />
          <Field label="Email" value={profile?.email ?? ""} editable={false} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Button
            title={busy ? "Saving…" : "Save profile"}
            onPress={() => void save()}
            disabled={busy}
          />
        </View>
        <Pressable
          style={styles.signout}
          onPress={() =>
            Alert.alert("Sign out?", "You can sign back in with your Tsidat account.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign out",
                style: "destructive",
                onPress: () => void supabase.auth.signOut(),
              },
            ])
          }
        >
          <Text style={styles.signoutText}>Sign out</Text>
        </Pressable>
        <Text style={styles.footnote}>Tsidat · Cleaner communities, transparent collection.</Text>
      </ScrollView>
    </Screen>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={{ marginBottom: 15, gap: 7 }}>
      <Text style={{ color: "#435349", fontSize: 13, fontWeight: "700" }}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9ba79f" {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  avatar: {
    alignSelf: "center",
    width: 86,
    height: 86,
    borderRadius: 29,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  avatarText: { color: colors.green, fontSize: 35, fontWeight: "900" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    color: colors.ink,
    backgroundColor: "#fbfdfb",
    fontSize: 15,
  },
  signout: {
    marginTop: 22,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#e7c8c4",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  signoutText: { color: "#a9433a", fontWeight: "800", fontSize: 15 },
  footnote: { color: colors.muted, textAlign: "center", marginTop: 24, fontSize: 11 },
});
