 import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, FAB, Portal, Dialog, TextInput } from 'react-native-paper';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
}

export default function MaintenanceScreen() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: '1',
      title: 'Leaking Faucet',
      description: 'Kitchen sink faucet is leaking water',
      status: 'pending',
      date: '2024-02-20',
    },
    {
      id: '2',
      title: 'Broken Window',
      description: 'Living room window won\'t close properly',
      status: 'in-progress',
      date: '2024-02-18',
    },
  ]);

  const [visible, setVisible] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
  });

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleSubmit = () => {
    const request: MaintenanceRequest = {
      id: Date.now().toString(),
      title: newRequest.title,
      description: newRequest.description,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };

    setRequests([...requests, request]);
    setNewRequest({ title: '', description: '' });
    hideDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in-progress':
        return '#1E90FF';
      case 'completed':
        return '#32CD32';
      default:
        return '#000000';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {requests.map((request) => (
          <Card key={request.id} style={styles.card}>
            <Card.Title title={request.title} />
            <Card.Content>
              <Text>{request.description}</Text>
              <View style={styles.statusContainer}>
                <Text style={[styles.status, { color: getStatusColor(request.status) }]}>
                  {request.status.toUpperCase()}
                </Text>
                <Text style={styles.date}>{request.date}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>New Maintenance Request</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newRequest.title}
              onChangeText={(text) => setNewRequest({ ...newRequest, title: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={newRequest.description}
              onChangeText={(text) => setNewRequest({ ...newRequest, description: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  status: {
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 