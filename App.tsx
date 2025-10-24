import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { database } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize database when app starts
    const initDatabase = async () => {
      try {
        await database.init();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
