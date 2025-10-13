import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function AdminHomeScreen({ navigation }) {
  // Datos simulados del usuario administrador
  const user = {
    idUsuarios: 1,
    Nombres_Usuarios: 'Admin',
    Apellidos_Usuarios: 'EcoRAEE',
    Correo_Usuarios: 'admin@ecoraee.com',
    Roles_Usuarios: '1'
  };

  // SignOut real desde AuthContext
  const { signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalStates: 0,
    totalLocations: 0
  });

  useEffect(() => {
    loadThemePreference();
    loadStats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  // Cargar preferencia del tema desde AsyncStorage
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

  // Guardar preferencia del tema en AsyncStorage
  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle entre modo oscuro y claro
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  // Cargar estadísticas del sistema (datos mock para diseño)
  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Simular carga de datos para diseño UX/UI
      setTimeout(() => {
        setStats({
          totalUsers: 45,
          totalCategories: 8,
          totalStates: 5,
          totalLocations: 12
        });
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading stats:', error);
      setIsLoading(false);
    }
  };

  // Definir colores dinámicos según el tema
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
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('[LOGOUT] Error during logout:', error);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const handleActionPress = (action) => {
    switch (action) {
      case 'categories':
        navigation.navigate('CategoriesAdminScreen');
        break;
      case 'states':
        navigation.navigate('StatesAdminScreen');
        break;
      case 'users':
        navigation.navigate('UsersAdminScreen');
        break;
      case 'locations':
        navigation.navigate('LocationsAdminScreen');
        break;
      default:
        break;
    }
  };

  const renderStatsCard = (title, value, icon, color) => (
    <TouchableOpacity
      style={styles.statsCard}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
        style={styles.statsCardGradient}
      >
        <View style={styles.statsCardContent}>
          <View style={styles.statsCardTextContainer}>
            <Text style={[styles.statsCardValue, { color }]}>{value}</Text>
            <Text style={[styles.statsCardTitle, { color: themeColors.text }]}>{title}</Text>
          </View>
          <View style={styles.statsCardIcons}>
            <View style={[styles.statsIcon, { backgroundColor: color }]}>
              <Text style={styles.statsIconText}>{icon}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderActionCard = (title, subtitle, icon, onPress, isActive = false) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
        style={styles.actionCardGradient}
      >
        <View style={styles.actionCardContent}>
          <View style={styles.actionCardTextContainer}>
            <Text style={[styles.actionCardTitle, { color: themeColors.text }]}>{title}</Text>
            <Text style={[styles.actionCardSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
          </View>
          <View style={styles.actionCardIcons}>
            <View style={[styles.actionIcon, isActive && styles.actionIconActive]}>
              <Text style={styles.actionIconText}>{icon}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSidebarItem = (title, icon, onPress) => (
    <TouchableOpacity style={[styles.sidebarItem, { backgroundColor: themeColors.card }]} onPress={onPress}>
      <Text style={styles.sidebarIcon}>{icon}</Text>
      <Text style={[styles.sidebarText, { color: themeColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

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
                <Text style={styles.sidebarAvatarText}>
                  {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                </Text>
              </View>
              <Text style={[styles.sidebarWelcomeTitle, { color: themeColors.text }]}>Panel de Administración</Text>
              <Text style={[styles.sidebarUserName, { color: themeColors.text }]}>{user?.Nombres_Usuarios} {user?.Apellidos_Usuarios}</Text>
              <Text style={[styles.sidebarUserType, { color: themeColors.textSecondary }]}>Administrador EcoRAEE</Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Home', '🏠', () => {
                setSidebarVisible(false);
                navigation.navigate('AdminHomeScreen');
              })}
              {renderSidebarItem('Gestion Categorías', '📋', () => {
                setSidebarVisible(false);
                navigation.navigate('CategoriesAdminScreen');
              })}
              {renderSidebarItem('Gestion Estados', '📍', () => {
                setSidebarVisible(false);
                navigation.navigate('StatesAdminScreen');
              })}
              {renderSidebarItem('Gestion Usuarios', '👥', () => {
                setSidebarVisible(false);
                navigation.navigate('UsersAdminScreen');
              })}
              {renderSidebarItem('Gestion Ubicaciones', '🗺️', () => {
                setSidebarVisible(false);
                navigation.navigate('LocationsAdminScreen');
              })}
              {renderSidebarItem(
                isDarkMode ? 'Modo Claro' : 'Modo Oscuro', 
                isDarkMode ? '☀️' : '🌙', 
                () => {
                  toggleTheme();
                }
              )}
              {renderSidebarItem('Cerrar Sesión', '🚪', handleLogout)}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Overlay */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: themeColors.overlay }]} 
          onPress={() => setSidebarVisible(false)}
          activeOpacity={1}
        />
      )}

      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerContent}>
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
            <Text style={[styles.appName, { color: themeColors.text }]}>EcoRAEE</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, { color: themeColors.text }]}>Estadísticas del Sistema</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard('Usuarios', stats.totalUsers, '👥', '#4CAF50')}
            {renderStatsCard('Categorías', stats.totalCategories, '📁', '#2196F3')}
            {renderStatsCard('Estados', stats.totalStates, '⚡', '#FF9800')}
            {renderStatsCard('Ubicaciones', stats.totalLocations, '📍', '#9C27B0')}
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          {renderActionCard(
            'Gestión de Categorías',
            'Administra las categorías de equipos',
            '📁',
            () => handleActionPress('categories'),
            true
          )}
          
          {renderActionCard(
            'Gestión de Estados',
            'Administra los estados de equipos',
            '⚡',
            () => handleActionPress('states'),
            true
          )}

          {renderActionCard(
            'Gestión de Usuarios',
            'Administra los usuarios del sistema',
            '👥',
            () => handleActionPress('users'),
            true
          )}

          {renderActionCard(
            'Gestión de Ubicaciones',
            'Administra las ubicaciones de recolección',
            '📍',
            () => handleActionPress('locations'),
            true
          )}
        </View>

        {/* Info Card */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.infoCard}
        >
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>Panel de Administración</Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Desde aquí puedes gestionar todos los aspectos del sistema EcoRAEE: usuarios, categorías, estados de equipos y ubicaciones de recolección.
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  // Header styles
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  // Sidebar styles
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth * 0.75,
    height: '100%',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarGradient: {
    flex: 1,
    paddingTop: 70,
  },
  sidebarWelcome: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  sidebarAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarWelcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  sidebarUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  sidebarUserType: {
    fontSize: 14,
    textAlign: 'center',
  },
  sidebarMenu: {
    paddingTop: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  sidebarIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  sidebarText: {
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  // Statistics styles
  statsSection: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (screenWidth - 50) / 2,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsCardGradient: {
    padding: 20,
  },
  statsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCardTextContainer: {
    flex: 1,
  },
  statsCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsCardIcons: {
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  // Action Cards styles
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionCardGradient: {
    padding: 20,
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionCardTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionCardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionCardIcons: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  actionIconText: {
    fontSize: 24,
  },
  // Info Card styles
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});