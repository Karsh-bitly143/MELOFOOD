import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginPage from '../components/Login';
import { auth } from '../configs/FirebaseConfig';
import { Defines } from '../constants/Defines';
import SignInPage from './auth/sign-in';
import SignUpPage from './auth/sign-up';
import TabNavigator from './Navigators/TabNavigator';
import PlaceOrderPage from './tabs/PlaceOrder';
import ProfilePage from './tabs/profile';

const Stack = createNativeStackNavigator();

function RootNavigator({ user }) {
  const insets = useSafeAreaInsets(); // ✅ this gives us status bar height

  return (
    <>
      {/* Status bar background (always black) */}
      <View style={{ height: insets.top, backgroundColor: Defines.Colors.Black }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="PlaceOrder" component={PlaceOrderPage} />
            <Stack.Screen name="Profile" component={ProfilePage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="SignIn" component={SignInPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('./../assets/fonts/Poppins-Light.ttf'),
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Defines.Colors.Black }}>
        <ActivityIndicator size="large" color={Defines.Colors.Red} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator user={user} />
    </SafeAreaProvider>
  );
}
