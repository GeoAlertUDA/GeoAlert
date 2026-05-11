import React, { useState } from 'react';
import { View } from 'react-native';
import DistanceSelector from './DistanceSelector';
import CustomSwitch from '@/shared/components/CustomSwitch';
import YellowButton from '@/shared/components/YellowButton';
import { useLocationPermissionFlow } from '@/features/location';
import { useAlarmStore } from '../store/useAlarmStore';
import type { PlaceDetails } from '@/features/map/types';

interface AlarmConfigProps {
  locationData: PlaceDetails;
  onConfirm: () => void;
}

export default function AlarmConfig({ locationData, onConfirm }: AlarmConfigProps) {
  const [radius, setRadius] = useState(500);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const addAlarm = useAlarmStore((s) => s.addAlarm);
  const { explainAndRequestBackgroundAccess } = useLocationPermissionFlow();

  const handleActivate = async () => {
    await explainAndRequestBackgroundAccess();
    await addAlarm({
      name: locationData.name,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      radius,
      isActive: true,
      isFavorite: false,
      address: locationData.address,
    });
    onConfirm();
  };

  return (
    <View className="flex flex-col gap-4 mt-3 justify-center items-center">
      <DistanceSelector value={radius} onChange={setRadius} />
      <View>
        <CustomSwitch title="Sonido" initialValue={true} onValueChange={setSound} />
        <CustomSwitch title="Vibración" initialValue={true} onValueChange={setVibration} />
      </View>
      <View className="mt-6">
        <YellowButton text="Activar alarma" icon={true} onPress={handleActivate} />
      </View>
    </View>
  );
}
