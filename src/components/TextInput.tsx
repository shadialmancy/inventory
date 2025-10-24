import React from 'react';
import { TextInput as RNTextInput, StyleSheet, Text, TextInputProps, View } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
});
