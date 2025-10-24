import { database } from './database';
import { Category, Customer, Invoice, InvoiceItem, Item, Transaction, User } from './models';

export class Repository<T> {
  constructor(private tableName: string) {}

  async create(data: Partial<T>): Promise<number> {
    const db = await database.ensureDatabase();
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const result = await db.runAsync(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
      values as any
    );
    return result.lastInsertRowId;
  }

  async findById(id: number): Promise<T | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return result || null;
  }

  async findAll(): Promise<T[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<T>(`SELECT * FROM ${this.tableName} ORDER BY id DESC`);
  }

  async update(id: number, data: Partial<T>): Promise<void> {
    const db = await database.ensureDatabase();
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await db.runAsync(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      values as any
    );
  }

  async delete(id: number): Promise<void> {
    const db = await database.ensureDatabase();
    await db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async count(): Promise<number> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    return result?.count || 0;
  }
}

export class ItemRepository extends Repository<Item> {
  constructor() {
    super('items');
  }

  async findByCategory(category: string): Promise<Item[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Item>(
      'SELECT * FROM items WHERE category = ? ORDER BY name',
      [category]
    );
  }

  async findBySku(sku: string): Promise<Item | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<Item>(
      'SELECT * FROM items WHERE sku = ?',
      [sku]
    );
    return result || null;
  }

  async findByBarcode(barcode: string): Promise<Item | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<Item>(
      'SELECT * FROM items WHERE barcode = ?',
      [barcode]
    );
    return result || null;
  }

  async findLowStock(): Promise<Item[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Item>(
      'SELECT * FROM items WHERE quantity <= min_quantity ORDER BY quantity ASC'
    );
  }

  async search(query: string): Promise<Item[]> {
    const db = await database.ensureDatabase();
    const searchTerm = `%${query}%`;
    return await db.getAllAsync<Item>(
      'SELECT * FROM items WHERE name LIKE ? OR description LIKE ? OR sku LIKE ? ORDER BY name',
      [searchTerm, searchTerm, searchTerm]
    );
  }

  async updateQuantity(id: number, quantity: number): Promise<void> {
    const db = await database.ensureDatabase();
    await db.runAsync(
      'UPDATE items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
  }
}

export class CustomerRepository extends Repository<Customer> {
  constructor() {
    super('customers');
  }

  async search(query: string): Promise<Customer[]> {
    const db = await database.ensureDatabase();
    const searchTerm = `%${query}%`;
    return await db.getAllAsync<Customer>(
      'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name',
      [searchTerm, searchTerm, searchTerm]
    );
  }
}

export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super('invoices');
  }

  async findByCustomer(customerId: number): Promise<Invoice[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Invoice>(
      'SELECT * FROM invoices WHERE customer_id = ? ORDER BY date DESC',
      [customerId]
    );
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Invoice>(
      'SELECT * FROM invoices WHERE status = ? ORDER BY date DESC',
      [status]
    );
  }

  async generateInvoiceNumber(): Promise<string> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM invoices'
    );
    const count = (result?.count || 0) + 1;
    return `INV-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
  }

  async getInvoiceWithItems(invoiceId: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
    const db = await database.ensureDatabase();
    
    const invoice = await db.getFirstAsync<Invoice>(
      'SELECT * FROM invoices WHERE id = ?',
      [invoiceId]
    );

    if (!invoice) return null;

    const items = await db.getAllAsync<InvoiceItem>(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [invoiceId]
    );

    return { invoice, items };
  }
}

export class InvoiceItemRepository extends Repository<InvoiceItem> {
  constructor() {
    super('invoice_items');
  }

  async findByInvoice(invoiceId: number): Promise<InvoiceItem[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<InvoiceItem>(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [invoiceId]
    );
  }
}

export class CategoryRepository extends Repository<Category> {
  constructor() {
    super('categories');
  }

  async findByName(name: string): Promise<Category | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<Category>(
      'SELECT * FROM categories WHERE name = ?',
      [name]
    );
    return result || null;
  }
}

export class TransactionRepository extends Repository<Transaction> {
  constructor() {
    super('transactions');
  }

  async findByItem(itemId: number): Promise<Transaction[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE item_id = ? ORDER BY created_at DESC',
      [itemId]
    );
  }

  async findByType(type: string): Promise<Transaction[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE type = ? ORDER BY created_at DESC',
      [type]
    );
  }

  async getItemHistory(itemId: number, limit: number = 50): Promise<Transaction[]> {
    const db = await database.ensureDatabase();
    return await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE item_id = ? ORDER BY created_at DESC LIMIT ?',
      [itemId, limit]
    );
  }
}

export class UserRepository extends Repository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<User>(
      'SELECT * FROM users WHERE email = ? AND isActive = 1',
      [email]
    );
    return result || null;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const db = await database.ensureDatabase();
    const result = await db.getFirstAsync<User>(
      'SELECT * FROM users WHERE email = ? AND password = ? AND isActive = 1',
      [email, password]
    );
    return result || null;
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.update(id, { 
      password: newPassword, 
      updatedAt: new Date().toISOString() 
    });
  }

  async deactivateUser(id: number): Promise<void> {
    await this.update(id, { 
      isActive: false, 
      updatedAt: new Date().toISOString() 
    });
  }
}

export const itemRepo = new ItemRepository();
export const customerRepo = new CustomerRepository();
export const invoiceRepo = new InvoiceRepository();
export const invoiceItemRepo = new InvoiceItemRepository();
export const categoryRepo = new CategoryRepository();
export const transactionRepo = new TransactionRepository();
export const userRepo = new UserRepository();
