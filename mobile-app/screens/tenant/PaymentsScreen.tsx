import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Payment } from '../../types';
import { api } from '../../services/api';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentId: string) => {
    try {
      // In a real app, this would integrate with a payment processor
      await api.post(`/payments/${paymentId}/process`);
      Alert.alert('Success', 'Payment processed successfully');
      fetchPayments(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentType}>{item.type}</Text>
        <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.paymentDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.paymentStatus}>
        <Text
          style={[
            styles.statusText,
            { color: item.status === 'paid' ? 'green' : item.status === 'overdue' ? 'red' : 'orange' },
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePayment(item.id)}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Payments</Text>
      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  paymentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default PaymentsScreen; 