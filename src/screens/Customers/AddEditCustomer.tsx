import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { database } from '../../db/database';
import { customerRepo } from '../../db/repo';
import { commonRules, validateForm, validators } from '../../utils/validators';

interface AddEditCustomerProps {
  route?: {
    params?: {
      customerId?: number;
    };
  };
}

const AddEditCustomer: React.FC<AddEditCustomerProps> = ({ route }) => {
  const navigation = useNavigation();
  const customerId = route?.params?.customerId;
  const isEditing = !!customerId;
  

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadCustomer();
    }
  }, [isEditing, customerId]);

  const loadCustomer = async () => {
    if (!customerId) {
      return;
    }
    try {
      await database.init();
      const customer = await customerRepo.findById(customerId);
      if (customer) {
        setFormData({
          name: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
        });
      } else {
        Alert.alert('Error', 'Customer not found');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Failed to load customer details');
    }
  };

  const validateFormData = () => {
    const rules = {
      name: commonRules.name,
      phone: commonRules.phone,
      email: [
        // Email is optional, but if provided, must be valid
        { 
          validator: (value: string) => !value || value.trim() === '' || validators.email(value), 
          message: 'Please enter a valid email address' 
        }
      ],
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

      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await customerRepo.update(customerId, customerData);
        Alert.alert('Success', 'Customer updated successfully', [
          { text: 'OK', onPress: () => (navigation as any).goBack() }
        ]);
      } else {
        await customerRepo.create(customerData);
        Alert.alert('Success', 'Customer created successfully', [
          { text: 'OK', onPress: () => (navigation as any).goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save customer';
      Alert.alert('Error', errorMessage);
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
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Customer Name *"
            placeholder="Enter customer name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            error={errors.name}
          />

          <TextInput
            label="Phone *"
            placeholder="Enter phone number"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address (optional)"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />


          <Button
            title={isEditing ? 'Update Customer' : 'Save Customer'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
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
});

export default AddEditCustomer;
