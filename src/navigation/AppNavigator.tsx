import { Tabs } from "expo-router";
import { TabBar } from "../components/TabBar";

export default function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar{...props} />}
      screenOptions={{
        headerShown: false,
      }}
      >
      <Tabs.Screen name="alarms" options={{ title: "Alarmas" }} />
      <Tabs.Screen name="index" options={{ title: "Mapa" }} />
      <Tabs.Screen name="options" options={{ title: "Configuracion" }} />

    </Tabs>
  );
}
