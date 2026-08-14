import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthStack } from './stacks/AuthStack';
import { BookingsListScreen } from '../screens/bookings/BookingList';
import { BookingFormScreen } from '../screens/bookings/BookingForm';
import { BookingSummaryScreen } from '../screens/bookings/BookingSummary';
import { MessagesScreen } from '../screens/MessagesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { OrdersScreen } from '../screens/admin/OrdersScreen';
import { GalleryManagement } from '../screens/admin/GalleryManagement';
import { ConversationScreen } from '../screens/chat/ConversationScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { useAuthStore } from '../store/useAuthStore';

import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          let name: any = 'home';
          if (route.name === 'Home') name = 'home';
          else if (route.name === 'Bookings') name = 'calendar';
          else if (route.name === 'Messages') name = 'chatbox';
          else if (route.name === 'Notifications') name = 'notifications';
          else if (route.name === 'Profile') name = 'person';
          return <Ionicons name={name} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsListScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        initialRouteName={!user ? 'Welcome' : user.role === 'admin' ? 'Admin' : 'Client'}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="Welcome" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Survey" component={require('../screens/SurveyScreen').SurveyScreen} options={{ title: 'Demande de séance' }} />
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />

        {user && user.role === 'admin' ? (
          <>
            <Stack.Screen name="Admin" component={AdminDashboard} options={{ title: 'Dashboard' }} />
            <Stack.Screen name="AdminOrders" component={OrdersScreen} options={{ title: 'Réservations' }} />
            <Stack.Screen name="GalleryManagement" component={GalleryManagement} options={{ title: 'Galerie' }} />
            <Stack.Screen name="Conversation" component={ConversationScreen} options={{ title: 'Conversation' }} />
          </>
        ) : null}

        {user && user.role === 'client' ? (
          <>
            <Stack.Screen name="Client" component={ClientTabs} options={{ headerShown: false }} />
            <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'Nouvelle réservation' }} />
            <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} options={{ title: 'Récapitulatif' }} />
            <Stack.Screen name="Conversation" component={ConversationScreen} options={{ title: 'Conversation' }} />
          </>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
