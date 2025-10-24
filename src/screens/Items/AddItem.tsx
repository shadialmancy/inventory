import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { database } from '../../db/database';
import { categoryRepo, itemRepo } from '../../db/repo';
import { commonRules, validateForm } from '../../utils/validators';

interface AddItemProps {
  route?: {
    params?: {
      itemId?: number;
    };
  };
}

const AddItem: React.FC<AddItemProps> = ({ route }) => {
  const navigation = useNavigation();
  const itemId = route?.params?.itemId;
  const isEditing = !!itemId;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadItem();
    }
  }, [isEditing, itemId]);

  const loadCategories = async () => {
    try {
      await database.init();
      const allCategories = await categoryRepo.findAll();
      setCategories(allCategories.map(cat => cat.name));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadItem = async () => {
    if (!itemId) return;

    try {
      await database.init();
      const item = await itemRepo.findById(itemId);
      if (item) {
        setFormData({
          name: item.name,
          category: item.category,
          price: item.price.toString(),
          quantity: item.quantity.toString(),
        });
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    }
  };

  const validateFormData = () => {
    const rules = {
      name: commonRules.name,
      category: commonRules.name,
      price: commonRules.price,
      quantity: commonRules.quantity,
    };

    const validationErrors = validateForm(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFormData()) {
      return;
    }

    setLoading(true);

    try {
      await database.init();

      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await itemRepo.update(itemId, itemData);
        Alert.alert('Success', 'Item updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await itemRepo.create(itemData);
        Alert.alert('Success', 'Item created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        // Reset form
        setFormData({
          name: '',
          category: '',
          price: '',
          quantity: '',
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Item Name *"
            placeholder="Enter item name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            error={errors.name}
          />


          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity 
              style={[styles.pickerButton, errors.category && styles.errorBorder]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.pickerText, !formData.category && styles.placeholderText]}>
                {formData.category || 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <TextInput
                label="Price *"
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                keyboardType="numeric"
                error={errors.price}
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInput
                label="Quantity *"
                placeholder="0"
                value={formData.quantity}
                onChangeText={(value) => updateFormData('quantity', value)}
                keyboardType="numeric"
                error={errors.quantity}
              />
            </View>
          </View>


          <Button
            title={isEditing ? 'Update Item' : 'Save Item'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryPicker(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => {
                    updateFormData('category', item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryOptionName}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  errorBorder: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    maxHeight: '70%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryOptionName: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddItem;
