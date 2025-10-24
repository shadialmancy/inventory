import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { database } from '../../db/database';
import { invoiceRepo } from '../../db/repo';

const TransactionMenuPage: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    recentInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      // Ensure database is properly initialized
      await database.init();
      
      // Add a small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const invoices = await invoiceRepo.findAll();
      
      // Handle case where invoices might be null or undefined
      const invoiceList = invoices || [];
      
      // Calculate statistics
      const totalInvoices = invoiceList.length;
      const totalRevenue = invoiceList.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      const pendingInvoices = invoiceList.filter(invoice => 
        invoice.status === 'draft'
      ).length;
      
      // Recent invoices (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentInvoices = invoiceList.filter(invoice => 
        new Date(invoice.createdAt) > thirtyDaysAgo
      ).length;
      
      setStats({
        totalInvoices,
        totalRevenue,
        pendingInvoices,
        recentInvoices,
      });
    } catch (error) {
      console.error('Error loading transaction stats:', error);
      setStats({
        totalInvoices: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        recentInvoices: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const MenuOption = ({ 
    title, 
    description, 
    icon, 
    color = '#28a745',
    onPress 
  }: {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.menuOption, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.menuContent}>
        <View style={styles.menuHeader}>
          <Ionicons name={icon} size={32} color={color} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDescription}>{description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Management</Text>
        <Text style={styles.subtitle}>Manage your invoices and transactions</Text>
      </View>

      <View style={styles.menuSection}>
        <MenuOption
          title="Create Invoice"
          description="Create a new invoice for a customer"
          icon="add-circle"
          color="#28a745"
          onPress={() => navigation.navigate('CreateInvoice' as never)}
        />
        
        <MenuOption
          title="Invoice List"
          description="View and manage all invoices"
          icon="receipt"
          color="#007AFF"
          onPress={() => navigation.navigate('InvoiceList' as never)}
        />
      </View>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    padding: 16,
  },
  menuOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    marginLeft: 16,
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TransactionMenuPage;
