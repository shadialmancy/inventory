import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { database } from '../../db/database';
import { Customer } from '../../db/models';
import { customerRepo } from '../../db/repo';

const CustomerList: React.FC = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  const loadCustomers = async () => {
    try {
      await database.init();
      const allCustomers = await customerRepo.findAll();
      setCustomers(allCustomers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };


  const handleEditCustomer = (customer: Customer) => {
    (navigation as any).navigate('AddEditCustomer', { customerId: customer.id });
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerRepo.delete(customer.id);
              await loadCustomers();
              Alert.alert('Success', 'Customer deleted successfully');
            } catch (error) {
              console.error('Error deleting customer:', error);
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <View 
      style={styles.customerCard}
     
    >
      <View style={styles.customerInfo}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerName}>{item.name}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCustomer(item)}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCustomer(item)}
            >
              <Ionicons name="trash" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.contactInfo}>
          <Ionicons name="call" size={14} color="#666" />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
        
        {item.email && (
          <View style={styles.contactInfo}>
            <Ionicons name="mail" size={14} color="#666" />
            <Text style={styles.contactText}>{item.email}</Text>
          </View>
        )}
        
        <Text style={styles.customerDate}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Customers Found</Text>
      <Text style={styles.emptySubtitle}>
        Add your first customer to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerInfo: {
    flex: 1,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  customerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CustomerList;
