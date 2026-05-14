import React, { useState } from 'react';
import { View } from 'react-native';
import DistanceSelector from './DistanceSelector';
import CustomSwitch from '@/shared/components/CustomSwitch';
import YellowButton from '@/shared/components/ActionButton';
import type { PlaceDetails } from '@/features/map/types';

interface AlarmConfigProps {
  locationData: PlaceDetails;
  onConfirm: (config: { radius: number; sound: boolean; vibration: boolean }) => void;
  onRadiusChange: (radius: number) => void;
  onSlidingStart: () => void;
  onSlidingComplete: () => void;
  isSliding: boolean;
}

export default function AlarmConfig({
  locationData,
  onConfirm,
  onRadiusChange,
  onSlidingStart,
  onSlidingComplete,
  isSliding
}: AlarmConfigProps) {
  const [radius, setRadius] = useState(locationData.radius);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handleActivate = () => {
    onConfirm({
      radius,
      sound,
      vibration
    });
  };

  return (
    <View className="flex flex-col gap-4 mt-3 justify-center items-center">
      <DistanceSelector
        value={radius}
        onChange={handleRadiusChange}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
      />
      <View style={{ opacity: isSliding ? 0 : 1, width: '100%' }}>
        <CustomSwitch title="Sonido" initialValue={true} onValueChange={setSound} />
        <CustomSwitch title="Vibración" initialValue={true} onValueChange={setVibration} />
        <View className="mt-6">
          <YellowButton text="Activar alarma" icon={true} onPress={handleActivate} />
        </View>
      </View>
    </View>
  );
}