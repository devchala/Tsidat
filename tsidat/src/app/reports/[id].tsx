import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, ErrorMessage, Photo, Screen, StatusPill } from "@/components/resident-ui";
import { useAuth } from "@/lib/auth";
import { categoryLabel, statusInfo } from "@/lib/resident-data";
import { supabase } from "@/lib/supabase";

type ReportDetail = {
  id: string;
  reference: string;
  category: string;
  status: string;
  created_at: string;
  image_path: string;
  description: string;
  location_description: string | null;
  latitude: number;
  longitude: number;
  review_reason: string | null;
  incident_id: string | null;
};
type HistoryRow = {
  id: string;
  to_status: string;
  note: string | null;
  created_at: string;
  actor_role: string | null;
};
type FeedbackRow = { id: string; rating: number; comment: string | null };
type CompletionRow = {
  completion_image_path: string | null;
  completion_notes: string | null;
  verification_status: string;
  completed_at: string | null;
};
type Detail = {
  report: ReportDetail;
  history: HistoryRow[];
  feedback: FeedbackRow | null;
  completion: CompletionRow | null;
  imageUrl: string | null;
  completionUrl: string | null;
};

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (reportError || !report) {
      setError(reportError?.message ?? "Report not found.");
      setLoading(false);
      return;
    }
    const [{ data: history }, { data: feedback }, assignmentsResult] = await Promise.all([
      supabase
        .from("status_history")
        .select("id,to_status,note,created_at,actor_role")
        .eq("report_id", id)
        .order("created_at"),
      supabase.from("feedback").select("id,rating,comment").eq("report_id", id).maybeSingle(),
      report.incident_id
        ? supabase
            .from("assignments")
            .select("completion_image_path,completion_notes,verification_status,completed_at")
            .eq("incident_id", report.incident_id)
            .eq("status", "completed")
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    const completion = assignmentsResult.data;
    const [{ data: reportImage }, { data: completionImage }] = await Promise.all([
      supabase.storage.from("report-images").createSignedUrl(report.image_path, 3600),
      completion?.completion_image_path
        ? supabase.storage
            .from("completion-images")
            .createSignedUrl(completion.completion_image_path, 3600)
        : Promise.resolve({ data: null }),
    ]);
    setDetail({
      report: report as ReportDetail,
      history: (history ?? []) as HistoryRow[],
      feedback: feedback as FeedbackRow | null,
      completion: completion as CompletionRow | null,
      imageUrl: reportImage?.signedUrl ?? null,
      completionUrl: completionImage?.signedUrl ?? null,
    });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendFeedback() {
    if (!profile || !detail || !rating)
      return Alert.alert("Choose a rating", "Select between one and five stars.");
    setSending(true);
    const { error: insertError } = await supabase
      .from("feedback")
      .insert({ report_id: id, resident_id: profile.id, rating, comment: comment.trim() || null });
    setSending(false);
    if (insertError) return Alert.alert("Could not send feedback", insertError.message);
    await load();
    Alert.alert("Thank you", "Your feedback has been saved.");
  }

  if (loading)
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
          <Text style={styles.muted}>Loading report…</Text>
        </View>
      </Screen>
    );
  if (error || !detail)
    return (
      <Screen>
        <View style={styles.content}>
          <ErrorMessage>{error ?? "Report not found."}</ErrorMessage>
        </View>
      </Screen>
    );
  const { report } = detail;
  const status = statusInfo(report.status);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.reference}>{report.reference}</Text>
        <Text style={styles.title}>{categoryLabel(report.category)}</Text>
        <View style={styles.statusRow}>
          <StatusPill status={report.status} />
          <Text style={styles.created}>
            {new Date(report.created_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current status</Text>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          <Text style={styles.muted}>{status.hint}</Text>
        </View>

        <Text style={styles.sectionTitle}>Progress updates</Text>
        <View style={styles.timeline}>
          {detail.history.map((row, index) => {
            const itemStatus = statusInfo(row.to_status);
            return (
              <View key={row.id ?? `${row.to_status}-${index}`} style={styles.timelineItem}>
                <View style={styles.timelineRail}>
                  <View style={[styles.dot, { backgroundColor: itemStatus.color }]} />
                  {index < detail.history.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>{itemStatus.label}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(row.created_at).toLocaleString()}
                  </Text>
                  {row.note ? <Text style={styles.timelineNote}>{row.note}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Report details</Text>
        <Photo uri={detail.imageUrl} style={styles.reportPhoto} />
        <View style={styles.infoCard}>
          <Text style={styles.description}>{report.description}</Text>
          <Text style={styles.location}>
            {report.location_description ||
              `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
          </Text>
          {report.review_reason ? (
            <Text style={styles.reason}>Review note: {report.review_reason}</Text>
          ) : null}
        </View>

        {detail.completion?.completion_image_path ? (
          <>
            <Text style={styles.sectionTitle}>Collection proof</Text>
            <Photo uri={detail.completionUrl} style={styles.reportPhoto} />
            {detail.completion.completion_notes ? (
              <Text style={styles.muted}>{detail.completion.completion_notes}</Text>
            ) : null}
          </>
        ) : null}

        {report.status === "completed" ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>Rate the service</Text>
            {detail.feedback ? (
              <Text style={styles.muted}>
                You rated {detail.feedback.rating}/5
                {detail.feedback.comment ? ` · ${detail.feedback.comment}` : ""}
              </Text>
            ) : (
              <>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => setRating(n)}>
                      <Text style={[styles.star, n <= rating && styles.starOn]}>★</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={styles.comment}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={500}
                  multiline
                  placeholder="Anything to add? (optional)"
                  placeholderTextColor="#9ba79f"
                />
                <Pressable
                  disabled={sending}
                  onPress={() => void sendFeedback()}
                  style={[styles.sendButton, sending && { opacity: 0.6 }]}
                >
                  <Text style={styles.sendButtonText}>
                    {sending ? "Sending…" : "Send feedback"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 9 },
  reference: { color: colors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900", marginTop: 4 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  created: { color: colors.muted, fontSize: 12 },
  statusCard: {
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  statusLabel: { fontSize: 19, fontWeight: "900", marginTop: 5, textTransform: "capitalize" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 4 },
  sectionTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17,
    marginTop: 23,
    marginBottom: 11,
  },
  timeline: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineItem: { flexDirection: "row", minHeight: 62 },
  timelineRail: { alignItems: "center", width: 20, marginRight: 8 },
  dot: { width: 11, height: 11, borderRadius: 99, marginTop: 3 },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  timelineBody: { flex: 1, paddingBottom: 14 },
  timelineTitle: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  timelineDate: { color: colors.muted, fontSize: 10, marginTop: 2 },
  timelineNote: { color: "#516057", fontSize: 12, lineHeight: 18, marginTop: 5 },
  reportPhoto: { width: "100%", aspectRatio: 1.35, borderRadius: 17, overflow: "hidden" },
  infoCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
    gap: 10,
  },
  description: { color: colors.ink, fontSize: 14, lineHeight: 21 },
  location: { color: colors.muted, fontSize: 12 },
  reason: { color: "#9a3e35", lineHeight: 19, fontSize: 13 },
  feedbackCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 18,
  },
  stars: { flexDirection: "row", gap: 8, marginVertical: 6 },
  star: { color: "#d9e1da", fontSize: 33 },
  starOn: { color: "#d89939" },
  comment: {
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#f9fbf9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 11,
    color: colors.ink,
  },
  sendButton: {
    marginTop: 12,
    backgroundColor: colors.green,
    minHeight: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: { color: "#fff", fontWeight: "800" },
});
