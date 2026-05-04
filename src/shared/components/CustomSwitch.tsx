import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';

interface CustomSwitchProps {
  title: string;
  description?: string;
  initialValue?: boolean;
  onValueChange?: (value: boolean) => void;
}

export default function CustomSwitch({ 
  title = "Activar notificación", 
  description,
  initialValue = false,
  onValueChange 
}: CustomSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      if (onValueChange) onValueChange(newState);
      return newState;
    });
  };

  return (
    <View className="p-4 w-full flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-[#0B2C2B] font-light text-xl">
          {title}
        </Text>
        
        {description && (
          <Text className="text-[#0B2C2B] text-sm opacity-70 mt-1">
            {description}
          </Text>
        )}
      </View>

      <Switch
        trackColor={{ true: '#96B89D', false: '#0B2C2B' }} 
        thumbColor="#F5F5F5" 
        ios_backgroundColor="#96B89D" 
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
}