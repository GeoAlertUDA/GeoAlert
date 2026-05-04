import React, { useMemo, useCallback, forwardRef, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { PlaceDetails } from '../types';
import YellowButton from '@/shared/components/YellowButton';
import DistanceSelector from './DistanceSelector';
import CustomSwitch from '@/shared/components/CustomSwitch';
import ConfigAccordion from './ConfigAccordion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlarmBottomSheetProps {
  locationData: PlaceDetails | null;
  isLoading: boolean | null;
  onClose: () => void;
}

const AlarmBottomSheet = forwardRef<BottomSheetModal, AlarmBottomSheetProps>(
  ({ locationData, isLoading, onClose }, ref) => {
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    const insets = useSafeAreaInsets();

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
        onDismiss={onClose}
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
            paddingBottom: insets.bottom + 16
          }}
        >

          {isLoading ? (
            <View className="test-blue items-center justify-center py-10">
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
                  <YellowButton text={"Activar alarma"} icon={true} />
                </View>
              )}

              <ConfigAccordion
                isExpanded={isConfigExpanded}
                onToggle={() => setIsConfigExpanded(!isConfigExpanded)}
              >
                <View className='flex flex-col gap-4 mt-3 justify-center items-center '>
                  <DistanceSelector />
                  <View>
                    <CustomSwitch title='Sonido' initialValue={true} />
                    <CustomSwitch title='Vibración' initialValue={true} />
                  </View>

                  <View className="mt-6">
                    <YellowButton text={"Activar alarma"} icon={true} />
                  </View>
                </View>
              </ConfigAccordion>
            </>
          )}

        </BottomSheetView>
      </BottomSheetModal >
    );
  }
);

export default AlarmBottomSheet;