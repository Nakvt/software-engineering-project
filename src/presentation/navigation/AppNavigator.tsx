import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList } from './types';
import { MapScreen } from '../screens/MapScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { TourSelectionScreen } from '../screens/TourSelectionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Màn hình Profile tạm thời
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Cài đặt cá nhân</Text>
  </View>
);

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map';
          if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Tours') iconName = 'compass';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Tours" component={TourSelectionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="AudioPlayer"
          component={AudioPlayerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;