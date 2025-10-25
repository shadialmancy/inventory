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
import { Invoice } from '../../db/models';
import { invoiceRepo } from '../../db/repo';
import { calculations } from '../../utils/calculations';

const InvoiceList: React.FC = () => {
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );


  const loadInvoices = async () => {
    try {
      
      // Ensure database is properly initialized
      await database.init();
      
      // Add a small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let allInvoices = await invoiceRepo.findAll();

      // Handle case where allInvoices might be null or undefined
      const invoices = allInvoices || [];

      setInvoices(invoices);
    } catch (error) {
      setInvoices([]);
      
      // Only show alert if this is not a background refresh
      if (loading) {
        Alert.alert(
          'Error', 
          `Failed to load invoices: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    (navigation as any).navigate('CreateInvoice', { 
      editMode: true, 
      invoiceId: invoice.id 
    });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await invoiceRepo.delete(invoice.id);
              await loadInvoices();
              Alert.alert('Success', 'Invoice deleted successfully');
            } catch (error) {
              console.error('Error deleting invoice:', error);
              Alert.alert(
                'Error', 
                `Failed to delete invoice: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          },
        },
      ]
    );
  };



  
  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View    
      style={styles.invoiceCard}
    >
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.invoiceActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditInvoice(item)}
          >
            <Ionicons name="pencil-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteInvoice(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.invoiceDetails}>
        <View style={styles.leftSection}>
          <Text style={styles.customerName}>Customer ID: {item.customerId}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Subtotal:</Text>
            <Text style={styles.amountValue}>
              {calculations.formatCurrency(item.subtotal)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>VAT:</Text>
            <Text style={styles.amountValue}>
              {calculations.formatCurrency(item.taxAmount)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.totalSection}>
        <View style={styles.totalAmountRow}>
          <Text style={[styles.amountLabel, styles.totalLabel]}>Total:</Text>
          <Text style={[styles.amountValue, styles.totalValue]}>
            {calculations.formatCurrency(item.total)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Invoices Found</Text>
      <Text style={styles.emptySubtitle}>
        Create your first invoice to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading invoices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    

      {/* Invoices List */}
      <FlatList
        data={invoices}
        renderItem={renderInvoice}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  invoiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  invoiceDetails: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'column',
    gap: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#007AFF',
  },
});

export default InvoiceList;
