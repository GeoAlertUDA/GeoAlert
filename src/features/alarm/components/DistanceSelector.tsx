import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';

interface DistanceSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
}

export default function DistanceSelector({ value, onChange ,onSlidingStart, onSlidingComplete }: DistanceSelectorProps = {}) {
  const [internalDistance, setInternalDistance] = useState(500);

  const distance = value ?? internalDistance;

  const handleChange = (v: number) => {
    if (onChange) {
      onChange(v);
    } else {
      setInternalDistance(v);
    }
  };

  return (
    <View className="bg-[#E4EBE4] rounded-2xl p-6 w-full max-w-sm">
      <Text className="text-[#0B2C2B] text-base font-semibold mb-4">
        Avisarme cuando esté a...
      </Text>
      <View className="flex-row items-baseline mb-4">
        <Text className="text-[#0B2C2B] text-4xl font-bold tracking-tight">
          {distance}
        </Text>
        <Text className="text-[#0B2C2B] text-lg font-medium ml-1">
          metros
        </Text>
      </View>

      <View className="w-full">
        <Slider
          value={distance}
          onValueChange={(v) => handleChange(v[0])}
          minimumValue={250}
          maximumValue={1000}
          step={250}
          minimumTrackTintColor="#0B2C2B"
          maximumTrackTintColor="#96B89D"
          trackStyle={{ height: 12, borderRadius: 8 }}
          thumbStyle={{
            height: 24,
            width: 24,
            backgroundColor: '#F5F5F5',
            borderColor: '#0B2C2B',
            borderWidth: 4,
            borderRadius: 12,
          }}
          onSlidingStart={() => onSlidingStart?.()}
          onSlidingComplete={() => onSlidingComplete?.()}
        />
        <View className="w-full flex-row justify-between mt-2 px-1">
          <Text className="text-[#0B2C2B] text-sm font-medium">250m</Text>
          <Text className="text-[#0B2C2B] text-sm font-medium">500m</Text>
          <Text className="text-[#0B2C2B] text-sm font-medium">750m</Text>
          <Text className="text-[#0B2C2B] text-sm font-medium">1000m</Text>
        </View>
      </View>
    </View>
  );
}
