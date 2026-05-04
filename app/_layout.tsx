import 'global.css'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import TabLayout from '../src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TabLayout />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}