import React, { useCallback, forwardRef, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceDetails } from '@/features/map/types';
import YellowButton from '@/shared/components/YellowButton';
import { useAlarmStore } from '../store/useAlarmStore';
import ConfigAccordion from './ConfigAccordion';
import AlarmConfig from './AlarmConfig';

interface AlarmBottomSheetProps {
  locationData: PlaceDetails | null;
  isLoading: boolean | null;
}

const AlarmBottomSheet = forwardRef<BottomSheetModal, AlarmBottomSheetProps>(
  ({ locationData, isLoading }, ref) => {
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    const insets = useSafeAreaInsets();
    const addAlarm = useAlarmStore((s) => s.addAlarm);

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== 'function') ref.current?.dismiss();
    }, [ref]);

    const handleQuickActivate = useCallback(async () => {
      if (!locationData) return;
      await addAlarm({
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius: 500,
        isActive: true,
        isFavorite: false,
        address: locationData.address,
      });
      dismiss();
    }, [locationData, addAlarm, dismiss]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        failOffsetX={[-5, 5]}
        activeOffsetY={[-1, 1]}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {isLoading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#000" />
              <Text className="mt-3 text-gray-500">Obteniendo datos del lugar...</Text>
            </View>
          ) : (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[23px] font-bold text-black flex-1" numberOfLines={1}>
                  {locationData?.name || 'Ubicación seleccionada'}
                </Text>
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
              >
                {locationData && (
                  <AlarmConfig locationData={locationData} onConfirm={dismiss} />
                )}
              </ConfigAccordion>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default AlarmBottomSheet;
