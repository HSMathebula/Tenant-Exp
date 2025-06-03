import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Provider: ({ children }) => <View>{children}</View>,
    Button: ({ children }) => <View>{children}</View>,
    TextInput: ({ children }) => <View>{children}</View>,
    Card: ({ children }) => <View>{children}</View>,
    Text: ({ children }) => <View>{children}</View>,
    Avatar: {
      Image: ({ children }) => <View>{children}</View>,
    },
  };
}); 