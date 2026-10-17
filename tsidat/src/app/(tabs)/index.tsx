import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Button,
  colors,
  ErrorMessage,
  Heading,
  Photo,
  Screen,
  StatusPill,
} from "@/components/resident-ui";
import { useAuth } from "@/lib/auth";
import { categoryLabel, statusInfo } from "@/lib/resident-data";
import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  reference: string;
  category: string;
  status: string;
  created_at: string;
  image_path: string;
  location_description: string | null;
  latitude: number;
  longitude: number;
};
type ReportCard = Report & { imageUrl: string | null };

export default function ResidentHome() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(
    async (refresh = false) => {
      if (!profile) return;
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from("reports")
        .select(
          "id,reference,category,status,created_at,image_path,location_description,latitude,longitude",
        )
        .eq("resident_id", profile.id)
        .order("created_at", { ascending: false });
      if (queryError) {
        setError(queryError.message);
        setReports([]);
      } else {
        const cards = await Promise.all(
          (data ?? []).map(async (report) => {
            const { data: signed } = await supabase.storage
              .from("report-images")
              .createSignedUrl(report.image_path, 3600);
            return { ...report, imageUrl: signed?.signedUrl ?? null } as ReportCard;
          }),
        );
        setReports(cards);
      }
      setLoading(false);
      setRefreshing(false);
    },
    [profile],
  );

  useEffect(() => {
    void loadReports();
  }, [loadReports]);
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`resident-reports-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports", filter: `resident_id=eq.${profile.id}` },
        () => void loadReports(true),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile, loadReports]);

  const openCount = reports.filter(
    (report) => !["completed", "rejected"].includes(report.status),
  ).length;
  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "there";

  return (
    <Screen>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadReports(true)}
            tintColor={colors.green}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.topline}>
              <Text style={styles.wordmark}>
                Tsidat <Text style={styles.amharic}>ጽዳት</Text>
              </Text>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
              </View>
            </View>
            <Heading
              title={`Hello, ${firstName}`}
              subtitle="Every report helps keep your community cleaner."
            />
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryLabel}>YOUR REPORTS</Text>
                <Text style={styles.summaryCount}>{reports.length}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View>
                <Text style={styles.summaryLabel}>IN PROGRESS</Text>
                <Text style={styles.summaryCount}>{openCount}</Text>
              </View>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryLeaf}>✦</Text>
              </View>
            </View>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionHeading}>Your reports</Text>
              <Text style={styles.sectionHint}>{reports.length} total</Text>
            </View>
            {error ? <ErrorMessage>Could not load your reports: {error}</ErrorMessage> : null}
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.green} />
                <Text style={styles.emptyHint}>Loading your reports…</Text>
              </View>
            ) : null}
            {!loading && reports.length === 0 && !error ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>⌖</Text>
                <Text style={styles.emptyTitle}>Nothing reported yet</Text>
                <Text style={styles.emptyHint}>
                  Spotted waste nearby? Send a photo and location to get it moving.
                </Text>
                <Button title="Report waste" onPress={() => router.push("/(tabs)/new-report")} />
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => <ReportRow report={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
        ListFooterComponent={
          <Text style={styles.footer}>Reports are shared with your local Tsidat team.</Text>
        }
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => router.push("/(tabs)/new-report")}
      >
        <Text style={styles.fabPlus}>＋</Text>
        <Text style={styles.fabText}>New report</Text>
      </Pressable>
    </Screen>
  );
}

function ReportRow({ report }: { report: ReportCard }) {
  const info = statusInfo(report.status);
  const date = new Date(report.created_at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/reports/[id]", params: { id: report.id } })}
      style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.8 }]}
    >
      <Photo uri={report.imageUrl} style={styles.thumb} />
      <View style={styles.reportInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.reference}>{report.reference}</Text>
          <StatusPill status={report.status} />
        </View>
        <Text style={styles.category}>{categoryLabel(report.category)}</Text>
        <Text numberOfLines={1} style={styles.location}>
          {report.location_description ||
            `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
        </Text>
        <Text style={styles.date}>{date}</Text>
        {info.hint ? (
          <Text numberOfLines={1} style={styles.hint}>
            {info.hint}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 110 },
  topline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  wordmark: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  amharic: { color: colors.green },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.green, fontWeight: "900", fontSize: 16 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
  },
  summaryLabel: { color: "#afc7b4", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  summaryCount: { color: "#fff", fontSize: 25, fontWeight: "800", marginTop: 3 },
  summaryDivider: { height: 38, width: 1, backgroundColor: "#466052", marginHorizontal: 25 },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2f6149",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  summaryLeaf: { color: "#c8ebce", fontSize: 22 },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionHeading: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  sectionHint: { color: colors.muted, fontSize: 12 },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 17,
  },
  thumb: { width: 75, height: 80, borderRadius: 12 },
  reportInfo: { flex: 1, minWidth: 0, gap: 4 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  reference: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  category: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  location: { color: colors.muted, fontSize: 11 },
  date: { color: "#8a968e", fontSize: 10 },
  hint: { color: colors.green, fontSize: 10 },
  chevron: { color: "#9aa89f", fontSize: 25, marginLeft: 2 },
  empty: {
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 22,
    borderRadius: 18,
    gap: 9,
  },
  emptyIcon: {
    color: colors.green,
    backgroundColor: colors.pale,
    width: 56,
    height: 56,
    borderRadius: 19,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 27,
  },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  emptyHint: { color: colors.muted, lineHeight: 20, textAlign: "center", marginBottom: 5 },
  loading: { alignItems: "center", padding: 26, gap: 8 },
  footer: { textAlign: "center", color: colors.muted, fontSize: 11, paddingVertical: 24 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 18,
    backgroundColor: colors.green,
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 5,
    shadowColor: "#173e29",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPlus: { color: "#fff", fontSize: 23 },
  fabText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
