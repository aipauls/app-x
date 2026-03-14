import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useShoppingStore } from '../store/shoppingStore';
import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ChatScreen from '../screens/ChatScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import type { RootTabParamList, HomeStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

export function TabNavigator() {
  const unchecked = useShoppingStore((s) => s.items.filter((i) => !i.checked).length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', height: 60 },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let name: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse-outline';
          if (route.name === 'Home') name = focused ? 'home' : 'home-outline';
          else if (route.name === 'Pantry') name = focused ? 'nutrition' : 'nutrition-outline';
          else if (route.name === 'Chat') name = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Shopping') name = focused ? 'cart' : 'cart-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Pantry" component={PantryScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListScreen}
        options={{ tabBarBadge: unchecked > 0 ? unchecked : undefined }}
      />
    </Tab.Navigator>
  );
}
