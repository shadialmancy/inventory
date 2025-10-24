import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats] = useState({
    totalItems: 0,
    totalInvoices: 0,
    totalCustomers: 0,
  });

  const MenuCard = ({ 
    title, 
    icon, 
    color = '#007AFF',
    onPress 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.menuCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.menuContent}>
        <Ionicons name={icon} size={32} color={color} />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = '#007AFF'
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
  }) => (
    <View 
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Inventory Management System</Text>
      </View>

      {/* Navigation Menus */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Navigation Menus</Text>
        
        <View style={styles.menuGrid}>
          <MenuCard
            title="Item Menu"
            icon="cube"
            color="#007AFF"
            onPress={() => navigation.navigate('ItemMenu' as never)}
          />
          
         
          
          <MenuCard
            title="Transaction Menu"
            icon="receipt"
            color="#28a745"
            onPress={() => navigation.navigate('TransactionMenu' as never)}
          />
        </View>
        <View style={styles.indivGrid}>
        <MenuCard
            title="Customer Menu"
            icon="people"
            color="#6f42c1"
            onPress={() => navigation.navigate('CustomerMenu' as never)}
          />
          </View>
      </View>

      {/* Summary Information */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Summary Information</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon="cube"
            color="#007AFF"
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon="receipt"
            color="#ffc107"
          />
          
        </View>
        <View style={styles.indivGrid}>
        <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon="people"
            color="#28a745"
          />
          </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  menuCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  summarySection: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  indivGrid: {
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  statContent: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
