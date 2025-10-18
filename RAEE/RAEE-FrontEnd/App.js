import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import login screens
import LoginScreen from './login-screens/LoginScreen';
import RegisterScreen from './login-screens/RegisterScreen';
import ForgotPasswordScreen from './login-screens/ForgotPasswordScreen';

// Import citizen screens
import CitizenHomeScreen from './citizen-screens/CitizenHomeScreen';
import ProfileCitizenScreen from './citizen-screens/ProfileCitizenScreen';
import ExchangeShopCitizenScreen from './citizen-screens/ExchangeShopCitizenScreen';
import StatisticsCitizenScreen from './citizen-screens/StatisticsCitizenScreen';
import ScanQRCitizenScreen from './citizen-screens/ScanQRCitizen';

// Import reception screens
import ReceptionHomeScreen from './reception-screens/ReceptionHomeScreen';
import DeviceUploadSelectionScreen from './reception-screens/DeviceUploadSelectionScreen';
import SingleDeviceReceptionScreen from './reception-screens/SingleDeviceReceptionScreen';
import MultipleDeviceReceptionScreen from './reception-screens/MultipleDeviceReceptionScreen';
import ProfileReceptionScreen from './reception-screens/ProfileReceptionScreen';

// Import admin screens
import AdminHomeScreen from './administration-screens/AdminHomeScreen';
import CategoriesAdminScreen from './administration-screens/CategoriesAdminScreen';
import StatesAdminScreen from './administration-screens/StatesAdminScreen';
import UsersAdminScreen from './administration-screens/UsersAdminScreen';
import LocationsAdminScreen from './administration-screens/LocationsAdminScreen';

const Stack = createStackNavigator();

// Componente de navegación que usa el contexto de autenticación
function AppNavigator() {
  const { user, isLoading } = useAuth();
  const navigationRef = useRef();
  const prevUserRef = useRef(user);

  // Función para determinar la pantalla inicial según el rol del usuario
  const getInitialRouteName = (user) => {
    if (!user || !user.Roles_Usuarios) {
      return "Login";
    }

    // Convertir a número para manejar tanto strings como numbers
    const roleId = parseInt(user.Roles_Usuarios);
    
    switch (roleId) {
      case 1: // Ciudadano
        return "CitizenHomeScreen";
      case 2: // tenico
        return "Home"; // TODO: Crear institution-screens cuando sea necesario
      case 3: // institucion
        return "Home"; // TODO: Crear technician-screens cuando sea necesario
      case 4: // reception
        return "ReceptionHomeScreen";
      case 5: // admin
        return "AdminHomeScreen";
      default:
        return "Home"; // Default a reception-screens
    }
  };

  // Efecto para manejar cambios de usuario y navegación por roles
  useEffect(() => {
    // Detectar cuando el usuario pasa de estar autenticado a no autenticado
    if (prevUserRef.current !== null && user === null && navigationRef.current) {
      // Reset navigation stack when user logs out
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    
    // Detectar cuando el usuario cambia (login exitoso) y navegar según el rol
    if (prevUserRef.current === null && user !== null && navigationRef.current) {
      const targetScreen = getInitialRouteName(user);
      
      // Navegar a la pantalla correcta según el rol
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: targetScreen }],
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
        initialRouteName={getInitialRouteName(user)}
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
            {/* Citizen screens */}
            <Stack.Screen name="CitizenHomeScreen" component={CitizenHomeScreen} />
            <Stack.Screen name="ProfileCitizenScreen" component={ProfileCitizenScreen} />
            <Stack.Screen name="ExchangeShopCitizenScreen" component={ExchangeShopCitizenScreen} />
            <Stack.Screen name="StatisticsCitizenScreen" component={StatisticsCitizenScreen} />
            <Stack.Screen name="ScanQRCitizenScreen" component={ScanQRCitizenScreen} />
            
            {/* Reception screens */}
            <Stack.Screen name="ReceptionHomeScreen" component={ReceptionHomeScreen} />
            <Stack.Screen name="DeviceUploadSelectionScreen" component={DeviceUploadSelectionScreen} />
            <Stack.Screen name="SingleDeviceScreen" component={SingleDeviceReceptionScreen} />
            <Stack.Screen name="MultipleDeviceScreen" component={MultipleDeviceReceptionScreen} />
            <Stack.Screen name="ProfileReceptionScreen" component={ProfileReceptionScreen} />
            
            {/* Admin screens */}
            <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
            <Stack.Screen name="CategoriesAdminScreen" component={CategoriesAdminScreen} />
            <Stack.Screen name="StatesAdminScreen" component={StatesAdminScreen} />
            <Stack.Screen name="UsersAdminScreen" component={UsersAdminScreen} />
            <Stack.Screen name="LocationsAdminScreen" component={LocationsAdminScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}