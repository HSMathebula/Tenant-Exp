import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider, Text } from 'react-native-paper';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Maintenance Update',
      message: 'Your maintenance request has been approved',
      type: 'maintenance',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Payment Reminder',
      message: 'Your rent payment is due in 3 days',
      type: 'payment',
      read: true,
      createdAt: new Date().toISOString(),
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    // TODO: Implement mark as read logic
  };

  return (
    <ScrollView style={styles.container}>
      {notifications.map((notification, index) => (
        <React.Fragment key={notification.id}>
          <List.Item
            title={notification.title}
            description={notification.message}
            left={props => (
              <List.Icon
                {...props}
                icon={notification.read ? 'email-open' : 'email'}
                color={notification.read ? '#666' : '#f4511e'}
              />
            )}
            right={props => (
              <Text {...props} style={styles.time}>
                {notification.createdAt}
              </Text>
            )}
            style={[
              styles.notification,
              !notification.read && styles.unread
            ]}
          />
          {index < notifications.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notification: {
    paddingVertical: 8,
  },
  unread: {
    backgroundColor: '#fff8f6',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 