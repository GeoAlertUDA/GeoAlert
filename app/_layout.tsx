import { SplashScreen } from "expo-router";
import TabLayout from "../src/navigation/AppNavigator";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

export default function App() {
  let [fontsLoaded] = useFonts({
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Semibold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Extrabold": Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null; // O un indicador de carga
  }

  return <TabLayout />;
}
