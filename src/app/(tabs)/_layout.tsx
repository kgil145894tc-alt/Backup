import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
