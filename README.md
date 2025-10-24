# 📦 Inventory Management App

A comprehensive React Native inventory management application built with Expo, featuring local SQLite database storage, user authentication, and complete CRUD operations for items, customers, and transactions.

## 🚀 Features

### 🔐 Authentication
- **Local Authentication** - No backend required
- **Default Admin Account** - Ready to use out of the box
- **Secure Login** - Email and password validation
- **User Management** - Admin and user roles

### 📦 Item Management
- **Add/Edit Items** - Complete item lifecycle management
- **Category Management** - Organize items by categories
- **Inventory Tracking** - Real-time stock monitoring
- **Item Search** - Quick item lookup and filtering
- **Low Stock Alerts** - Automatic notifications for low inventory

### 👥 Customer Management
- **Customer Database** - Store customer information
- **Contact Details** - Name, phone, and email management
- **Customer Search** - Quick customer lookup
- **Customer Statistics** - Track customer engagement

### 💰 Transaction Management
- **Invoice Creation** - Professional invoice generation
- **Invoice Management** - Track all invoices and payments
- **Tax Calculations** - Automatic VAT and tax calculations
- **Payment Tracking** - Monitor invoice status and payments
- **Financial Reports** - Revenue and transaction analytics

### 📊 Dashboard & Analytics
- **Real-time Statistics** - Live data updates
- **Inventory Overview** - Stock levels and values
- **Sales Analytics** - Revenue and transaction insights
- **Quick Actions** - Fast access to common tasks

## 🛠️ Technology Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **SQLite** - Local database storage
- **React Navigation** - Navigation management
- **Expo SQLite** - Database operations
- **React Native Reanimated** - Smooth animations

## 📱 Supported Platforms

- **iOS** - Native iOS app
- **Android** - Native Android app
- **Web** - Progressive web app

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🔑 Default Login Credentials

The app comes with a pre-configured admin account:

- **Email:** `admin@inventory.com`
- **Password:** `admin123`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   └── TextInput.tsx   # Custom text input component
├── db/                 # Database layer
│   ├── database.ts     # Database initialization and management
│   ├── models.ts       # TypeScript interfaces
│   └── repo.ts         # Repository pattern for CRUD operations
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx # Main navigation setup
├── screens/           # Application screens
│   ├── Customers/     # Customer management screens
│   ├── Items/         # Item management screens
│   ├── Transactions/  # Transaction management screens
│   ├── HomeScreen.tsx # Main dashboard
│   └── LoginScreen.tsx # Authentication screen
└── utils/             # Utility functions
    ├── calculations.ts # Financial calculations
    └── validators.ts   # Form validation
```

## 🗄️ Database Schema

### Tables
- **users** - User authentication and profiles
- **categories** - Item categories
- **items** - Product inventory
- **customers** - Customer information
- **invoices** - Sales invoices
- **invoice_items** - Invoice line items
- **transactions** - Inventory transactions

### Key Features
- **Automatic Schema Creation** - Tables created on first run
- **Default Data** - Pre-populated categories and admin user
- **Data Integrity** - Foreign key constraints and validation
- **Performance Optimized** - Indexed columns for fast queries

## 🎯 Core Functionality

### Item Management
- Create, read, update, and delete items
- Category-based organization
- Stock quantity tracking
- Price and cost management
- SKU and barcode support
- Low stock alerts

### Customer Management
- Customer profile management
- Contact information storage
- Customer search and filtering
- Purchase history tracking

### Transaction Management
- Invoice creation and management
- Automatic invoice numbering
- Tax calculations (VAT support)
- Payment status tracking
- Invoice item management
- Customer selection and billing

### Inventory Analytics
- Real-time stock levels
- Inventory valuation
- Sales analytics
- Revenue tracking
- Transaction history

## 🔧 Configuration

### Environment Setup
The app uses local SQLite database storage, so no external database configuration is required.

### Customization
- **Tax Rates** - Modify VAT rates in `src/utils/calculations.ts`
- **Validation Rules** - Update form validation in `src/utils/validators.ts`
- **UI Themes** - Customize colors and styles in component files

## 📱 Usage Guide

### First Time Setup
1. Launch the app
2. Use default credentials to login
3. Start adding items and customers
4. Create your first invoice

### Daily Operations
1. **Add Items** - Register new products with categories
2. **Manage Inventory** - Update stock levels and prices
3. **Customer Management** - Add and update customer information
4. **Create Invoices** - Generate sales invoices
5. **Track Sales** - Monitor revenue and transactions

### Best Practices
- Regular data backup (export functionality)
- Consistent category naming
- Accurate stock level updates
- Regular invoice reconciliation

## 🚀 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
expo build:android --type apk
expo build:ios --type archive
```

### App Store Deployment
1. Configure app.json for production
2. Build production binaries
3. Submit to App Store/Google Play
4. Configure app store metadata

## 🔒 Security Features

- **Local Data Storage** - No cloud dependencies
- **Input Validation** - Comprehensive form validation
- **SQL Injection Protection** - Parameterized queries
- **Data Integrity** - Foreign key constraints
- **User Authentication** - Secure login system

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Ensure SQLite is properly initialized
- Check database file permissions
- Restart the app to reinitialize database

**Navigation Issues**
- Verify screen names in AppNavigator
- Check route parameters
- Ensure proper screen imports

**Build Errors**
- Clear Expo cache: `expo start -c`
- Update dependencies: `npm update`
- Check TypeScript errors: `npm run lint`

### Debug Mode
Enable debug logging by setting environment variables or using Expo development tools.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the code documentation
- Open an issue on GitHub

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication
  - Item management
  - Customer management
  - Transaction management
  - Dashboard analytics

## 🎉 Acknowledgments

- Built with React Native and Expo
- Database powered by SQLite
- UI components with React Navigation
- Icons by Expo Vector Icons

---

**Happy Inventory Managing! 📦✨**