import React, { useState } from "react";
import { View } from "react-native";
import DistanceSelector from "./DistanceSelector";
import CustomSwitch from "@/shared/components/CustomSwitch";
import YellowButton from "@/shared/components/ActionButton";
import type { PlaceDetails } from "@/features/map/types";
import { useAlarmStore } from "../store/useAlarmStore";

export interface AlarmConfigValue {
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
  alarmId,
}: AlarmConfigProps) {
  const alarms = useAlarmStore((s) => s.alarms);
  const currentAlarm = isEditing
    ? alarms.find(
        (a) =>
          a.latitude === locationData.latitude &&
          a.longitude === locationData.longitude,
      )
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

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handleActivate = () => {
    onConfirm({
      radius,
      soundEnabled: sound,
      vibrationEnabled: vibration,
    });
  };

  return (
    <View className="mt-3 flex flex-col items-center justify-center gap-4">
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
            onPress={handleActivate}
          />
        </View>
      </View>
    </View>
  );
}
