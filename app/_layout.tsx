import "global.css";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { MenuProvider } from "react-native-popup-menu";
import TabLayout from "../src/navigation/AppNavigator";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createTables } from "../src/localDB/db";
import { syncAlarmGeofences } from "../src/features/alarm/service/alarmGeofencingService";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  let [fontsLoaded] = useFonts({
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Semibold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Extrabold": Manrope_800ExtraBold,
  });

  useEffect(() => {
    createTables()
      .then(() => syncAlarmGeofences({ requestPermissions: false }))
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error("[DB] createTables failed:", e);
        setDbReady(true);
      });
  }, []);

  if (!dbReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0D393C" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <TabLayout />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </MenuProvider>
  );
}
