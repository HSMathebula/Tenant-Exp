import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from './ProfileScreen';
import MaintenanceScreen from './MaintenanceScreen';
import NotificationsScreen from './NotificationsScreen';

const Tab = createBottomTabNavigator();

function DashboardContent() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Maintenance Requests" />
        <Card.Content>
          <Text>You have 2 pending maintenance requests</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Maintenance' as never)}>
            View All
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <Text>You have 3 new notifications</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Notifications' as never)}>
            View All
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Maintenance' as never)}
            style={styles.actionButton}
          >
            New Maintenance Request
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Profile' as never)}
            style={styles.actionButton}
          >
            Update Profile
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'tools' : 'tools';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardContent} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  actionButton: {
    marginVertical: 8,
  },
}); 