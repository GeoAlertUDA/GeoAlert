import { LucideMapPin, LucideMoveHorizontal } from "lucide-react-native";
import React from "react";
import { IAlarm } from "../types";
import { StyleSheet, Switch, Text, View } from "react-native";

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
  const toggleSwitch = () => {};

  return (
    <View style={styles.alarmContainer}>
      <LucideMapPin size={46} color={"#89B091"} />
      {/*Ubicacion*/}
      <View style={styles.alarmInfo}>
        <View>
          {name && <Text style={styles.alarmInfo_location_title}>{name}</Text>}
          <Text
            style={
              name
                ? styles.alarmInfo_location_subtitle
                : styles.alarmInfo_location_title
            }
          >
            {location.street} {location.number}, {location.city}
          </Text>
        </View>
        {/*Distancia*/}
        <View style={styles.alarmInfo_distance}>
          <Text style={styles.alarmInfo_distance_text}>{distance}m</Text>
          <LucideMoveHorizontal size={16} color={"#fff"} />
        </View>
      </View>

      {/*Toggle*/}
      <Switch
        style={{ alignSelf: "center" }}
        trackColor={{ false: "#000000", true: "#89B091" }}
        thumbColor={"#ffffff"}
        ios_backgroundColor="#000000"
        onValueChange={toggleSwitch}
        value={activeNow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alarmContainer: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A5357",
    borderRadius: 100,
  },
  alarmInfo: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
    marginLeft: 14,
    gap: 4,
    paddingHorizontal: 4,
  },
  alarmInfo_location_title: {
    fontFamily: "Manrope-Regular",
    color: "#fff",
    fontSize: 14,
  },
  alarmInfo_location_subtitle: {
    fontFamily: "Manrope-Regular",
    color: "#fff",
    fontSize: 10,
  },
  alarmInfo_distance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  alarmInfo_distance_text: {
    fontFamily: "Manrope-Extrabold",
    fontSize: 20,
    color: "#fff",
  },
});
