import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import screens
import LoginScreen from './login-screens/LoginScreen';
import RegisterScreen from './login-screens/RegisterScreen';
import ForgotPasswordScreen from './login-screens/ForgotPasswordScreen';
import HomeScreen from './citizen-screens/HomeScreen';
import DonationScreen from './citizen-screens/DonationScreen';
import ProfileScreen from './citizen-screens/ProfileScreen';
import ExchangeShopScreen from './citizen-screens/ExchangeShopScreen';
import StatisticsScreen from './citizen-screens/StatisticsScreen';

const Stack = createStackNavigator();

// Componente de navegación que usa el contexto de autenticación
function AppNavigator() {
  const { user, isLoading } = useAuth();
  const navigationRef = useRef();
  const prevUserRef = useRef(user);

  // Efecto para manejar el logout y resetear la navegación
  useEffect(() => {
    // Detectar cuando el usuario pasa de estar autenticado a no autenticado
    if (prevUserRef.current !== null && user === null && navigationRef.current) {
      // Reset navigation stack when user logs out
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    prevUserRef.current = user;
  }, [user]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={user == null ? "Login" : "Home"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {user == null ? (
          // Pantallas para usuarios no autenticados
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                title: 'Iniciar Sesión',
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Pantallas para usuarios autenticados
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Donation" component={DonationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ExchangeShop" component={ExchangeShopScreen} />
            <Stack.Screen name="Statistics" component={StatisticsScreen} />
            {/* Aquí se agregarán más pantallas autenticadas */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}