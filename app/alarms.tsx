import { AlarmScreen } from "@/features/alerts/components/AlarmScreen";
import { View, Text, FlatList, Pressable } from "react-native";
import { useEffect } from "react";
import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const alarms = () => {
  const alarms = useAlarmStore((s) => s.alarms);
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const removeAlarm = useAlarmStore((s) => s.removeAlarm);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAlarms();
  }, []);

  return <AlarmScreen />;
};
