import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';

// Estados de autenticación
const AuthContext = createContext();

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_USER':
      return {
        ...state,
        user: action.user,
        isLoading: false,
        isSignout: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        user: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.userData },
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  isLoading: true,
  isSignout: false,
  user: null,
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Efectos para cargar el usuario al iniciar la app
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Limpiar automáticamente todos los datos de usuario al abrir la app
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('profileImage');
        await AsyncStorage.removeItem('profileImageUserId');
        
        // Limpiar todos los cooldowns de cambio de imagen
        const keys = await AsyncStorage.getAllKeys();
        const imageChangeKeys = keys.filter(key => key.startsWith('lastImageChange_'));
        await AsyncStorage.multiRemove(imageChangeKeys);
        
        // Limpiar preferencia de tema también si se desea
        // await AsyncStorage.removeItem('theme_mode');
        
      } catch (e) {
        console.error('Error clearing user data:', e);
      }

      // Siempre restaurar con usuario nulo (forzar logout)
      dispatch({ 
        type: 'RESTORE_USER', 
        user: null 
      });
    };

    bootstrapAsync();
  }, []);

  // Acciones de autenticación
  const authContext = {
    // Iniciar sesión
    signIn: async (credentials) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await ApiService.login(credentials);
        
        // El backend devuelve { message, user } en login exitoso
        if (response && response.user) {
          const userData = response.user;

          // Guardar los datos del usuario en AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          dispatch({
            type: 'SIGN_IN',
            user: userData,
          });
          
          return { success: true, message: response.message || 'Inicio de sesión exitoso' };
        } else {
          dispatch({ type: 'SET_LOADING', isLoading: false });
          return { success: false, message: response?.message || 'Credenciales inválidas' };
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return { 
          success: false, 
          message: error.message || 'Error de conexión' 
        };
      }
    },

    // Iniciar sesión con datos simulados (para demo)
    signInDemo: async (userData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        // Guardar los datos del usuario simulado en AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        dispatch({
          type: 'SIGN_IN',
          user: userData,
        });
        
        return { success: true, message: 'Login simulado exitoso' };
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return { 
          success: false, 
          message: error.message || 'Error en login simulado' 
        };
      }
    },

    // Registrar usuario
    signUp: async (userData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await ApiService.register(userData);
        
        dispatch({ type: 'SET_LOADING', isLoading: false });
        
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, message: response.message };
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return { 
          success: false, 
          message: error.message || 'Error de conexión' 
        };
      }
    },

    // Cerrar sesión
    signOut: async () => {
      try {
        // Limpiar todos los datos de usuario inmediatamente
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('profileImage');
        await AsyncStorage.removeItem('profileImageUserId');
        
        // Limpiar cooldown específico del usuario
        const currentUserId = state.user?.idUsuarios;
        if (currentUserId) {
          await AsyncStorage.removeItem(`lastImageChange_${currentUserId}`);
        }
        
        // Despachar el logout inmediatamente
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Error signing out:', error);
        // Aún así cerrar sesión localmente
        dispatch({ type: 'SIGN_OUT' });
      }
    },

    // Actualizar datos del usuario
    updateUser: (userData) => {
      dispatch({ type: 'UPDATE_USER', userData });
    },

    // Obtener perfil actualizado
    refreshProfile: async () => {
      try {
        if (!state.user?.idUsuarios) {
          return null;
        }

        const response = await ApiService.getProfile(state.user.idUsuarios);
        
        if (response.success && response.data.user) {
          const updatedUser = response.data.user;
          
          // Actualizar AsyncStorage con los nuevos datos
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          
          // Actualizar el estado
          dispatch({ type: 'UPDATE_USER', userData: updatedUser });
          return updatedUser;
        }
        
        return null;
      } catch (error) {
        console.error('Error refreshing profile:', error);
        return null;
      }
    },

    // Obtener estadísticas del usuario
    getUserStatistics: async () => {
      try {
        const response = await ApiService.getUserStatistics();
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al obtener estadísticas' 
        };
      }
    },

    // Obtener ubicaciones de recolección
    getCollectionLocations: async () => {
      try {
        const response = await ApiService.getCollectionLocations();
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al obtener ubicaciones' 
        };
      }
    },

    // Obtener carrito del usuario
    getCart: async () => {
      try {
        const response = await ApiService.getCart();
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al obtener carrito' 
        };
      }
    },

    // Agregar item al carrito
    addToCart: async (itemData) => {
      try {
        const response = await ApiService.addToCart(itemData);
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al agregar al carrito' 
        };
      }
    },

    // Remover item del carrito
    removeFromCart: async (itemId) => {
      try {
        const response = await ApiService.removeFromCart(itemId);
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al remover del carrito' 
        };
      }
    },

    // Limpiar carrito
    clearCart: async () => {
      try {
        const response = await ApiService.clearCart();
        return response;
      } catch (error) {
        return { 
          success: false, 
          message: error.message || 'Error al limpiar carrito' 
        };
      }
    },

    // Estado actual
    ...state,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;