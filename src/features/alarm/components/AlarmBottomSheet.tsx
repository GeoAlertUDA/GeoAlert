import React, { useCallback, forwardRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlaceDetails } from "@/features/map/types";
import YellowButton from "@/shared/components/ActionButton";
import { useAlarmStore } from "../store/useAlarmStore";
import ConfigAccordion from "./ConfigAccordion";
import AlarmConfig, { AlarmConfigValue } from "./AlarmConfig";
import { X } from "lucide-react-native";
import { useLocationPermissionFlow } from "@/features/location/permissions/useLocationPermissionFlow";
import { shouldSkipStrictIosLocationFlow } from "@/features/location/permissions/locationPermissions";
import {
  isAtActiveAlarmLimit,
  isMaxActiveAlarmsLimitError,
} from "../constants/maxActiveAlarms";
import { MaxActiveAlarmsLimitModal } from "./MaxActiveAlarmsLimitModal";

const DEFAULT_ALARM_RADIUS = 500;

interface AlarmBottomSheetProps {
  locationData: PlaceDetails | null;
  isLoading: boolean | null;
  onRadiusChange: (radius: number) => void;
  onDismiss: () => void;
  onActivateAlarm: (alarmId: number) => void;
  isEditing: boolean;
  alarmId: number | null;
}

const AlarmBottomSheet = forwardRef<BottomSheetModal, AlarmBottomSheetProps>(
  (
    {
      locationData,
      isLoading,
      onRadiusChange,
      onDismiss,
      onActivateAlarm,
      isEditing,
      alarmId,
    },
    ref,
  ) => {
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    const [maxActiveLimitModalVisible, setMaxActiveLimitModalVisible] =
      useState(false);
    const insets = useSafeAreaInsets();
    const alarms = useAlarmStore((s) => s.alarms);
    const addAlarm = useAlarmStore((s) => s.addAlarm);
    const editAlarm = useAlarmStore((s) => s.editAlarm);
    const [isSliding, setIsSliding] = useState(false);
    const { explainAndRequestBackgroundAccess } = useLocationPermissionFlow();

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== "function") ref.current?.dismiss();
    }, [ref]);

    const handleQuickActivate = useCallback(async () => {
      if (!locationData) return;

      if (!isEditing) {
        if (isAtActiveAlarmLimit(alarms)) {
          setMaxActiveLimitModalVisible(true);
          return;
        }
        if (!shouldSkipStrictIosLocationFlow()) {
          await explainAndRequestBackgroundAccess();
        }
      }

      if (isEditing && alarmId !== null) {
        const currentAlarm = alarms.find((a) => a.id === alarmId);

        await editAlarm({
          id: alarmId,
          name: locationData.name,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          radius: locationData.radius ?? DEFAULT_ALARM_RADIUS,
          isActive: currentAlarm ? currentAlarm.isActive : false,
          isFavorite: currentAlarm ? currentAlarm.isFavorite : false,
          soundEnabled: true,
          vibrationEnabled: true,
          isRinging: false,
          address: locationData.address,
        });
      } else {
        try {
          const alarm = await addAlarm({
            name: locationData.name,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            radius: locationData.radius ?? DEFAULT_ALARM_RADIUS,
            isActive: true,
            isFavorite: false,
            soundEnabled: true,
            vibrationEnabled: true,
            isRinging: false,
            address: locationData.address,
          });
          onActivateAlarm(alarm.id);
        } catch (e) {
          if (isMaxActiveAlarmsLimitError(e)) {
            setMaxActiveLimitModalVisible(true);
            return;
          }
          throw e;
        }
      }
      dismiss();
    }, [
      locationData,
      isEditing,
      alarmId,
      alarms,
      addAlarm,
      editAlarm,
      dismiss,
      onActivateAlarm,
      explainAndRequestBackgroundAccess,
      shouldSkipStrictIosLocationFlow,
    ]);

    const handleCustomActivate = useCallback(
      async (customConfig: AlarmConfigValue) => {
        if (!locationData) return;

        const displayName =
          customConfig.name.trim() ||
          locationData.name?.trim() ||
          locationData.address?.trim() ||
          "Alarma";

        if (isEditing && alarmId !== null) {
          const currentAlarm = alarms.find((a) => a.id === alarmId);
          await editAlarm({
            id: alarmId,
            name: displayName,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            radius: customConfig.radius,
            isActive: currentAlarm ? currentAlarm.isActive : false,
            isFavorite: currentAlarm ? currentAlarm.isFavorite : false,
            soundEnabled: customConfig.soundEnabled,
            vibrationEnabled: customConfig.vibrationEnabled,
            isRinging: false,
            address: locationData.address,
          });
        } else {
          if (isAtActiveAlarmLimit(alarms)) {
            setMaxActiveLimitModalVisible(true);
            return;
          }
          try {
            const alarm = await addAlarm({
              name: displayName,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              radius: customConfig.radius,
              isActive: true,
              isFavorite: false,
              soundEnabled: customConfig.soundEnabled,
              vibrationEnabled: customConfig.vibrationEnabled,
              isRinging: false,
              address: locationData.address,
            });
            onActivateAlarm(alarm.id);
          } catch (e) {
            if (isMaxActiveAlarmsLimitError(e)) {
              setMaxActiveLimitModalVisible(true);
              return;
            }
            throw e;
          }
        }
        dismiss();
      },
      [
        locationData,
        isEditing,
        alarmId,
        alarms,
        addAlarm,
        editAlarm,
        dismiss,
        onActivateAlarm,
      ],
    );

    return (
      <>
        <BottomSheetModal
        ref={ref}
        index={0}
        enablePanDownToClose={false}
        enableDynamicSizing={true}
        failOffsetX={[-5, 5]}
        activeOffsetY={[-1, 1]}
        backgroundStyle={{
          backgroundColor: isSliding ? "transparent" : "white",
          elevation: isSliding ? 0 : 5,
        }}
        handleIndicatorStyle={{ opacity: isSliding ? 0 : 1 }}
        onDismiss={onDismiss}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          {isLoading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#000" />
              <Text className="mt-3 text-gray-500">
                Obteniendo datos del lugar...
              </Text>
            </View>
          ) : (
            <View style={{ opacity: isSliding ? 0 : 1 }}>
              <View className="mb-4 flex-row items-center justify-between">
                <Text
                  className="flex-1 text-[23px] font-bold text-black"
                  numberOfLines={1}
                >
                  {locationData?.name || "Ubicación seleccionada"}
                </Text>
                <TouchableOpacity
                  onPress={dismiss}
                  className="ml-2 rounded-full bg-gray-100 p-2"
                  activeOpacity={0.7}
                >
                  <X size={20} color="#111" />
                </TouchableOpacity>
              </View>

              {locationData && (
                <View className="flex-row items-center">
                  {locationData.photoUrl && (
                    <Image
                      source={{ uri: locationData.photoUrl }}
                      className="mr-4 h-20 w-20 rounded-lg"
                    />
                  )}
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-[13px] text-gray-600"
                      numberOfLines={2}
                    >
                      {locationData.address}
                    </Text>
                    <View className="mt-0.5 flex-row items-center">
                      <Text className="text-md font-bold text-[#111]">
                        {locationData.distanceText}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {" "}
                        ↔ distancia
                      </Text>
                    </View>
                    <View className="mt-0.5 flex-row items-center">
                      <Text className="text-md font-bold text-[#111]">
                        {locationData.durationText}
                      </Text>
                      <Text className="text-sm text-gray-500"> ⏱ tiempo</Text>
                    </View>
                  </View>
                </View>
              )}

              {!isConfigExpanded && (
                <View className="mt-6">
                  <YellowButton
                    text={isEditing ? "Guardar cambios" : "Activar alarma"}
                    icon={true}
                    onPress={() => {
                      void handleQuickActivate();
                    }}
                  />
                </View>
              )}

              <ConfigAccordion
                isExpanded={isConfigExpanded}
                onToggle={() => setIsConfigExpanded(!isConfigExpanded)}
                isSliding={isSliding}
              >
                {locationData && (
                  <AlarmConfig
                    locationData={locationData}
                    onConfirm={handleCustomActivate}
                    onRadiusChange={onRadiusChange}
                    isSliding={isSliding}
                    onSlidingStart={() => setIsSliding(true)}
                    onSlidingComplete={() => setIsSliding(false)}
                    isEditing={isEditing}
                    alarmId={alarmId}
                  />
                )}
              </ConfigAccordion>
            </View>
          )}
        </BottomSheetView>
        </BottomSheetModal>
        <MaxActiveAlarmsLimitModal
          visible={maxActiveLimitModalVisible}
          onDismiss={() => setMaxActiveLimitModalVisible(false)}
        />
      </>
    );
  },
);

AlarmBottomSheet.displayName = "AlarmBottomSheet";

export default AlarmBottomSheet;
