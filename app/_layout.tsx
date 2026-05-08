import 'global.css'
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import TabLayout from '../src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createTables } from '../src/localDB/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    createTables()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('[DB] createTables failed:', e);
        setDbReady(true); // igual dejamos pasar para no bloquear la app
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D393C" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TabLayout />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}