import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface MaintenanceRequestScreenProps {
  onSubmitRequest: (data: { title: string; description: string; priority: string }) => void;
  navigation: {
    goBack: () => void;
  };
}

export default function MaintenanceRequestScreen({ onSubmitRequest, navigation }: MaintenanceRequestScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = () => {
    onSubmitRequest({ title, description, priority });
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />
      <Button testID="priority-select" onPress={() => setPriority('high')}>
        Priority
      </Button>
      <Button onPress={handleSubmit}>Submit</Button>
      <Button onPress={navigation.goBack}>Cancel</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
}); 