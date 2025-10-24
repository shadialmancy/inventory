import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import AddEditCustomer from '../screens/Customers/AddEditCustomer';
import CustomerList from '../screens/Customers/CustomerList';
import CustomerMenuPage from '../screens/Customers/CustomerMenuPage';
import HomeScreen from '../screens/HomeScreen';
import AddItem from '../screens/Items/AddItem';
import Categories from '../screens/Items/Categories';
import Inventory from '../screens/Items/Inventory';
import ItemList from '../screens/Items/ItemList';
import ItemMenuPage from '../screens/Items/ItemMenuPage';
import LoginScreen from '../screens/LoginScreen';
import CreateInvoice from '../screens/Transactions/CreateInvoice';
import InvoiceList from '../screens/Transactions/InvoiceList';
import TransactionMenuPage from '../screens/Transactions/TransactionMenuPage';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ItemMenu: undefined;
  ItemList: undefined;
  AddItem: { itemId?: number };
  Categories: undefined;
  Inventory: undefined;
  CustomerMenu: undefined;
  CustomerList: undefined;
  AddEditCustomer: { customerId?: number };
  TransactionMenu: undefined;
  InvoiceList: undefined;
  CreateInvoice: { customerId?: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  const LoginScreenWrapper = () => (
    <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  );

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false 
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="ItemMenu" 
              component={ItemMenuPage} 
              options={{ 
                headerShown: true,
                title: 'Item Management',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="ItemList" 
              component={ItemList} 
              options={{ 
                headerShown: true,
                title: 'Items',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="AddItem" 
              component={AddItem} 
              options={{ 
                headerShown: true,
                title: 'Add/Edit Item',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="Categories" 
              component={Categories} 
              options={{ 
                headerShown: true,
                title: 'Categories',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="Inventory" 
              component={Inventory} 
              options={{ 
                headerShown: true,
                title: 'Inventory',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="CustomerMenu" 
              component={CustomerMenuPage} 
              options={{ 
                headerShown: true,
                title: 'Customer Management',
                headerStyle: { backgroundColor: '#6f42c1' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="CustomerList" 
              component={CustomerList} 
              options={{ 
                headerShown: true,
                title: 'Customers',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="AddEditCustomer" 
              component={AddEditCustomer} 
              options={{ 
                headerShown: true,
                title: 'Add/Edit Customer',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="TransactionMenu" 
              component={TransactionMenuPage} 
              options={{ 
                headerShown: true,
                title: 'Transaction Management',
                headerStyle: { backgroundColor: '#28a745' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="InvoiceList" 
              component={InvoiceList} 
              options={{ 
                headerShown: true,
                title: 'Invoices',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="CreateInvoice" 
              component={CreateInvoice} 
              options={{ 
                headerShown: true,
                title: 'Create Invoice',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreenWrapper} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
