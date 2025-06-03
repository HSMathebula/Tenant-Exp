import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import TenantDashboardScreen from '../screens/tenant/TenantDashboardScreen';
import CreateTicketScreen from '../screens/tenant/CreateTicketScreen';
import DocumentsScreen from '../screens/tenant/DocumentsScreen';
import PaymentsScreen from '../screens/tenant/PaymentsScreen';
import EventsScreen from '../screens/tenant/EventsScreen';
import MaintenanceDashboardScreen from '../screens/maintenance/MaintenanceDashboardScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TenantTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Maintenance':
            iconName = focused ? 'construct' : 'construct-outline';
            break;
          case 'Documents':
            iconName = focused ? 'document-text' : 'document-text-outline';
            break;
          case 'Payments':
            iconName = focused ? 'card' : 'card-outline';
            break;
          case 'Events':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={TenantDashboardScreen} />
    <Tab.Screen name="Maintenance" component={CreateTicketScreen} />
    <Tab.Screen name="Documents" component={DocumentsScreen} />
    <Tab.Screen name="Payments" component={PaymentsScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
  </Tab.Navigator>
);

const MaintenanceTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Tickets':
            iconName = focused ? 'list' : 'list-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={MaintenanceDashboardScreen} />
    <Tab.Screen name="Tickets" component={MaintenanceDashboardScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : user.role === 'tenant' ? (
          // Tenant Stack
          <Stack.Screen name="TenantTabs" component={TenantTabs} />
        ) : (
          // Maintenance Stack
          <Stack.Screen name="MaintenanceTabs" component={MaintenanceTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 