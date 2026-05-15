import { ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IAlarm } from "@/types";
import { Alarm } from "./Alarm";
import { useCallback, useMemo } from "react";
import { LucideAlarmClock, LucideStar } from "lucide-react-native";
import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { useFocusEffect } from "expo-router";

export const AlarmScreen = () => {
  const alarms = useAlarmStore((s) => s.alarms);
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [loadAlarms]),
  );

  const activeAlarms = alarms.filter((a) => a.isActive);
  const favoriteAlarms = alarms.filter((a) => !a.isActive && a.isFavorite);
  const otherAlarms = alarms.filter((a) => !a.isActive && !a.isFavorite);

  const sections = [
    {
      title: "Alarma activa",
      isMainCategory: true,
      data: activeAlarms,
    },
    {
      title: "Favoritas",
      isMainCategory: false,
      isFirstRecent: true,
      icon: <LucideStar size={24} color={"#F9BF53"} />,
      data: favoriteAlarms,
    },
    {
      title: "Otras",
      isMainCategory: false,
      isFirstRecent: !favoriteAlarms.length, // si no hay favoritas, esta será la primera reciente
      icon: <LucideAlarmClock size={24} color={"#FFF"} />,
      data: otherAlarms,
    },
  ].filter((section) => section.data.length > 0);

  if (alarms.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingHorizontal: 20, gap: 10 },
        ]}
      >
        <Text style={styles.alarmCategoryTitle}>Alarmas</Text>
        <Text style={{ color: "#257B81" }}>
          No tienes alarmas guardadas todavía. ¡Agrega una alarma para no
          perderte tu parada!
        </Text>
      </View>
    );
  }
  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Alarm
          {...item}
          // onDelete={removeAlarm}
          // onStop={stopRinging}
        />
      )}
      // título de cada sección
      renderSectionHeader={({ section }) => (
        <View style={styles.headerContainer}>
          {/* título principal */}
          {!section.isMainCategory && section.isFirstRecent && (
            <Text style={styles.mainCategoryTitle}>Alarmas recientes</Text>
          )}

          {/* subcategoría */}
          {section.isMainCategory ? (
            <Text style={styles.alarmCategoryTitle}>{section.title}</Text>
          ) : (
            <View style={styles.subCategoryContainer}>
              {section.icon}
              <Text style={styles.subCategoryTitle}>{section.title}</Text>
            </View>
          )}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      SectionSeparatorComponent={() => <View style={{ height: 20 }} />}
    />
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
  mainCategoryTitle: {
    fontFamily: "Manrope-Extrabold",
    fontSize: 22,
    color: "#FFFFFF",
    marginTop: 10,
    marginBottom: 20,
  },
  headerContainer: {
    backgroundColor: "#0D393C",
    paddingVertical: 6,
  },
  subCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subCategoryTitle: {
    fontFamily: "Manrope-Semibold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
