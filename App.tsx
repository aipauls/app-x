import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TabNavigator } from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const ONBOARDING_KEY = '@appx_onboarded';

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => setHasOnboarded(val === 'true'));
  }, []);

  // Show nothing while checking storage (avoids flash)
  if (hasOnboarded === null) return null;

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasOnboarded(true);
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {hasOnboarded ? (
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
