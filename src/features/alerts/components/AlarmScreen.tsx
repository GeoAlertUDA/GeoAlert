import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IAlarm } from "@/types";
import { Alarm } from "./Alarm";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useMemo } from "react";
import { LucideAlarmClock, LucideStar } from "lucide-react-native";

//despues reemplazar este hardcodeo por alarmas reales de la bd o store
const activeAlarm: IAlarm = {
  id: 1,
  name: null,
  latitude: -32.8895,
  longitude: -68.8458,
  radius: 500,
  isActive: true,
  isFavorite: false,
  address: "Av. San Martín 153, Ciudad",
};

const favoriteAlarms: IAlarm[] = [
  {
    id: 2,
    name: "Universidad",
    latitude: -32.8833,
    longitude: -68.8167,
    radius: 500,
    isActive: false,
    isFavorite: true,
    address: "Av. Colón 234, Ciudad",
  },
  {
    id: 3,
    name: null,
    latitude: -32.8833,
    longitude: -68.8167,
    radius: 1000,
    isActive: false,
    isFavorite: true,
    address: "Av. Colón 123, Ciudad",
  },
];

const otherAlarms = [
  {
    id: 4,
    name: "Casa",
    latitude: -32.8908,
    longitude: -68.8272,
    radius: 1500,
    isActive: false,
    isFavorite: false,
    address: "San Juan 3152, Godoy Cruz",
  },
];

export const AlarmScreen = () => {
  const insets = useSafeAreaInsets();

  // const alarms = useAlarmStore((state) => state.alarms);

  // const activeAlarm = useMemo(() => alarms.find((a) => a.isActive), [alarms]);

  // const favoriteAlarms = useMemo(
  //   () => alarms.filter((a) => !a.isActive && a.isFavorite),
  //   [alarms],
  // );

  // const otherAlarms = useMemo(
  //   () => alarms.filter((a) => !a.isActive && !a.isFavorite),
  //   [alarms],
  // );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
      ]}
    >
      {activeAlarm && (
        <>
          <Text style={styles.alarmCategoryTitle}>Alarma activa</Text>
          <Alarm {...activeAlarm} />
        </>
      )}

      <Text style={styles.alarmCategoryTitle}>Alarmas recientes</Text>
      {favoriteAlarms && (
        <View style={styles.otherAlarms_container}>
          <View style={styles.otherAlarms_categoryContainer}>
            <LucideStar size={18} color={"#F9BF53"} />
            <Text style={styles.otherAlarms_categoryTitle}>Favoritas</Text>
          </View>
          {favoriteAlarms.map((alarm, i) => (
            <Alarm key={i} {...alarm} />
          ))}
        </View>
      )}

      <View style={styles.otherAlarms_container}>
        <View style={styles.otherAlarms_categoryContainer}>
          <LucideAlarmClock size={18} color={"#FFF"} />
          <Text style={styles.otherAlarms_categoryTitle}>Otras</Text>
        </View>
        {otherAlarms.map((alarm, i) => (
          <Alarm key={i} {...alarm} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0D393C",
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
    gap: 20,
  },
  alarmCategoryTitle: {
    fontFamily: "Manrope-Extrabold",
    fontSize: 20,
    color: "#FFFFFF",
    width: "100%",
  },
  otherAlarms_container: {
    gap: 12,
  },
  otherAlarms_categoryContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    width: "100%",
  },
  otherAlarms_categoryTitle: {
    fontFamily: "Manrope-Semibold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
