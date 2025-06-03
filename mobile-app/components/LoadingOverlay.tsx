import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible}>
      <View style={[styles.container, { backgroundColor: colors.background + '80' }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message && (
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
}); 