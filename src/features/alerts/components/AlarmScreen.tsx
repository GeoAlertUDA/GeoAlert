import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alarm } from "./Alarm";

//despues reemplazar este hardcodeo por alarmas reales de la bd o store
const activeAlarm = {
  distance: 500,
  favorite: false,
  vibration: true,
  sound: true,
  location: {
    number: 153,
    street: "Av. San Martín",
    city: "Ciudad",
  },
  lastUsed: new Date(),
  activeNow: true,
};

const otherAlarms = [
  {
    name: "Universidad",
    distance: 500,
    favorite: true,
    vibration: true,
    sound: true,
    location: {
      number: 234,
      street: "Av. Colón",
      city: "Ciudad",
    },
    lastUsed: new Date(),
    activeNow: false,
  },
  {
    distance: 1000,
    favorite: true,
    vibration: true,
    sound: true,
    location: {
      number: 123,
      street: "Av. Colón",
      city: "Ciudad",
    },
    lastUsed: new Date(),
    activeNow: false,
  },
  {
    name: "Casa",
    distance: 1500,
    favorite: false,
    vibration: true,
    sound: true,
    location: {
      number: 3152,
      street: "San Juan",
      city: "Godoy Cruz",
    },
    lastUsed: new Date(),
    activeNow: false,
  },
];

export const AlarmScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {activeAlarm && (
        <>
          <Text style={styles.alarmCategoryTitle}>Alarma activa</Text>
          <Alarm {...activeAlarm} />
        </>
      )}

      <Text style={styles.alarmCategoryTitle}>Alarmas recientes</Text>
      {otherAlarms.map((alarm, i) => (
        <Alarm key={i} {...alarm} />
      ))}
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
    paddingBottom: 40,
  },
  alarmCategoryTitle: {
    fontFamily: "Manrope-Extrabold",
    fontSize: 20,
    color: "#FFFFFF",
    width: "100%",
  },
});
