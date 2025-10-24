export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  numeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },

  positive: (value: number): boolean => {
    return value > 0;
  },

  nonNegative: (value: number): boolean => {
    return value >= 0;
  },

  sku: (sku: string): boolean => {
    const skuRegex = /^[A-Za-z0-9\-]+$/;
    return skuRegex.test(sku);
  },

  barcode: (barcode: string): boolean => {
    const barcodeRegex = /^\d+$/;
    return barcodeRegex.test(barcode);
  },

  invoiceNumber: (invoiceNumber: string): boolean => {
    const invoiceRegex = /^[A-Za-z0-9\-]+$/;
    return invoiceRegex.test(invoiceNumber);
  },

  zipCode: (zipCode: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  date: (date: string): boolean => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },

  futureDate: (date: string): boolean => {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj > today;
  },

  pastDate: (date: string): boolean => {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return dateObj < today;
  }
};

export const validateForm = (data: Record<string, any>, rules: Record<string, any[]>): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      if (typeof rule === 'string') {
        if (rule === 'required' && !validators.required(value)) {
          errors[field] = 'This field is required';
          break;
        }
      } else if (typeof rule === 'object' && rule.validator) {
        try {
          if (rule.validator(value)) {
            continue;
          } else {
            errors[field] = rule.message || 'Invalid value';
            break;
          }
        } catch (error) {
          errors[field] = rule.message || 'Invalid value';
          break;
        }
      }
    }
  }

  return errors;
};

export const commonRules = {
  name: [
    { validator: validators.required, message: 'Name is required' },
    { validator: (value: string) => validators.minLength(value, 2), message: 'Name must be at least 2 characters' },
    { validator: (value: string) => validators.maxLength(value, 100), message: 'Name must be less than 100 characters' }
  ],
  email: [
    { validator: (value: string) => !value || value.trim() === '' || validators.email(value), message: 'Please enter a valid email address' }
  ],
  phone: [
    { validator: validators.required, message: 'Phone is required' },
    { validator: validators.phone, message: 'Please enter a valid phone number' }
  ],
  price: [
    { validator: validators.required, message: 'Price is required' },
    { validator: validators.nonNegative, message: 'Price must be a positive number' }
  ],
  quantity: [
    { validator: validators.required, message: 'Quantity is required' },
    { validator: validators.nonNegative, message: 'Quantity must be a positive number' }
  ]
};