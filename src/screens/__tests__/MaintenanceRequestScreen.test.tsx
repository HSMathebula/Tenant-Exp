import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MaintenanceRequestScreen from '../MaintenanceRequestScreen';

describe('MaintenanceRequestScreen', () => {
  const mockSubmitRequest = jest.fn();
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    expect(getByText('Submit Maintenance Request')).toBeTruthy();
    expect(getByPlaceholderText('Title')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
    expect(getByText('Submit')).toBeTruthy();
  });

  it('handles form input correctly', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    const titleInput = getByPlaceholderText('Title');
    const descriptionInput = getByPlaceholderText('Description');
    const prioritySelect = getByTestId('priority-select');

    fireEvent.changeText(titleInput, 'Leaking Faucet');
    fireEvent.changeText(descriptionInput, 'Kitchen sink is leaking');
    fireEvent.press(prioritySelect);
    fireEvent.press(getByText('High'));

    expect(titleInput.props.value).toBe('Leaking Faucet');
    expect(descriptionInput.props.value).toBe('Kitchen sink is leaking');
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(getByText('Title is required')).toBeTruthy();
      expect(getByText('Description is required')).toBeTruthy();
      expect(getByText('Priority is required')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Title'), 'Leaking Faucet');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Kitchen sink is leaking');
    fireEvent.press(getByTestId('priority-select'));
    fireEvent.press(getByText('High'));
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitRequest).toHaveBeenCalledWith({
        title: 'Leaking Faucet',
        description: 'Kitchen sink is leaking',
        priority: 'high',
      });
    });
  });

  it('handles image upload', async () => {
    const { getByTestId } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    const imagePicker = getByTestId('image-picker');
    fireEvent.press(imagePicker);

    await waitFor(() => {
      expect(getByTestId('selected-image')).toBeTruthy();
    });
  });

  it('navigates back on cancel', () => {
    const { getByText } = render(
      <MaintenanceRequestScreen 
        onSubmitRequest={mockSubmitRequest}
        navigation={mockNavigation}
      />
    );
    
    fireEvent.press(getByText('Cancel'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
}); 