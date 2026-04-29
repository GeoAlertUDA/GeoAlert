import { LucideMapPin, LucideMoveHorizontal, View } from "lucide-react-native";
import React from "react";
import { IAlarm } from "../types";
import { StyleSheet, Text } from "react-native";

export const Alarm = ({
  name,
  distance,
  favorite,
  vibration,
  sound,
  location,
  lastUsed,
  activeNow,
}: IAlarm) => {
  return (
    <View style={styles.container}>
      <LucideMapPin />
      <View style={styles.alarmInfo}>
        <View style={styles.alarmInfo_location}>
          {name && <Text>{name}</Text>}
          <Text>
            {location.street} {location.number}
          </Text>
        </View>
        <View style={styles.alarmInfo_distance}>
          <Text>{distance}</Text>
          <LucideMoveHorizontal />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    flexDirection: "row",
    backgroundColor: "#1A5357",
    borderRadius: 100,
  },
  alarmInfo: {
    flexDirection: "column",
  },
  alarmInfo_location: {
    flexDirection: "column",
  },
  alarmInfo_distance: {
    flexDirection: "row",
  },
});
