import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'inventory_v2.db';
const DATABASE_VERSION = 2;

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      if (this.db) {
        try {
          await this.db.closeAsync();
        } catch (closeError) {
          console.log('Error closing existing database connection:', closeError);
        }
        this.db = null;
      }

      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      if (!this.db) {
        throw new Error('Failed to create database connection');
      }
      
      try {
        await this.db.getFirstAsync('SELECT 1 as test');
        console.log('Database connection test successful');
      } catch (testError) {
        console.error('Database connection test failed:', testError);
        console.log('Continuing with database initialization despite test failure');
      }
      
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      this.db = null;
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        cost REAL NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        minQuantity INTEGER NOT NULL DEFAULT 0,
        sku TEXT,
        barcode TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        invoiceNumber TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL,
        subtotal REAL NOT NULL DEFAULT 0,
        taxRate REAL NOT NULL DEFAULT 0,
        taxAmount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        FOREIGN KEY (invoiceId) REFERENCES invoices (id),
        FOREIGN KEY (itemId) REFERENCES items (id)
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        itemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        reference TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itemId) REFERENCES items (id)
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_items_category ON items (category);
      CREATE INDEX IF NOT EXISTS idx_items_sku ON items (sku);
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices (customerId);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
      CREATE INDEX IF NOT EXISTS idx_transactions_item ON transactions (itemId);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    `);

      await this.insertDefaultCategories();
      await this.insertDefaultUser();
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }

  private async insertDefaultCategories(): Promise<void> {
    if (!this.db) return;

    try {
      const defaultCategories = [
     
        'Other'
      ];

      for (const category of defaultCategories) {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO categories (name) VALUES (?)',
          [category]
        );
      }
    } catch (error) {
      console.error('Error inserting default categories:', error);
    }
  }

  private async insertDefaultUser(): Promise<void> {
    if (!this.db) return;

    try {
      const existingUsers = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM users');
      if (existingUsers && (existingUsers as any).count > 0) {
        return;
      }

      await this.db.runAsync(
        `INSERT OR IGNORE INTO users (email, password, name, role, isActive) VALUES (?, ?, ?, ?, ?)`,
        ['admin@inventory.com', 'admin123', 'Admin User', 'admin', 1]
      );
    } catch (error) {
      console.error('Error inserting default user:', error);
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async ensureDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.init();
    }
    
    try {
      await this.db!.getFirstAsync('SELECT 1 as test');
      console.log('Database connection verified');
    } catch (error) {
      console.error('Database connection test failed, but continuing...', error);
    }
    
    return this.db!;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  async reset(): Promise<void> {
    try {
      await this.close();
      await SQLite.deleteDatabaseAsync(DATABASE_NAME);
      await this.init();
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

}

export const database = new DatabaseManager();
export default database;