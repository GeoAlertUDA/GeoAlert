import React, { useCallback, forwardRef, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceDetails } from '@/features/map/types';
import YellowButton from '@/shared/components/ActionButton';
import { useAlarmStore } from '../store/useAlarmStore';
import ConfigAccordion from './ConfigAccordion';
import AlarmConfig from './AlarmConfig';
import { TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface AlarmBottomSheetProps {
  locationData: PlaceDetails | null;
  isLoading: boolean | null;
  onRadiusChange: (radius: number) => void;
  onDismiss: () => void;
  onActivateAlarm: () => void;
}

const AlarmBottomSheet = forwardRef<BottomSheetModal, AlarmBottomSheetProps>(
  ({ locationData, isLoading, onRadiusChange, onDismiss, onActivateAlarm }, ref) => {
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    const insets = useSafeAreaInsets();
    const addAlarm = useAlarmStore((s) => s.addAlarm);
    const [isSliding, setIsSliding] = useState(false);


    const dismiss = useCallback(() => {
      if (ref && typeof ref !== 'function') ref.current?.dismiss();
    }, [ref]);

    const handleQuickActivate = useCallback(async () => {
      if (!locationData) return;
      await addAlarm({
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius: 0,
        sound: true,
        vibration: true,
        isActive: true,
        isFavorite: false,
        address: locationData.address,
      });
      onActivateAlarm();
      dismiss();
    }, [locationData, addAlarm, dismiss, onActivateAlarm]);


    const handleCustomActivate = useCallback(async (customConfig: { radius: number; sound: boolean; vibration: boolean }) => {
      if (!locationData) return;

      await addAlarm({
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius: customConfig.radius,
        sound: customConfig.sound,
        vibration: customConfig.vibration,
        isActive: true,
        isFavorite: false,
        address: locationData.address,
      });
      onActivateAlarm
      dismiss();
    }, [locationData, addAlarm, dismiss, onActivateAlarm]);


    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enablePanDownToClose={false}
        enableDynamicSizing={true}
        failOffsetX={[-5, 5]}
        activeOffsetY={[-1, 1]}
        backgroundStyle={{ backgroundColor: isSliding ? 'transparent' : 'white', elevation: isSliding ? 0 : 5 }}
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
              <Text className="mt-3 text-gray-500">Obteniendo datos del lugar...</Text>
            </View>
          ) : (
            <View style={{ opacity: isSliding ? 0 : 1 }}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[23px] font-bold text-black flex-1" numberOfLines={1}>
                  {locationData?.name || 'Ubicación seleccionada'}
                </Text>
                <TouchableOpacity
                  onPress={dismiss}
                  className="bg-gray-100 p-2 rounded-full ml-2"
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
                      className="w-20 h-20 rounded-lg mr-4"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-[13px] text-gray-600 mb-2" numberOfLines={2}>
                      {locationData.address}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="font-bold text-[#111] text-md">{locationData.distanceText}</Text>
                      <Text className="text-gray-500 text-sm"> ↔ distancia</Text>
                    </View>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="font-bold text-[#111] text-md">{locationData.durationText}</Text>
                      <Text className="text-gray-500 text-sm"> ⏱ tiempo</Text>
                    </View>
                  </View>
                </View>
              )}

              {!isConfigExpanded && (
                <View className="mt-6">
                  <YellowButton text="Activar alarma" icon={true} onPress={handleQuickActivate} />
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
                  />
                )}
              </ConfigAccordion>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default AlarmBottomSheet;
