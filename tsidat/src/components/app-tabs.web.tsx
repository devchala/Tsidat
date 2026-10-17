import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from "expo-router/ui";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

const items = {
  Reports: { ios: "list.bullet.rectangle", web: "list_alt" },
  "New report": { ios: "plus.app.fill", web: "add_a_photo" },
  Profile: { ios: "person.crop.circle", web: "person" },
} as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <View style={styles.bar}>
          <View style={styles.items}>
            <TabTrigger name="index" href="/" asChild>
              <TabButton>Reports</TabButton>
            </TabTrigger>
            <TabTrigger name="new-report" href="/new-report" asChild>
              <TabButton>New report</TabButton>
            </TabTrigger>
            <TabTrigger name="profile" href="/profile" asChild>
              <TabButton>Profile</TabButton>
            </TabTrigger>
          </View>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const label = String(children) as keyof typeof items;
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, isFocused && styles.iconSelected]}>
        <SymbolView name={items[label]} tintColor="#23714f" size={20} />
      </View>
      <Text style={[styles.label, isFocused && styles.labelSelected]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: "#e0e9e1",
  },
  items: {
    width: "100%",
    maxWidth: 560,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, minHeight: 48 },
  iconWrap: {
    width: 54,
    height: 28,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSelected: { backgroundColor: "#e6f1e8" },
  label: { color: "#23714f", fontSize: 11, fontWeight: "600" },
  labelSelected: { color: "#23714f", fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
