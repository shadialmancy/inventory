import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
import { Item } from '../../db/models';
import { itemRepo } from '../../db/repo';
import { calculations } from '../../utils/calculations';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lowStock' | 'outOfStock'>('all');
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  useEffect(() => {
    loadItems();
  }, [filter]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const loadItems = async () => {
    try {
      // Ensure database is properly initialized
      await database.init();
      
      // Add a small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allItems = await itemRepo.findAll();
      
      // Handle case where allItems might be null or undefined
      const items = allItems || [];

      // Calculate statistics with safe defaults
      const totalValue = calculations.calculateInventoryValue(
        items.map(item => ({ quantity: item.quantity || 0, cost: item.cost || 0 }))
      );
      const lowStockCount = items.filter(item => (item.quantity || 0) <= 5 && (item.quantity || 0) > 0).length;
      const outOfStockCount = items.filter(item => (item.quantity || 0) === 0).length;

      setStats({
        totalItems: items.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
      });

      // Apply filters with safe data
      let filteredItems = items;
      if (filter === 'lowStock') {
        filteredItems = items.filter(item => (item.quantity || 0) <= 5 && (item.quantity || 0) > 0);
      } else if (filter === 'outOfStock') {
        filteredItems = items.filter(item => (item.quantity || 0) === 0);
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
      // Set safe defaults on error
      setStats({
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      });
      setItems([]);
      
      // Only show alert if this is not a background refresh
      if (loading) {
        Alert.alert('Error', 'Failed to load inventory data');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };






  const renderFilterButton = (filterType: 'all' | 'lowStock' | 'outOfStock', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Item }) => (
    <View 
      style={styles.inventoryCard}
      
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={[
            styles.quantityText,
            item.quantity === 0 ? styles.outOfStock : 
            item.quantity <= 5 ? styles.lowStock : null
          ]}>
            {item.quantity}
          </Text>
          <Text style={styles.quantityLabel}>in stock</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Value:</Text>
          <Text style={styles.detailValue}>
            ${(item.quantity * item.price).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Items Found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'lowStock' 
          ? 'No low stock items found'
          : filter === 'outOfStock'
          ? 'No out of stock items found'
          : 'Add your first item to get started'
        }
      </Text>
    </View>
  );

  const displayStats = {
    totalItems: stats.totalItems,
    totalValue: stats.totalValue,
    lowStockCount: stats.lowStockCount,
    outOfStockCount: stats.outOfStockCount,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{displayStats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ffc107' }]}>{displayStats.lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#dc3545' }]}>{displayStats.outOfStockCount}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#28a745' }]}>
            {calculations.formatCurrency(displayStats.totalValue)}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All Items')}
        {renderFilterButton('lowStock', 'Low Stock')}
        {renderFilterButton('outOfStock', 'Out of Stock')}
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        renderItem={renderItem}
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
  statsHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
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
  inventoryCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
  },
  lowStock: {
    color: '#ffc107',
  },
  outOfStock: {
    color: '#dc3545',
  },
  itemDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff5f5',
    gap: 4,
  },
  deleteText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
});

export default Inventory;
