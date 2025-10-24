
export interface Item {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  sku?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  customerId: number;
  invoiceNumber: string;
  date: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: 'sale' | 'purchase' | 'adjustment';
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  items: Item;
  customers: Customer;
  invoices: Invoice;
  invoice_items: InvoiceItem;
  categories: Category;
  transactions: Transaction;
  users: User;
}
