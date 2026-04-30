import { useAlarmStore } from "@/store/useAlarmStore";
import { IAlarm } from "@/types";
import { LucideMapPin, LucideMoveHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export const Alarm = ({
  id,
  name,
  latitude,
  longitude,
  radius,
  isActive,
  isFavorite,
  address,
}: IAlarm) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleActive = useAlarmStore((state) => state.toggleActive);
  const toggleFavorite = useAlarmStore((state) => state.toggleFavorite);
  const removeAlarm = useAlarmStore((state) => state.removeAlarm);

  const handleToggleSwitch = () => {
    toggleActive(id, isActive);
  };

  const handleFavorite = () => {
    toggleFavorite(id, isFavorite);
    setMenuVisible(false);
  };

  const handleDelete = () => {
    removeAlarm(id);
    setMenuVisible(false);
  };

  const handleEdit = () => {
    // agregar navegación a screen de edición
    setMenuVisible(false);
  };

  return (
    <Menu>
      <MenuTrigger>
        <View style={styles.alarmContainer}>
          <LucideMapPin size={46} color={"#89B091"} />
          {/*Ubicacion*/}
          <View style={styles.alarmInfo}>
            <View>
              {name && (
                <Text style={styles.alarmInfo_location_title}>{name}</Text>
              )}
              <Text
                style={
                  name
                    ? styles.alarmInfo_location_subtitle
                    : styles.alarmInfo_location_title
                }
              >
                {address}
              </Text>
            </View>
            {/*Distancia*/}
            <View style={styles.alarmInfo_distance}>
              <Text style={styles.alarmInfo_distance_text}>{radius}m</Text>
              <LucideMoveHorizontal size={16} color={"#fff"} />
            </View>
          </View>

          {/*Toggle*/}
          <Switch
            style={{ alignSelf: "center" }}
            trackColor={{ false: "#000000", true: "#89B091" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="#000000"
            onValueChange={handleToggleSwitch}
            value={isActive}
          />
        </View>
      </MenuTrigger>

      <MenuOptions customStyles={{ optionsContainer: styles.menuContainer }}>
        <MenuOption onSelect={handleFavorite} text="Favorita" />
        <MenuOption onSelect={handleDelete} text="Eliminar" />
        <MenuOption onSelect={handleEdit} text="Editar" />
      </MenuOptions>
    </Menu>
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
  //modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 25,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 15,
  },
  menuItemText: {
    fontFamily: "Manrope-Regular",
    fontSize: 16,
    color: "#000000",
  },
});
