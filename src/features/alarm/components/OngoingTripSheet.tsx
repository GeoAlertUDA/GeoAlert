import React, { useRef, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import YellowButton from '@/shared/components/ActionButton';

interface OngoingTripSheetProps {
  distance: number;
  onCancelAlarm: () => void;
}

export const OngoingTripSheet = ({ distance, onCancelAlarm }: OngoingTripSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['21%'], []);

  const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters >= 500) {
    const distanceInKm = (distanceInMeters / 1000).toFixed(1); 
    return `${distanceInKm} km`;
  }
  return `${distanceInMeters} m`;
};

  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-1 flex-col items-center justify-between px-6">

          <View className="items-center w-full gap-4 ">
            <Text className="text-sm text-gray-900">
              Viaje en curso
            </Text>
            <Text style={{ fontSize: 23}} className="font-bold text-[#0D393C] text-center leading-8">
              Estás a <Text style={{ color: '#F9BF53', fontSize: 25}}>{formatDistance(distance)}</Text> de tu parada
            </Text>
          </View>

          <View className="w-full mt-3 py-2">
            <YellowButton text={"Cancelar alerta"} icon={false} onPress={onCancelAlarm} />
          </View>

        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};