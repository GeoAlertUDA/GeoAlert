import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alarm } from "./Alarm";

export const AlarmScreen = () => {
  const insets = useSafeAreaInsets();

  const activeAlarm = true; //despues cambiar por fetch de la BD o de la store

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {activeAlarm && (
        <View style={styles.activeAlarmContainer}>
          <Text style={styles.alarmCategoryTitle}>Alarma activa</Text>
          <Alarm
            name="Trabajo"
            distance={5}
            favorite={false}
            vibration={true}
            sound={true}
            location={{ number: 153, street: "Av. San Martín" }}
            lastUsed={new Date()}
            activeNow={true}
          />
        </View>
      )}

      <Text style={styles.alarmCategoryTitle}>Alarmas recientes</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D393C",
  },
  activeAlarmContainer: {
    flexDirection: "column",
    flex: 1,
  },
  alarmCategoryTitle: {
    fontFamily: "Manrope",
    fontWeight: "black",
    fontSize: 20,
    color: "#FFFFFF",
  },
});
