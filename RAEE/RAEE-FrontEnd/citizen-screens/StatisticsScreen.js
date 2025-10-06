import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [statistics, setStatistics] = useState({
    totalDonations: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    currentPoints: 0,
    categoriesDonated: [],
    monthlyStats: [],
  });

  useEffect(() => {
    loadStatistics();
    loadThemePreference();
  }, []);

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

  // Función para renderizar elementos del sidebar
  const renderSidebarItem = (title, icon, onPress) => (
    <TouchableOpacity style={[styles.sidebarItem, { backgroundColor: themeColors.card }]} onPress={onPress}>
      <Text style={styles.sidebarIcon}>{icon}</Text>
      <Text style={[styles.sidebarText, { color: themeColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  // Función para manejar acciones del sidebar
  const handleActionPress = (action) => {
    switch (action) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'donation':
        navigation.navigate('Donation');
        break;
      case 'exchange':
        navigation.navigate('ExchangeShop');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
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

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Obtener datos reales del usuario
      const userId = user?.idUsuarios;
      if (!userId) {
        Alert.alert('Error', 'Usuario no identificado');
        return;
      }

      // Obtener equipos del usuario desde la tabla equipos
      const equiposResponse = await ApiService.getUserEquipos(userId);
      
      let totalDonations = 0;
      let totalPointsEarned = 0;
      let categoriesData = {};
      let monthlyData = {};

      if (equiposResponse.success && equiposResponse.data) {
        const equipos = equiposResponse.data;
        totalDonations = equipos.length;

        // Procesar cada equipo
        equipos.forEach(equipo => {
          // Usar puntos reales desde historial_puntos (convertir a número)
          const realPoints = parseInt(equipo.Puntos_Equipos) || 0;
          totalPointsEarned += realPoints;
          
          // Crear objeto de equipo con información completa desde tabla equipos
          const equipment = {
            id: equipo.idEquipos,
            title: equipo.Descripcion_Equipos || `${equipo.Marca_Equipos} ${equipo.Modelo_Equipos}` || 'Equipo sin nombre',
            brand: equipo.Marca_Equipos || 'Sin marca',
            model: equipo.Modelo_Equipos || 'Sin modelo',
            quantity: equipo.Cantidad_Equipos || 1,
            weight: equipo.PesoKG_Equipos || 0,
            dimensions: equipo.DimencionesCM_Equipos || 'No especificado',
            accessories: equipo.Accesorios_Equipos || 'Sin accesorios',
            points: realPoints,
            FechaIngreso_Equipos: equipo.FechaIngreso_Equipos,
            categoryId: equipo.idCategorias_Equipos,
            categoryName: equipo.Nombres_Categorias || 'Sin categoría',
            estadoId: equipo.idEstados_Equipos,
            estadoName: equipo.Nombres_Estados || 'Sin estado',
            fechaMovimientoPuntos: equipo.FechaMovimiento_Puntos
          };

          // Agrupar equipos por categoría
          const categoryName = equipo.Nombres_Categorias || 'Sin categoría';
          if (!categoriesData[categoryName]) {
            categoriesData[categoryName] = [];
          }
          categoriesData[categoryName].push(equipment);

          // Agrupar por mes (formato: YYYY-MM)
          const date = new Date(equipo.FechaIngreso_Equipos);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].donations += 1;
            monthlyData[monthKey].points += realPoints;
          } else {
            monthlyData[monthKey] = {
              month: monthName,
              donations: 1,
              points: realPoints
            };
          }
        });
      }

      // Convertir objetos a arrays y ordenar
      const categoriesDonated = Object.keys(categoriesData).map(categoryName => ({
        name: categoryName,
        equipments: categoriesData[categoryName].sort((a, b) => 
          new Date(b.FechaIngreso_Equipos) - 
          new Date(a.FechaIngreso_Equipos)
        )
      })).sort((a, b) => b.equipments.length - a.equipments.length);

      const monthlyStats = Object.values(monthlyData)
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .slice(-4); // Últimos 4 meses
      
      const realStats = {
        totalDonations,
        totalPointsEarned: 0, // Fijo en 0 por el momento
        totalPointsRedeemed: 0, // Fijo en 0 por el momento
        currentPoints: user?.Puntos_Usuarios || 0,
        categoriesDonated,
        monthlyStats
      };
      
      setStatistics(realStats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
      
      // En caso de error, mostrar datos básicos
      setStatistics({
        totalDonations: 0,
        totalPointsEarned: user?.Puntos_Usuarios || 0,
        totalPointsRedeemed: 0,
        currentPoints: user?.Puntos_Usuarios || 0,
        categoriesDonated: [],
        monthlyStats: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatCard = (title, value, subtitle, icon, color = '#4CAF50') => (
    <LinearGradient
      colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statCardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.statCardTitle, { color: themeColors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={[styles.statCardSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>}
    </LinearGradient>
  );

  const renderEquipmentItem = (equipment, index) => (
    <View key={equipment.id || index} style={[styles.equipmentItem, { backgroundColor: themeColors.card }]}>
      <View style={styles.equipmentInfo}>
        <Text style={[styles.equipmentTitle, { color: themeColors.text }]}>{equipment.title}</Text>
        <Text style={[styles.equipmentBrand, { color: themeColors.textSecondary }]}>{equipment.brand} {equipment.model}</Text>
        <Text style={[styles.equipmentDetails, { color: themeColors.textSecondary }]}>
          {equipment.quantity} unidad(es) • {equipment.weight} kg
        </Text>
        <Text style={[styles.equipmentDate, { color: themeColors.textSecondary }]}>
          {new Date(equipment.FechaIngreso_Equipos).toLocaleDateString('es-ES')}
        </Text>
      </View>
      <Text style={[styles.equipmentPoints, { color: themeColors.primary }]}>+{equipment.points} pts</Text>
    </View>
  );

  const renderCategorySection = (categoryName, equipments) => (
    <View key={categoryName} style={styles.categorySection}>
      <Text style={[styles.categorySectionTitle, { color: themeColors.text }]}>{categoryName}</Text>
      {equipments.map(renderEquipmentItem)}
    </View>
  );

  const renderMonthlyItem = (month, index) => (
    <View key={index} style={[styles.monthlyItem, { borderBottomColor: themeColors.border }]}>
      <Text style={[styles.monthName, { color: themeColors.text }]}>{month.month}</Text>
      <View style={styles.monthlyStats}>
        <Text style={[styles.monthlyDonations, { color: themeColors.textSecondary }]}>{month.donations} donaciones</Text>
        <Text style={[styles.monthlyPoints, { color: themeColors.primary }]}>{month.points} puntos</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>Cargando estadísticas...</Text>
        </View>
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
              <Text style={[styles.sidebarUserType, { color: themeColors.textSecondary }]}>Ciudadano EcoRAEE</Text>
              <Text style={[styles.sidebarPointsText, { color: themeColors.text }]}>
                Puntos: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{user?.Puntos_Usuarios || 0}</Text>
              </Text>
            </View>

            {/* Menú de navegación */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Inicio', '🏠', () => {
                setSidebarVisible(false);
                handleActionPress('home');
              })}
              {renderSidebarItem('Mi Perfil', '👤', () => {
                setSidebarVisible(false);
                handleActionPress('profile');
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
            <Text style={[styles.appName, { color: themeColors.text }]}>Mis Estadísticas</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadStatistics}>
              <Ionicons name="refresh" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
            Tu impacto ambiental y progreso
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen general */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Resumen General</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Donaciones\nTotales',
              statistics.totalDonations,
              'equipos donados',
              'gift',
              '#4CAF50'
            )}
            {renderStatCard(
              'Puntos Ganados',
              0,
              'puntos acumulados',
              'star',
              '#FF9800'
            )}
            {renderStatCard(
              'Puntos Canjeados',
              0,
              'puntos utilizados',
              'card',
              '#2196F3'
            )}
            {renderStatCard(
              'Puntos Actuales',
              statistics.currentPoints,
              'puntos disponibles',
              'wallet',
              '#9C27B0'
            )}
          </View>
        </View>

        {/* Equipos donados por categorías */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Equipos Donados</Text>
          <LinearGradient
            colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.categoriesCard}
          >
            {statistics.categoriesDonated.length > 0 ? (
              statistics.categoriesDonated.map(category => 
                renderCategorySection(category.name, category.equipments)
              )
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No tienes equipos donados aún</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Estadísticas mensuales */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Progreso Mensual</Text>
          <LinearGradient
            colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.monthlyCard}
          >
            {statistics.monthlyStats.length > 0 ? (
              statistics.monthlyStats.map(renderMonthlyItem)
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No hay datos mensuales disponibles</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  // Sidebar styles
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
    paddingTop: 70,
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
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sidebarIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  sidebarText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
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
  // Modern Header styles
  modernHeader: {
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    width: 32,
    height: 32,
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  refreshButton: {
    padding: 5,
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: (screenWidth - 60) / 2,
    borderLeftWidth: 4,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
  },
  categoriesCard: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  equipmentBrand: {
    fontSize: 14,
    marginBottom: 2,
  },
  equipmentDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  equipmentDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  equipmentPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  monthlyCard: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthlyStats: {
    alignItems: 'flex-end',
  },
  monthlyDonations: {
    fontSize: 14,
  },
  monthlyPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});