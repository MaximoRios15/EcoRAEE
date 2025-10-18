import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function MultipleDeviceReceptionScreen({ navigation }) {
  // Datos simulados para el usuario
  const user = {
    idUsuarios: 1,
    Nombres_Usuarios: 'Juan',
    Apellidos_Usuarios: 'Pérez',
    ImagenPerfil_Usuarios: null,
    Puntos_Usuarios: 250
  };
  
  // Logout provisto por AuthContext
  const { signOut } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Cargar preferencia de tema
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  // Guardar preferencia de tema
  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  // Colores dinámicos del tema
  const themeColors = {
    background: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    surface: isDarkMode ? '#2C2C3E' : '#F8F9FA',
    primary: isDarkMode ? '#4CAF50' : '#2E7D32',
    text: isDarkMode ? '#FFFFFF' : '#212121',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(33, 33, 33, 0.7)',
    card: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    header: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    sidebar: isDarkMode ? '#16213E' : '#F8F9FA',
    overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  // Función para renderizar elementos del sidebar
  const renderSidebarItem = (title, iconName, color, onPress) => (
    <TouchableOpacity style={[styles.sidebarItem, { borderColor: themeColors.border }]} onPress={onPress}>
      <View style={[styles.sidebarItemIcon, { backgroundColor: (color || themeColors.primary) + '20' }]}>
        <Ionicons name={iconName} size={24} color={color || themeColors.primary} />
      </View>
      <View style={styles.sidebarItemContent}>
        <Text style={[styles.sidebarItemTitle, { color: themeColors.text }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  // Función para manejar acciones del sidebar
  const handleActionPress = (action) => {
    switch (action) {
      case 'home':
        navigation.navigate('ReceptionHomeScreen');
        break;
      case 'profile':
        navigation.navigate('ProfileReceptionScreen');
        break;
      case 'selection':
        navigation.navigate('DeviceUploadSelectionScreen');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Sidebar */}
      {sidebarVisible && (
        <View style={styles.sidebar}>
          <LinearGradient
            colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.sidebarGradient}
          >
            {/* Welcome Section in Sidebar */}
            <View style={styles.sidebarWelcome}>
              <View style={styles.sidebarAvatarContainer}>
                {user?.ImagenPerfil_Usuarios ? (
                  <Image 
                    source={{ uri: user.ImagenPerfil_Usuarios }} 
                    style={styles.sidebarAvatarImage}
                  />
                ) : (
                  <Text style={styles.sidebarAvatarText}>
                    {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                  </Text>
                )}
              </View>
              <Text style={[styles.sidebarWelcomeTitle, { color: themeColors.text }]}>¡Bienvenido a EcoRAEE!</Text>
              <Text style={[styles.sidebarUserName, { color: themeColors.text }]}>{user?.Nombres_Usuarios} {user?.Apellidos_Usuarios}</Text>
              <Text style={[styles.sidebarUserType, { color: themeColors.textSecondary }]}>
                Recepción EcoRAEE
              </Text>
              <Text style={[styles.sidebarPointsText, { color: themeColors.text }]}>
                Puntos: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{user?.Puntos_Usuarios || 0}</Text>
              </Text>
            </View>

            {/* Menú de navegación */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Inicio', 'home-outline', '#4CAF50', () => {
                setSidebarVisible(false);
                handleActionPress('home');
              })}
              {renderSidebarItem('Selección de Carga', 'options-outline', '#FF9800', () => {
                setSidebarVisible(false);
                handleActionPress('selection');
              })}
              {renderSidebarItem('Mi Perfil', 'person-outline', '#2196F3', () => {
                setSidebarVisible(false);
                handleActionPress('profile');
              })}
              {renderSidebarItem(
                isDarkMode ? 'Modo Claro' : 'Modo Oscuro', 
                isDarkMode ? 'sunny-outline' : 'moon-outline', 
                '#9C27B0',
                () => {
                  toggleTheme();
                }
              )}
              {renderSidebarItem('Cerrar Sesión', 'log-out-outline', '#F44336', handleLogout)}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Overlay para cerrar sidebar */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: themeColors.overlay }]} 
          onPress={() => setSidebarVisible(false)}
          activeOpacity={1}
        />
      )}

      {/* Modern Header */}
      <View style={[styles.modernHeader, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={[styles.sidebarToggle, { backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF' }]} 
            onPress={() => setSidebarVisible(!sidebarVisible)}
          >
            <Text style={[styles.sidebarToggleIcon, { color: themeColors.text }]}>☰</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../img/logo-EcoRAEE.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Carga Múltiple</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: themeColors.primary }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
            Funcionalidad de carga múltiple - Próximamente disponible
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Contenido principal */}
        <View style={styles.placeholderContainer}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.placeholderIcon}
          >
            <Ionicons name="construct-outline" size={60} color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={[styles.placeholderTitle, { color: themeColors.text }]}>
            Carga Múltiple de Dispositivos
          </Text>
          
          <Text style={[styles.placeholderSubtitle, { color: themeColors.textSecondary }]}>
            Esta funcionalidad está en desarrollo y estará disponible próximamente.
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={[styles.featuresTitle, { color: themeColors.text }]}>
              Características que incluirá:
            </Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
                Registro masivo de dispositivos
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
                Importación desde archivos CSV/Excel
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
                Validación automática de datos
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
                Cálculo automático de puntos
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.backToSelectionButton, { backgroundColor: themeColors.primary }]}
            onPress={() => navigation.navigate('DeviceUploadSelectionScreen')}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backToSelectionText}>Volver a Selección</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.75,
    zIndex: 1000,
  },
  sidebarGradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  sidebarWelcome: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sidebarAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sidebarAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sidebarWelcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sidebarUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.9,
    textAlign: 'center',
  },
  sidebarUserType: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.8,
  },
  sidebarPointsText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sidebarPointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sidebarMenu: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  sidebarItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sidebarItemContent: {
    flex: 1,
  },
  sidebarItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sidebarToggle: {
    backgroundColor: '#2C2C3E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarToggleIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  modernHeader: {
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoImage: {
    width: 35,
    height: 35,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 18,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  backToSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    gap: 10,
  },
  backToSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});