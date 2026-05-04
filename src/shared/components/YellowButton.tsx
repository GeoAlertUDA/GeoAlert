import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { AlarmClock, Clock} from 'lucide-react-native';

interface props {
    text: String | null;
    icon: boolean 
}

const YellowButton = ({text, icon= true}:props) => {

  return (
    <Pressable className='bg-[#F9BF53] w-fit m-4 px-7 py-4 h-fit rounded-full flex flex-row gap-3 justify-center self-center items-center  '>
      {icon && <AlarmClock color={"black"} size={20}/> }
      <Text className='font-semibold text-center '>{text}</Text>
    </Pressable>
  )
}

export default YellowButton