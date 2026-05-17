import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import DistanceSelector from "./DistanceSelector";
import CustomSwitch from "@/shared/components/CustomSwitch";
import YellowButton from "@/shared/components/ActionButton";
import type { PlaceDetails } from "@/features/map/types";
import { useAlarmStore } from "../store/useAlarmStore";
import { useLocationPermissionFlow } from "@/features/location/permissions/useLocationPermissionFlow";
import { shouldSkipStrictIosLocationFlow } from "@/features/location/permissions/locationPermissions";

export interface AlarmConfigValue {
  name: string;
  radius: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface AlarmConfigProps {
  locationData: PlaceDetails;
  onConfirm: (config: AlarmConfigValue) => void;
  onRadiusChange: (radius: number) => void;
  onSlidingStart: () => void;
  onSlidingComplete: () => void;
  isSliding: boolean;
  isEditing: boolean;
  alarmId: number | null;
}

const DEFAULT_ALARM_RADIUS = 500;

export default function AlarmConfig({
  locationData,
  onConfirm,
  onRadiusChange,
  onSlidingStart,
  onSlidingComplete,
  isSliding,
  isEditing,
  alarmId: _alarmId,
}: AlarmConfigProps) {
  const alarms = useAlarmStore((s) => s.alarms);
  const { explainAndRequestBackgroundAccess } = useLocationPermissionFlow();

  const currentAlarm =
    isEditing && _alarmId != null
      ? alarms.find((a) => a.id === _alarmId)
      : null;

  const [radius, setRadius] = useState(
    currentAlarm
      ? currentAlarm.radius
      : (locationData.radius ?? DEFAULT_ALARM_RADIUS),
  );
  const [sound, setSound] = useState(
    currentAlarm ? currentAlarm.soundEnabled : true,
  );
  const [vibration, setVibration] = useState(
    currentAlarm ? currentAlarm.vibrationEnabled : true,
  );
  const [name, setName] = useState(
    () =>
      currentAlarm?.name?.trim() ||
      locationData.name?.trim() ||
      "",
  );

  useEffect(() => {
    const next =
      currentAlarm?.name?.trim() ||
      locationData.name?.trim() ||
      "";
    setName(next);
  }, [
    currentAlarm?.id,
    currentAlarm?.name,
    locationData.name,
    locationData.latitude,
    locationData.longitude,
  ]);

  useEffect(() => {
    setRadius(
      currentAlarm
        ? currentAlarm.radius
        : (locationData.radius ?? DEFAULT_ALARM_RADIUS),
    );
    setSound(currentAlarm ? currentAlarm.soundEnabled : true);
    setVibration(currentAlarm ? currentAlarm.vibrationEnabled : true);
  }, [
    currentAlarm?.id,
    currentAlarm?.radius,
    currentAlarm?.soundEnabled,
    currentAlarm?.vibrationEnabled,
    locationData.radius,
    locationData.latitude,
    locationData.longitude,
  ]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handleActivate = async () => {
    if (!isEditing) {
      if (!shouldSkipStrictIosLocationFlow()) {
        await explainAndRequestBackgroundAccess();
      }
    }
    const trimmed = name.trim();
    const resolvedName =
      trimmed ||
      locationData.name?.trim() ||
      locationData.address?.trim() ||
      "Alarma";

    onConfirm({
      name: resolvedName,
      radius,
      soundEnabled: sound,
      vibrationEnabled: vibration,
    });
  };

  return (
    <View className="mt-3 flex flex-col items-center justify-center gap-4">
      <View style={{ width: "100%", opacity: isSliding ? 0 : 1 }}>
        <Text style={styles.inputLabel}>Nombre de la alarma</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={locationData.name || "Ej.: Casa, Trabajo…"}
          placeholderTextColor="#94a3b8"
          style={styles.nameInput}
          autoCorrect
          autoCapitalize="sentences"
          editable={!isSliding}
        />
      </View>
      <DistanceSelector
        value={radius}
        onChange={handleRadiusChange}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
      />
      <View style={{ opacity: isSliding ? 0 : 1, width: "100%" }}>
        <CustomSwitch
          title="Sonido"
          initialValue={sound}
          onValueChange={setSound}
        />
        <CustomSwitch
          title="Vibración"
          initialValue={vibration}
          onValueChange={setVibration}
        />
        <View className="mt-6">
          <YellowButton
            text={isEditing ? "Guardar cambios" : "Activar alarma"}
            icon={true}
            onPress={() => {
              void handleActivate();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D393C",
    marginBottom: 6,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#D4DBD1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fafafa",
  },
});
