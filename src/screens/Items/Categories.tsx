import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { database } from '../../db/database';
import { Category } from '../../db/models';
import { categoryRepo, itemRepo } from '../../db/repo';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    try {
      await database.init();
      const allCategories = await categoryRepo.findAll();
      
      if (!allCategories || allCategories.length === 0) {
        const defaultCategories = [
          'Electronics',
          'Clothing',
          'Books',
          'Home & Garden',
          'Sports',
          'Toys',
          'Other'
        ];
        
        for (const categoryName of defaultCategories) {
          try {
            await categoryRepo.create({
              name: categoryName,
              description: '',
              createdAt: new Date().toISOString(),
            });
          } catch (createError) {
          }
        }
        
        const updatedCategories = await categoryRepo.findAll();
        setCategories(updatedCategories || []);
      } else {
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
      if (loading) {
        Alert.alert('Error', 'Failed to load categories');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowAddForm(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await database.init();
      
      if (editingCategory) {
        await categoryRepo.update(editingCategory.id, {
          name: categoryName.trim(),
          description: editingCategory.description,
        });
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await categoryRepo.create({
          name: categoryName.trim(),
          description: '',
          createdAt: new Date().toISOString(),
        });
        Alert.alert('Success', 'Category created successfully');
      }
      
      setShowAddForm(false);
      setEditingCategory(null);
      setCategoryName('');
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'A category with this name already exists');
      } else {
        Alert.alert('Error', 'Failed to save category');
      }
    }
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.init();
              
              const itemsInCategory = await itemRepo.findByCategory(category.name);
              if (itemsInCategory.length > 0) {
                Alert.alert(
                  'Cannot Delete',
                  `This category has ${itemsInCategory.length} item(s). Please move or delete the items first.`
                );
                return;
              }

              await categoryRepo.delete(category.id);
              await loadCategories();
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.categoryDescription}>{item.description}</Text>
        )}
        <Text style={styles.categoryDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>
        Categories will appear here when items are added
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            value={categoryName}
            onChangeText={setCategoryName}
            autoFocus
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCategory}
            >
              <Text style={styles.saveButtonText}>
                {editingCategory ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {!showAddForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
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
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  addForm: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default Categories;
