import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#f3f7f3"
      indicatorColor="#e6f1e8"
      tintColor="#23714f"
      iconColor={{ default: "#23714f", selected: "#23714f" }}
      labelStyle={{
        default: { color: "#23714f" },
        selected: { color: "#23714f", fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Reports</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }}
          md="list_alt"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="new-report">
        <NativeTabs.Trigger.Label>New report</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.app", selected: "plus.app.fill" }}
          md="add_a_photo"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
