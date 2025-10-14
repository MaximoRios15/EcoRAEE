import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  // Usuario y acciones reales desde AuthContext
  const { user, signOut, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsLoaded, setPointsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // true = modo oscuro (actual), false = modo claro
  
  // Animation refs for infinite carousel
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const animationRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const currentScrollPosition = useRef(0);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    // Log screen load
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[SCREEN] EL USUARIO ENTRO A LA PANTALLA HOME - ${time} ${date}`);
    
    // Cargar perfil del usuario al entrar (real)
    loadUserProfile();
    // Cargar puntos solo una vez al entrar
    loadUserPoints();
    // Cargar ubicaciones de ecopuntos
    loadLocations();
    // Cargar preferencia del tema
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
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    header: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    sidebar: isDarkMode ? '#16213E' : '#F8F9FA',
    overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
  };

  // Cargar imagen de perfil cuando el usuario esté disponible y el perfil esté cargado
  useEffect(() => {
    if (user && (user.ImagenPerfil_Usuarios || user.imagenPerfil_Usuarios) && !imageLoaded) {
      loadProfileImage();
    }
  }, [user?.idUsuarios]); // Solo reaccionar cuando cambie el usuario

  // Recargar imagen cuando se enfoque la pantalla (desde ProfileScreen)
  // Comentado temporalmente para debug del logout
  /*
  useFocusEffect(
    React.useCallback(() => {
      if (user && user.idUsuarios) {
        // Siempre actualizar perfil y recargar imagen cuando se enfoque la pantalla
        refreshProfile().then(() => {
          // Reset del estado para forzar recarga
          setImageLoaded(false);
          // Recargar imagen
          loadProfileImage();
        });
      }
    }, [user])
  );
  */

  const loadProfileImage = async () => {
    // Evitar llamadas duplicadas
    if (imageLoaded) {
      return;
    }
    
    // Verificar que el usuario tenga imagen de perfil
    const filename = user?.ImagenPerfil_Usuarios || user?.imagenPerfil_Usuarios;
    if (!filename) {
      setProfileImage(null);
      setImageLoaded(true);
      return;
    }
    
    try {
      // Verificar si hay imagen personalizada del usuario actual
      const savedImage = await AsyncStorage.getItem('profileImage');
      const savedUserId = await AsyncStorage.getItem('profileImageUserId');
      
      // Solo usar imagen personalizada si es del usuario actual
      if (savedImage && savedUserId && savedUserId === user?.idUsuarios?.toString()) {
        const imageData = JSON.parse(savedImage);
        setProfileImage(imageData);
        setImageLoaded(true);
        return;
      }

      // Cargar imagen de la base de datos
      const imageMap = {
        'perfil1animal.png': require('../img/profile/perfil1animal.png'),
        'perfil1flores.png': require('../img/profile/perfil1flores.png'),
        'perfil2animal.png': require('../img/profile/perfil2animal.png'),
        'perfil2flores.png': require('../img/profile/perfil2flores.png'),
        'perfil3animal.png': require('../img/profile/perfil3animal.png'),
        'perfil3flores.png': require('../img/profile/perfil3flores.png'),
        'perfil4animal.png': require('../img/profile/perfil4animal.png'),
        'perfil4flores.png': require('../img/profile/perfil4flores.png'),
        'perfil5animal.png': require('../img/profile/perfil5animal.png'),
        'perfil5flores.png': require('../img/profile/perfil5flores.png')
      };
      const normalized = typeof filename === 'string' 
        ? filename.replace(/^\/?(?:img\/)?profile\//i, '') 
        : filename;
      const imageSource = imageMap[normalized];
      if (imageSource) {
        setProfileImage(imageSource);
      } else if (typeof filename === 'string' && (filename.startsWith('http://') || filename.startsWith('https://'))) {
        setProfileImage({ uri: filename });
      } else {
        setProfileImage({ uri: ApiService.getImageUrl(normalized) });
      }
      setImageLoaded(true);
    } catch (error) {
      console.error('Error loading profile image:', error);
      setProfileImage(null);
      setImageLoaded(true);
    }
  };

  const loadUserPoints = async () => {
    try {
      if (!user || !user.idUsuarios) {
        setUserPoints(0);
        setPointsLoaded(true);
        return;
      }

      // Cargar puntos desde los datos del usuario disponibles
      setUserPoints(user.Puntos_Usuarios || 0);
      setPointsLoaded(true);
      console.log(`[POINTS] Puntos cargados: ${user.Puntos_Usuarios}`);
    } catch (error) {
      console.error('Error loading user points:', error);
      setUserPoints(0);
      setPointsLoaded(true);
    }
  };

  const loadLocations = async () => {
    try {
      setLocationsLoading(true);
      const result = await ApiService.getEcopoints();
      const ecopoints = Array.isArray(result?.ecopoints) ? result.ecopoints : [];

      // Mapear datos del backend a la estructura usada por el carrusel
      const mapped = ecopoints.map((row) => ({
        idUbicaciones: row.idPuntoEntrega,
        Direccion_Ubicaciones: `${row.Calle_Direcciones || ''} ${row.Numero_Direcciones || ''}`.trim(),
        NroCalle_Ubicaciones: row.Numero_Direcciones || '',
        Municipios_Ubicaciones: row.Municipio || '',
        Provincia_Ubicaciones: 'Misiones',
        Estado_Ubicaciones: '1',
      }));

      setLocations(mapped);

      if (mapped.length > 0) {
        startInfiniteCarousel();
      }
    } catch (error) {
      console.error('[LOCATIONS] Error loading locations:', error);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  // Sistema de carrusel continuo con pausa manual
  const startInfiniteCarousel = () => {
    // Limpiar intervalo anterior si existe
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }

    // Solo iniciar si todas las condiciones se cumplen
    if (!isUserInteracting && !isUserScrolling.current && !isCarouselPaused && locations.length > 0) {
      const cardWidth = screenWidth * 0.8 + 16; // Ancho de tarjeta + margen
      const totalWidth = cardWidth * locations.length;
      
      autoScrollInterval.current = setInterval(() => {
        // Verificar condiciones en cada frame
        if (!isUserInteracting && !isUserScrolling.current && !isCarouselPaused && scrollViewRef.current) {
          currentScrollPosition.current += 2; // Movimiento suave de 2px por frame
          
          // Si llega al final, reiniciar desde el principio
          if (currentScrollPosition.current >= totalWidth * 2) { // x2 porque tenemos 3 copias
            currentScrollPosition.current = 0;
          }
          
          scrollViewRef.current.scrollTo({
            x: currentScrollPosition.current,
            animated: false, // Sin animación para movimiento continuo
          });
        } else {
          // Si las condiciones cambian, limpiar el intervalo
          if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = null;
          }
        }
      }, 25); // Cada 25ms para movimiento fluido
    }
  };

  const handleScrollBeginDrag = () => {
    setIsUserInteracting(true);
    isUserScrolling.current = true;
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const handleScrollEndDrag = () => {
    // Reanudar inmediatamente cuando deja de tocar
    setIsUserInteracting(false);
    // Usar setTimeout para dar tiempo a que se actualice la posición del scroll
    setTimeout(() => {
      isUserScrolling.current = false;
      // Forzar reanudación de la animación
      if (locations.length > 0 && !isCarouselPaused) {
        startInfiniteCarousel();
      }
    }, 200);
  };

  const handleScroll = (event) => {
    // Actualizar la posición actual del scroll cuando el usuario está interactuando
    if (isUserScrolling.current) {
      currentScrollPosition.current = event.nativeEvent.contentOffset.x;
    }
  };

  const pauseCarousel = () => {
    setIsCarouselPaused(true);
    setIsUserInteracting(true);
    isUserScrolling.current = true;
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const resumeCarousel = () => {
    setIsCarouselPaused(false);
    setIsUserInteracting(false);
    isUserScrolling.current = false;
    if (locations.length > 0) {
      // Pequeño delay para asegurar que los estados se actualicen
      setTimeout(() => {
        startInfiniteCarousel();
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Solo iniciar si no hay interacción del usuario y hay ubicaciones
    if (locations.length > 0 && !isCarouselPaused && !isUserInteracting) {
      // Pequeño delay para asegurar que no hay scroll activo
      const timer = setTimeout(() => {
        if (!isUserScrolling.current) {
          startInfiniteCarousel();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [locations, isCarouselPaused, isUserInteracting]);

  const loadUserProfile = async () => {
    // Log profile load start
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[FUNCTION] EL USUARIO INICIO LA CARGA DEL PERFIL - ${time} ${date}`);
    
    setIsLoading(true);
    try {
      // Actualiza el perfil real desde el backend
      await refreshProfile();
      console.log(`[FUNCTION] EL USUARIO COMPLETO LA CARGA DEL PERFIL - ${time} ${date}`);
      
      // Reset del estado de imagen para permitir recarga
      setImageLoaded(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      console.log(`[ERROR] ERROR AL CARGAR EL PERFIL DEL USUARIO - ${time} ${date}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Log button press
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[BUTTON] EL USUARIO APRETO EL BOTON CERRAR SESION - ${time} ${date}`);
    
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[ALERT] EL USUARIO CANCELO EL CERRAR SESION - ${time} ${date}`);
          }
        },
        { 
          text: 'Cerrar Sesión', 
          onPress: async () => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[ALERT] EL USUARIO CONFIRMO EL CERRAR SESION - ${time} ${date}`);
            
            try {
              console.log('[LOGOUT] Iniciando proceso de logout...');
              await signOut();
              console.log('[LOGOUT] Proceso de logout completado');
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
    // Log button press
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    
    switch (action) {
      case 'scanqr':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON ESCANEAR QR - ${time} ${date}`);
        navigation.navigate('ScanQRCitizenScreen');
        break;
      case 'donations':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON MIS DONACIONES - ${time} ${date}`);
        Alert.alert('Próximamente', 'Esta función estará disponible pronto', [
          {
            text: 'OK',
            onPress: () => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[ALERT] EL USUARIO CERRÓ LA ALERTA MIS DONACIONES - ${time} ${date}`);
            }
          }
        ]);
        break;
      case 'deliveries':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON TIENDA DE CANJES - ${time} ${date}`);
        navigation.navigate('ExchangeShopCitizenScreen');
        break;
      case 'points':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON PUNTOS - ${time} ${date}`);
        Alert.alert('Próximamente', 'Esta función estará disponible pronto', [
          {
            text: 'OK',
            onPress: () => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[ALERT] EL USUARIO CERRÓ LA ALERTA PUNTOS - ${time} ${date}`);
            }
          }
        ]);
        break;
      case 'profile':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON MI PERFIL - ${time} ${date}`);
        navigation.navigate('ProfileCitizenScreen');
        break;
      case 'stats':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON VER ESTADISTICAS - ${time} ${date}`);
        navigation.navigate('StatisticsCitizenScreen');
        break;
      default:
        break;
    }
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const renderLocationCard = (location, index) => (
    <TouchableOpacity
      key={`${location.idUbicaciones}-${index}`}
      style={styles.locationCard}
      onPressIn={pauseCarousel}
      onPressOut={resumeCarousel}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.locationCardGradient}
      >
        <View style={styles.locationCardContent}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationAddress, { color: '#FFFFFF' }]} numberOfLines={2}>
              {location.Direccion_Ubicaciones}
            </Text>
            {location.NroCalle_Ubicaciones && (
              <Text style={[styles.locationNumber, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                N° {location.NroCalle_Ubicaciones}
              </Text>
            )}
            <Text style={[styles.locationCity, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {location.Municipios_Ubicaciones}, {location.Provincia_Ubicaciones}
            </Text>
          </View>
          <View style={styles.locationStatus}>
            <View style={styles.statusIndicator} />
            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Activo</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderActionCard = (title, subtitle, icon, onPress, isActive = false, color = null) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient
        colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#F8F9FA', '#E9ECEF']}
        style={styles.actionCardGradient}
      >
        <View style={styles.actionCardContent}>
          <View style={styles.actionCardTextContainer}>
            <Text style={[styles.actionCardTitle, { color: themeColors.text }]}>{title}</Text>
            <Text style={[styles.actionCardSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
          </View>
          <View style={styles.actionCardIcons}>
            {typeof icon === 'string' && icon.endsWith('-outline') ? (
              <View style={[
                styles.actionIcon,
                { backgroundColor: (color || themeColors.primary) + '20' }
              ]}>
                <Ionicons name={icon} size={22} color={color || themeColors.primary} />
              </View>
            ) : (
              <View style={[styles.actionIcon, isActive && styles.actionIconActive]}>
                <Text style={styles.actionIconText}>{icon}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
                {profileImage ? (
                  <Image source={profileImage} style={styles.sidebarAvatarImage} />
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
                Puntos: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{userPoints}</Text>
              </Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Escanear QR', 'qr-code-outline', '#4CAF50', () => {
                setSidebarVisible(false);
                handleActionPress('scanqr');
              })}
              {renderSidebarItem('Tienda de Canjes', 'cart-outline', '#FF9800', () => {
                setSidebarVisible(false);
                handleActionPress('deliveries');
              })}
              {renderSidebarItem('Ver Estadísticas', 'stats-chart-outline', undefined, () => {
                setSidebarVisible(false);
                handleActionPress('stats');
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
        {/* Locations Carousel */}
        <View style={styles.carouselSection}>
          <Text style={[styles.carouselTitle, { color: themeColors.text }]}>Ecopuntos Disponibles</Text>
          {locationsLoading ? (
            <View style={styles.carouselLoading}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={[styles.carouselLoadingText, { color: themeColors.text }]}>Cargando ubicaciones...</Text>
            </View>
          ) : locations.length > 0 ? (
            <View style={styles.carouselContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                style={styles.carouselScrollView}
                contentContainerStyle={styles.carouselContent}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onScroll={handleScroll}
                decelerationRate="fast"
                snapToInterval={screenWidth * 0.8 + 16}
                snapToAlignment="start"
                scrollEventThrottle={16}
              >
                {/* Renderizar múltiples copias para efecto infinito */}
                {[...locations, ...locations, ...locations].map((location, index) => 
                  renderLocationCard(location, index)
                )}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.carouselEmpty}>
              <Text style={[styles.carouselEmptyText, { color: themeColors.text }]}>No hay ecopuntos disponibles</Text>
            </View>
          )}
        </View>

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          {renderActionCard(
            'Escanear QR',
            'Escanea códigos QR de dispositivos',
            'qr-code-outline',
            () => handleActionPress('scanqr'),
            true,
            '#4CAF50'
          )}
          {renderActionCard(
            'Tienda de Canjes',
            'Intercambia tus puntos por recompensas',
            'cart-outline',
            () => handleActionPress('deliveries'),
            true,
            '#FF9800'
          )}
        </View>

        {/* Info Card */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.infoCard}
        >
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>Sobre EcoRAEE</Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            EcoRAEE conecta ciudadanos con técnicos especializados e instituciones educativas para promover el reciclaje responsable de residuos electrónicos y la economía circular.
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
    paddingHorizontal: 20,
  },
  carouselSection: {
    marginBottom: 25,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  carouselContainer: {
    height: 140,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    shadowColor: 'rgba(76, 175, 80, 0.15)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  carouselScrollView: {
    flex: 1,
  },
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: Dimensions.get('window').width,
  },
  carouselTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselLoading: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C3E',
    borderRadius: 16,
  },
  carouselLoadingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  carouselEmpty: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C3E',
    borderRadius: 16,
  },
  carouselEmptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  locationCard: {
    width: screenWidth * 0.8,
    height: 120,
    marginRight: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  locationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationNumber: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  locationStatus: {
    alignItems: 'center',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.9,
  },
  userType: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.8,
  },
  pointsText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  actionsSection: {
    marginBottom: 25,
  },
  actionCard: {
    marginBottom: 16,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  actionCardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIconActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  actionIconText: {
    fontSize: 18,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Sidebar styles
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
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
});