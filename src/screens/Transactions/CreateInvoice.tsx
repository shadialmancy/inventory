import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { Customer, Item } from '../../db/models';
import { customerRepo, invoiceItemRepo, invoiceRepo, itemRepo } from '../../db/repo';
import { calculations } from '../../utils/calculations';

interface CreateInvoiceProps {
  route?: {
    params?: {
      customerId?: number;
    };
  };
}

const CreateInvoice: React.FC<CreateInvoiceProps> = ({ route }) => {
  const navigation = useNavigation();
  const customerId = route?.params?.customerId;

  const [formData, setFormData] = useState({
    customerId: customerId?.toString() || '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    taxRate: '0.20', // 20% VAT
    notes: '',
  });

  const [selectedItems, setSelectedItems] = useState<Array<Item & { quantity: number; unitPrice: number; extendedAmount: number }>>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadData();
    generateInvoiceNumber();
  }, []);

  const loadData = async () => {
    try {
      await database.init();
      const [items, allCustomers] = await Promise.all([
        itemRepo.findAll(),
        customerRepo.findAll(),
      ]);
      setAvailableItems(items);
      setCustomers(allCustomers);
      
      // Extract unique categories from items
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      await database.init();
      const invoiceNumber = await invoiceRepo.generateInvoiceNumber();
      setFormData(prev => ({ ...prev, invoiceNumber }));
    } catch (error) {
      console.error('Error generating invoice number:', error);
    }
  };

  const addItemToInvoice = (item: Item) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id);
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(selected => 
          selected.id === item.id 
            ? { 
                ...selected, 
                quantity: selected.quantity + 1,
                extendedAmount: (selected.quantity + 1) * selected.unitPrice
              }
            : selected
        )
      );
    } else {
      setSelectedItems(prev => [...prev, { 
        ...item, 
        quantity: 1, 
        unitPrice: item.price,
        extendedAmount: item.price
      }]);
    }
    setShowItemSelector(false);
  };

  const removeItemFromInvoice = (itemId: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const categoryItems = availableItems.filter(item => item.category === category);
    setFilteredItems(categoryItems);
    setShowCategoryPicker(false);
    setShowItemSelector(true);
  };

  const updateItemQuantity = (itemId: number, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: Math.max(1, quantity),
              extendedAmount: Math.max(1, quantity) * item.unitPrice
            }
          : item
      )
    );
  };

  const updateItemPrice = (itemId: number, price: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              unitPrice: price,
              extendedAmount: item.quantity * price
            }
          : item
      )
    );
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.extendedAmount, 0);
    const taxRate = parseFloat(formData.taxRate);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };


  const handleSaveInvoice = async () => {
    if (!formData.customerId || selectedItems.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item');
      return;
    }

    setLoading(true);

    try {
      await database.init();

      const { subtotal, tax, total } = calculateTotals();

      // Create invoice
      const invoiceData = {
        customerId: parseInt(formData.customerId),
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        subtotal,
        taxRate: parseFloat(formData.taxRate),
        taxAmount: tax,
        total,
        status: 'draft' as const,
        notes: formData.notes.trim() || undefined,
      };

      const invoiceId = await invoiceRepo.create(invoiceData);

      // Create invoice items
      for (const item of selectedItems) {
        await invoiceItemRepo.create({
          invoiceId,
          itemId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        });
      }

      Alert.alert('Success', 'Invoice created successfully', [
        { text: 'OK', onPress: () => (navigation as any).goBack() }
      ]);
      // Reset form
      setSelectedItems([]);
      setFormData(prev => ({
        ...prev,
        customerId: '',
        notes: '',
      }));
      generateInvoiceNumber();
    } catch (error) {
      console.error('Error creating invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Invoice</Text>

        <View style={styles.form}>
          {/* Customer Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowCustomerPicker(true)}
            >
              <Text style={styles.pickerText}>
                {formData.customerId ? 
                  customers.find(c => c.id.toString() === formData.customerId)?.name || 'Select Customer' :
                  'Select Customer'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Invoice Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <TextInput
              label="Invoice Number"
              placeholder="Invoice number"
              value={formData.invoiceNumber}
              editable={false}
              style={styles.disabledInput}
            />
            
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerText}>
                {new Date(formData.date).toLocaleDateString()}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Tax Rate (%)"
                  placeholder="20"
                  value={formData.taxRate ? (parseFloat(formData.taxRate) * 100).toString() : ''}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9.]/g, '');
                    const percentage = parseFloat(numericValue) || 0;
                    setFormData(prev => ({ 
                      ...prev, 
                      taxRate: (percentage / 100).toString() 
                    }));
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TextInput
              label="Notes"
              placeholder="Additional notes"
              value={formData.notes}
              onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category and Item Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Items</Text>
            
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.pickerText}>
                {selectedCategory || 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            {selectedCategory && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowItemSelector(true)}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addButtonText}>Select Items from {selectedCategory}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selected Items</Text>
            </View>

            {selectedItems.length === 0 ? (
              <View style={styles.emptyItems}>
                <Text style={styles.emptyItemsText}>No items added yet</Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {selectedItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeItemFromInvoice(item.id)}
                      >
                        <Ionicons name="trash" size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.quantityRow}>
                        <Text style={styles.label}>Quantity:</Text>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Ionicons name="remove" size={16} color="#007AFF" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Ionicons name="add" size={16} color="#007AFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.priceRow}>
                        <Text style={styles.label}>Unit Price:</Text>
                        <TextInput
                          style={styles.priceInput}
                          value={item.unitPrice.toString()}
                          onChangeText={(value) => updateItemPrice(item.id, parseFloat(value) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                      
                      <View style={styles.extendedRow}>
                        <Text style={styles.label}>Extended Amount:</Text>
                        <Text style={styles.extendedAmount}>
                          ${item.extendedAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{calculations.formatCurrency(totals.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{calculations.formatCurrency(totals.tax)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>{calculations.formatCurrency(totals.total)}</Text>
            </View>
          </View>

          <Button
            title="Create Invoice"
            onPress={handleSaveInvoice}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Customer Picker Modal */}
      {showCustomerPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCustomerPicker(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={customers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, customerId: item.id.toString() }));
                    setShowCustomerPicker(false);
                  }}
                >
                  <Text style={styles.customerOptionName}>{item.name}</Text>
                  <Text style={styles.customerOptionPhone}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </View>
      )}

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
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={styles.categoryOptionName}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      )}

      {/* Item Selector Modal */}
      {showItemSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Items from {selectedCategory}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowItemSelector(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredItems}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemOption}
                  onPress={() => addItemToInvoice(item)}
                >
                  <Text style={styles.itemOptionName}>{item.name}</Text>
                  <Text style={styles.itemOptionPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </View>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Invoice Date</Text>
              
              {/* Native Date Picker */}
              <DateTimePicker
                value={new Date(formData.date)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setFormData(prev => ({ 
                      ...prev, 
                      date: selectedDate.toISOString().split('T')[0] 
                    }));
                    // Auto-close on Android
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                  }
                }}
                style={styles.datePicker}
                maximumDate={new Date(2030, 11, 31)}
                minimumDate={new Date(2020, 0, 1)}
              />
              
              {/* Quick Date Buttons for iOS */}
              {Platform.OS === 'ios' && (
                <View style={styles.dateButtons}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, date: today }));
                    }}
                  >
                    <Text style={styles.dateButtonText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setFormData(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));
                    }}
                  >
                    <Text style={styles.dateButtonText}>Tomorrow</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Confirm Button for iOS */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.confirmButtonText}>Confirm Date</Text>
                </TouchableOpacity>
              )}
            </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyItems: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#666',
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  totalsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    marginTop: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDetails: {
    gap: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extendedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  extendedAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  customerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  customerOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  customerOptionPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    width: '90%',
    maxHeight: '70%',
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
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  itemOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemOptionName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemOptionPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  datePickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 'auto',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateInvoice;
