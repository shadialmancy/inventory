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
import { customerRepo } from '../../db/repo';

const CustomerMenuPage: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    customersWithEmail: 0,
    customersWithPhone: 0,
    recentCustomers: 0,
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
      await database.init();
      const customers = await customerRepo.findAll();
      
      // Calculate statistics
      const totalCustomers = customers.length;
      const customersWithEmail = customers.filter(customer => customer.email && customer.email.trim() !== '').length;
      const customersWithPhone = customers.filter(customer => customer.phone && customer.phone.trim() !== '').length;
      
      // Recent customers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCustomers = customers.filter(customer => 
        new Date(customer.createdAt) > thirtyDaysAgo
      ).length;
      
      setStats({
        totalCustomers,
        customersWithEmail,
        customersWithPhone,
        recentCustomers,
      });
    } catch (error) {
      console.error('Error loading customer stats:', error);
      setStats({
        totalCustomers: 0,
        customersWithEmail: 0,
        customersWithPhone: 0,
        recentCustomers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const MenuOption = ({ 
    title, 
    description, 
    icon, 
    color = '#6f42c1',
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
        <Text style={styles.title}>Customer Management</Text>
        <Text style={styles.subtitle}>Manage your customer database</Text>
      </View>

      <View style={styles.menuSection}>
        <MenuOption
          title="Add Customer"
          description="Create a new customer profile"
          icon="person-add"
          color="#6f42c1"
          onPress={() => navigation.navigate('AddEditCustomer' as never)}
        />
        
        <MenuOption
          title="Customer List"
          description="View and manage all customers"
          icon="people"
          color="#28a745"
          onPress={() => navigation.navigate('CustomerList' as never)}
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

export default CustomerMenuPage;
