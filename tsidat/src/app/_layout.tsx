import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from "react-native";

import { AuthProvider, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function RootNavigator() {
  const scheme = useColorScheme();
  const { session, loading, error, isResident } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#23714f" />
        <Text style={styles.muted}>Connecting to Tsidat…</Text>
      </View>
    );
  }

  if (error && session) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Could not load your account</Text>
        <Text style={styles.muted}>{error}</Text>
        <Text style={styles.link} onPress={() => supabase.auth.signOut()}>
          Sign out
        </Text>
      </View>
    );
  }

  if (session && !isResident) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Resident accounts only</Text>
        <Text style={styles.muted}>
          This mobile app is for residents. Use the Tsidat web app for your other account role.
        </Text>
        <Text style={styles.link} onPress={() => supabase.auth.signOut()}>
          Sign out
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? <Stack.Screen name="auth" /> : <Stack.Screen name="(tabs)" />}
        {session ? (
          <Stack.Screen
            name="reports/[id]"
            options={{ headerShown: true, title: "Report progress", headerBackTitle: "Reports" }}
          />
        ) : null}
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
    backgroundColor: "#f4f7f3",
  },
  heading: { color: "#183b2a", fontSize: 22, fontWeight: "800", textAlign: "center" },
  muted: { maxWidth: 340, color: "#66756b", fontSize: 15, lineHeight: 22, textAlign: "center" },
  link: { marginTop: 8, color: "#23714f", fontSize: 16, fontWeight: "700" },
});
