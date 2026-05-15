import { AlarmScreen } from "@/features/alarm/components/AlarmScreen";
import { View, Text, FlatList, Pressable } from "react-native";
import { useEffect, useCallback } from "react";
import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const alarms = () => {
  return <AlarmScreen />;
};

export default alarms;
