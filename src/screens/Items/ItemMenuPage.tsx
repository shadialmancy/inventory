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
import { itemRepo } from '../../db/repo';

const ItemMenuPage: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalValue: 0,
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
      const items = await itemRepo.findAll();
      
      // Calculate statistics
      const totalItems = items.length;
      const categories = [...new Set(items.map(item => item.category))];
      const totalCategories = categories.length;
      const lowStockItems = items.filter(item => item.quantity <= item.minQuantity).length;
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setStats({
        totalItems,
        totalCategories,
        lowStockItems,
        totalValue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const MenuOption = ({ 
    title, 
    description, 
    icon, 
    color = '#007AFF',
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
        <Text style={styles.title}>Item Management</Text>
        <Text style={styles.subtitle}>Manage your inventory items</Text>
      </View>

      <View style={styles.menuSection}>
        <MenuOption
          title="Add Item"
          description="Create a new inventory item"
          icon="add-circle"
          color="#007AFF"
          onPress={() => navigation.navigate('AddItem' as never)}
        />
        
        <MenuOption
          title="Item List"
          description="View and manage all items"
          icon="list"
          color="#28a745"
          onPress={() => navigation.navigate('ItemList' as never)}
        />
        
        <MenuOption
          title="Categories"
          description="Manage item categories"
          icon="folder"
          color="#ffc107"
          onPress={() => navigation.navigate('Categories' as never)}
        />
        
        <MenuOption
          title="Inventory"
          description="View stock quantities and levels"
          icon="cube"
          color="#6f42c1"
          onPress={() => navigation.navigate('Inventory' as never)}
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
  statsSection: {
    padding: 16,
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ItemMenuPage;
