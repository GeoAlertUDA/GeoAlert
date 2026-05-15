import { Text, Pressable } from 'react-native'
import React from 'react'
import { AlarmClock } from 'lucide-react-native';

interface ButtonProps {
    text: string | null;
    icon?: boolean;
    variant?: 'primary' | 'secondary'; 
    onPress?: () => void;
    className?: string; 
}

const ActionButton = ({
    text, 
    icon = false, 
    variant = 'primary', 
    onPress,
    className = ''
}: ButtonProps) => {

  const baseStyles = 'px-7 py-[14px] rounded-full flex flex-row gap-3 justify-center items-center active:opacity-80';
  
  const variantStyles = variant === 'primary' 
    ? 'bg-[#F9BF53] border-[1.5px] border-[#F9BF53]' 
    : 'bg-white border-[1.5px] border-[#D4DBD1]';

  return (
    <Pressable 
      onPress={onPress} 
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {icon && <AlarmClock color={"black"} size={20}/> }
      <Text className='font-semibold text-center text-black text-[16px]'>
        {text}
      </Text>
    </Pressable>
  )
}

export default ActionButton;