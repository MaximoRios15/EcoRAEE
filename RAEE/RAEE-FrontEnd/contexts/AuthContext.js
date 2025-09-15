import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';

// Estados de autenticación
const AuthContext = createContext();

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        user: action.user,
        isLoading: false,
        isSignout: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
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
  userToken: null,
  user: null,
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Efectos para cargar el token al iniciar la app
  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData;

      try {
        // TEMPORAL: Limpiar storage para debug
        // await AsyncStorage.clear();
        
        // Intentar obtener el token guardado
        userToken = await AsyncStorage.getItem('userToken');
        
        if (userToken) {
          // Si hay token, intentar obtener los datos del usuario
          try {
            const response = await ApiService.getProfile();
            if (response.success) {
              userData = response.user;
            } else {
              // Si el token no es válido, eliminarlo
              userToken = null;
              await AsyncStorage.removeItem('userToken');
            }
          } catch (error) {
            console.error('Error getting user profile:', error);
            // Token inválido, eliminarlo
            userToken = null;
            await AsyncStorage.removeItem('userToken');
          }
        }
      } catch (e) {
        console.error('Error restoring token:', e);
      }

      // Restaurar el estado de autenticación
      dispatch({ 
        type: 'RESTORE_TOKEN', 
        token: userToken,
        user: userData 
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
        
        if (response.success) {
          // Obtener datos del usuario después del login
          const profileResponse = await ApiService.getProfile();
          
          dispatch({
            type: 'SIGN_IN',
            token: response.token,
            user: profileResponse.success ? profileResponse.user : null,
          });
          
          return { success: true, message: response.message };
        } else {
          dispatch({ type: 'SET_LOADING', isLoading: false });
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
        await ApiService.logout();
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
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await ApiService.getProfile();
        if (response.success) {
          dispatch({ type: 'UPDATE_USER', userData: response.user });
          return response.user;
        } else {
          throw new Error(response.message || 'Error al cargar perfil');
        }
      } catch (error) {
        console.error('Error refreshing profile:', error);
        throw error;
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