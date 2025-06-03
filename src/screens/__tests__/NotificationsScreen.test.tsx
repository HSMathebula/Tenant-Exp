import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationsScreen from '../NotificationsScreen';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

describe('NotificationsScreen', () => {
  const mockNotifications = [
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
    },
  ];

  beforeEach(() => {
    (React.useState as jest.Mock).mockReturnValue([mockNotifications, jest.fn()]);
  });

  it('renders correctly with notifications', () => {
    const { getByText, getAllByTestId } = render(<NotificationsScreen />);
    
    expect(getByText('Maintenance Update')).toBeTruthy();
    expect(getByText('Payment Reminder')).toBeTruthy();
    expect(getAllByTestId('notification-item')).toHaveLength(2);
  });

  it('renders empty state when no notifications', () => {
    (React.useState as jest.Mock).mockReturnValue([[], jest.fn()]);
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText('No notifications')).toBeTruthy();
  });

  it('marks notification as read when pressed', () => {
    const setNotifications = jest.fn();
    (React.useState as jest.Mock).mockReturnValue([mockNotifications, setNotifications]);
    
    const { getAllByTestId } = render(<NotificationsScreen />);
    const notificationItems = getAllByTestId('notification-item');
    fireEvent.press(notificationItems[0]);
    
    expect(setNotifications).toHaveBeenCalled();
  });

  it('displays correct read/unread status', () => {
    const { getAllByTestId } = render(<NotificationsScreen />);
    
    const notificationItems = getAllByTestId('notification-item');
    expect(notificationItems[0].props.style.opacity).toBe(1); // Unread
    expect(notificationItems[1].props.style.opacity).toBe(0.7); // Read
  });

  it('displays correct notification type icons', () => {
    const { getAllByTestId } = render(<NotificationsScreen />);
    
    const typeIcons = getAllByTestId('notification-type-icon');
    expect(typeIcons[0].props.name).toBe('tools'); // Maintenance
    expect(typeIcons[1].props.name).toBe('cash'); // Payment
  });

  it('formats dates correctly', () => {
    const { getAllByTestId } = render(<NotificationsScreen />);
    
    const dateTexts = getAllByTestId('notification-date');
    expect(dateTexts[0].props.children).toMatch(/\d{1,2}:\d{2} [AP]M/);
  });
}); 