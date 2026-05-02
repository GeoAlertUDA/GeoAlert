import React, { JSX, useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  interpolate 
} from 'react-native-reanimated';
import { AlarmClock, Map, Settings } from "lucide-react-native";

interface Props {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: any;
}

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName, color, label }: Props) => {
  
  const icons: Record<string, (props: any) => JSX.Element> = {
    alarms: (props) => <AlarmClock size={20} {...props} />,
    index: (props) => <Map size={20} {...props} />,
    options: (props) => <Settings size={20} {...props} />,
  };

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const topValue = interpolate(scale.value, [0, 1], [0, 9]);
    return {
      transform: [{ scale: scaleValue }],
      top: topValue,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
      <Animated.View style={animatedIconStyle}>
        {icons[routeName] ? (
          icons[routeName]({ color })
        ) : (
          <Settings size={20} color={color} />
        )}
      </Animated.View>
      
      <Animated.Text style={[{ color, fontSize: 11 }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});

export default TabBarButton;