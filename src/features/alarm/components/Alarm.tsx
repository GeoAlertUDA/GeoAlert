import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { IAlarm } from "@/types";
import {
  LucideMapPin,
  LucideMoveHorizontal,
  LucidePencil,
  LucideStar,
  LucideTrash,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import { useRouter } from "expo-router";

export const Alarm = ({
  id,
  name,
  latitude,
  longitude,
  radius,
  isActive,
  isFavorite,
  soundEnabled,
  vibrationEnabled,
  isRinging,
  address,
}: IAlarm) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleActive = useAlarmStore((state) => state.toggleActive);
  const toggleFavorite = useAlarmStore((state) => state.toggleFavorite);
  const removeAlarm = useAlarmStore((state) => state.removeAlarm);
  const stopRinging = useAlarmStore((state) => state.stopRinging);

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
    setMenuVisible(false);

    router.push({
      pathname: "/",
      params: {
        editAlarmId: String(id),
        editName: name || "",
        editLatitude: String(latitude),
        editLongitude: String(longitude),
        editRadius: String(radius),
        editAddress: address || "",
      },
    });
  };

  return (
    <Menu
      renderer={renderers.Popover}
      rendererProps={{
        placement: "bottom",
        preferredPlacement: "bottom",
        anchorStyle: { backgroundColor: "transparent" },
      }}
    >
      <MenuTrigger triggerOnLongPress={true}>
        <View
          style={[
            styles.alarmContainer,
            isRinging && styles.alarmRingingContainer,
          ]}
        >
          <LucideMapPin size={46} color={isRinging ? "#FF6B6B" : "#89B091"} />
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

            {isRinging && (
              <Pressable
                onPress={() => stopRinging(id)}
                style={styles.stopButton}
              >
                <Text style={styles.stopButtonText}>Detener Alarma</Text>
              </Pressable>
            )}
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
        <MenuOption onSelect={handleFavorite}>
          <View style={styles.menuItem}>
            <LucideStar size={22} color={"#F9BF53"} />
            <Text style={styles.menuItemText}>
              {isFavorite ? "Quitar de favoritas" : "Favorita"}
            </Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={handleDelete}>
          <View style={styles.menuItem}>
            <LucideTrash size={22} color="#9D1717" />
            <Text style={[styles.menuItemText]}>Eliminar</Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={handleEdit}>
          <View style={styles.menuItem}>
            <LucidePencil size={22} color="#000000" />
            <Text style={styles.menuItemText}>Editar</Text>
          </View>
        </MenuOption>
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
  alarmRingingContainer: {
    backgroundColor: "#3A1A1A",
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  stopButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  stopButtonText: {
    fontFamily: "Manrope-Bold",
    color: "#FFFFFF",
    fontSize: 12,
  },
  //modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "flex-end",
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
    left: 60,
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
  triggerWrapper: {
    borderRadius: 100,
    overflow: "hidden",
  },
});
