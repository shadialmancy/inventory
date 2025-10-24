import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { database } from '../db/database';
import { userRepo } from '../db/repo';
import { validators } from '../utils/validators';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validators.email(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 50) {
      newErrors.password = 'Password must be less than 50 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await database.init();
      
      const user = await userRepo.authenticate(email.trim(), password);
      
      if (user) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          Alert.alert('Success', `Welcome back, ${user.name}!`);
        }
      } else {
        Alert.alert('Error', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your inventory account</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.credentialsInfo}>
              <Text style={styles.credentialsTitle}>Default Credentials:</Text>
              <Text style={styles.credentialsText}>Email: admin@inventory.com</Text>
              <Text style={styles.credentialsText}>Password: admin123</Text>
            </View>
            
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  credentialsInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default LoginScreen;
