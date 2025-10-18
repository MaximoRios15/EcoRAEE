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
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editName, setEditName] = useState({ nombre: '', apellido: '' });
  const [lastImageChange, setLastImageChange] = useState(null);
  const [isImageChangeBlocked, setIsImageChangeBlocked] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userPublicationsCount, setUserPublicationsCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isLoadingImageRef = useRef(false);
  const loadedImageRef = useRef(false);
  const { user, signOut, refreshProfile } = useAuth();

  // User data from AuthContext

  // Cargar preferencia del tema desde AsyncStorage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme) {
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

  // Etiqueta de rol dinámica según datos del usuario
  const getRoleLabel = (userObj) => {
    try {
      // Si viene texto explícito desde backend
      const type = userObj?.TipoUsuario_Usuarios;
      if (typeof type === 'string' && type.trim()) {
        return type.trim();
      }

      // Si viene ID numérico, mapear a texto
      const roleId = userObj?.Roles_Usuarios;
      if (roleId === 1 || roleId === '1') return 'Ciudadano';
      if (roleId === 2 || roleId === '2') return 'Recepcionista';
      if (roleId === 3 || roleId === '3') return 'Administrador';

      // Fallback
      return 'Usuario';
    } catch (error) {
      return 'Usuario';
    }
  };

  // Imágenes disponibles en la carpeta img
  const availableImages = [
    { id: 1, name: 'perfil1animal.png', source: require('../img/profile/perfil1animal.png') },
    { id: 2, name: 'perfil1flores.png', source: require('../img/profile/perfil1flores.png') },
    { id: 3, name: 'perfil2animal.png', source: require('../img/profile/perfil2animal.png') },
    { id: 4, name: 'perfil2flores.png', source: require('../img/profile/perfil2flores.png') },
    { id: 5, name: 'perfil3animal.png', source: require('../img/profile/perfil3animal.png') },
    { id: 6, name: 'perfil3flores.png', source: require('../img/profile/perfil3flores.png') },
    { id: 7, name: 'perfil4animal.png', source: require('../img/profile/perfil4animal.png') },
    { id: 8, name: 'perfil4flores.png', source: require('../img/profile/perfil4flores.png') },
    { id: 9, name: 'perfil5animal.png', source: require('../img/profile/perfil5animal.png') },
    { id: 10, name: 'perfil5flores.png', source: require('../img/profile/perfil5flores.png') },
  ];

  useEffect(() => {
    // Cargar perfil del usuario al entrar
    // loadUserProfile(); // Removed backend call
    // Cargar estado del cooldown
    loadCooldownState();
    // Cargar puntos del usuario
    loadUserPoints();
    // Cargar contador de publicaciones
    loadUserPublicationsCount();
    // Cargar preferencia del tema
    loadThemePreference();
  }, []);

  // Cargar imagen de perfil cuando el usuario esté disponible
  useEffect(() => {
    if (user && user.idUsuarios && !isLoadingImageRef.current && !loadedImageRef.current) {
      // Limpiar cache si es un usuario diferente
      clearImageCacheIfDifferentUser();
      loadProfileImage();
      // Cargar puntos del usuario
      loadUserPoints();
      // Cargar contador de publicaciones
      loadUserPublicationsCount();
    }
  }, [user]);


  // Función para limpiar cache si es un usuario diferente
  const clearImageCacheIfDifferentUser = async () => {
    try {
      const savedUserId = await AsyncStorage.getItem('profileImageUserId');
      if (savedUserId && savedUserId !== user?.idUsuarios?.toString()) {
        await AsyncStorage.removeItem('profileImage');
        await AsyncStorage.removeItem('profileImageUserId');
        // Reset de los refs para permitir nueva carga
        isLoadingImageRef.current = false;
        loadedImageRef.current = false;
      }
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  };

  // Verificar cooldown cada segundo
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastImageChange]);

  // Verificación inmediata al montar el componente
  useEffect(() => {
    const immediateCheck = async () => {
      await checkCooldown();
    };
    immediateCheck();
  }, []);

  const loadProfileImage = async () => {
    // Evitar llamadas duplicadas
    if (isLoadingImageRef.current || loadedImageRef.current) return;
    
    isLoadingImageRef.current = true;
    try {
      // Verificar si hay imagen personalizada del usuario actual
      const savedImage = await AsyncStorage.getItem('profileImage');
      const savedUserId = await AsyncStorage.getItem('profileImageUserId');
      
      // Solo usar imagen personalizada si es del usuario actual
      if (savedImage && savedUserId && savedUserId === user?.idUsuarios?.toString()) {
        const imageData = JSON.parse(savedImage);
        setProfileImage(imageData);
        loadedImageRef.current = true;
        return;
      }

      // Si no hay imagen personalizada del usuario actual, cargar imagen de la base de datos
      if (user?.ImagenPerfil_Usuarios) {
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
          'perfil5flores.png': require('../img/profile/perfil5flores.png'),
          // Mapeo para rutas con prefijo 'profile/'
          'profile/perfil1animal.png': require('../img/profile/perfil1animal.png'),
          'profile/perfil1flores.png': require('../img/profile/perfil1flores.png'),
          'profile/perfil2animal.png': require('../img/profile/perfil2animal.png'),
          'profile/perfil2flores.png': require('../img/profile/perfil2flores.png'),
          'profile/perfil3animal.png': require('../img/profile/perfil3animal.png'),
          'profile/perfil3flores.png': require('../img/profile/perfil3flores.png'),
          'profile/perfil4animal.png': require('../img/profile/perfil4animal.png'),
          'profile/perfil4flores.png': require('../img/profile/perfil4flores.png'),
          'profile/perfil5animal.png': require('../img/profile/perfil5animal.png'),
          'profile/perfil5flores.png': require('../img/profile/perfil5flores.png')
        };

        const imageSource = imageMap[user.ImagenPerfil_Usuarios];
        if (imageSource) {
          setProfileImage(imageSource);
        } else {
          setProfileImage(null);
        }
        loadedImageRef.current = true;
      } else {
        setProfileImage(null);
        loadedImageRef.current = true;
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      setProfileImage(null);
      loadedImageRef.current = true;
    } finally {
      isLoadingImageRef.current = false;
    }
  };




  const saveProfileImage = async (imageData) => {
    try {
      await AsyncStorage.setItem('profileImage', JSON.stringify(imageData));
      await AsyncStorage.setItem('profileImageUserId', user?.idUsuarios?.toString());
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  // Cargar estado del cooldown desde AsyncStorage (específico por usuario)
  const loadCooldownState = async () => {
    try {
      const cooldownKey = `lastImageChange_${user?.idUsuarios}`;
      const savedLastChange = await AsyncStorage.getItem(cooldownKey);
      if (savedLastChange) {
        setLastImageChange(parseInt(savedLastChange));
        checkCooldown();
      }
    } catch (error) {
      console.error('Error loading cooldown state:', error);
    }
  };

  // Verificar si el cooldown ha expirado (específico por usuario)
  const checkCooldown = async () => {
    try {
      // Verificar también desde AsyncStorage para mayor seguridad (específico por usuario)
      const cooldownKey = `lastImageChange_${user?.idUsuarios}`;
      const savedLastChange = await AsyncStorage.getItem(cooldownKey);
      const lastChange = savedLastChange ? parseInt(savedLastChange) : lastImageChange;
      
      if (lastChange) {
        const now = Date.now();
        const timeDiff = now - lastChange;
        const cooldownTime = 5 * 60 * 1000; // 5 minutos en milisegundos
        
        if (timeDiff < cooldownTime) {
          setIsImageChangeBlocked(true);
          setLastImageChange(lastChange);
        } else {
          setIsImageChangeBlocked(false);
          setLastImageChange(null);
          // Limpiar el timestamp expirado específico del usuario
          await AsyncStorage.removeItem(cooldownKey);
        }
      } else {
        setIsImageChangeBlocked(false);
      }
    } catch (error) {
      console.error('Error checking cooldown:', error);
      setIsImageChangeBlocked(false);
    }
  };

  // Obtener tiempo restante del cooldown
  const getRemainingCooldownTime = () => {
    if (!lastImageChange || !isImageChangeBlocked) return 0;
    
    const now = Date.now();
    const timeDiff = now - lastImageChange;
    const cooldownTime = 5 * 60 * 1000; // 5 minutos en milisegundos
    const remaining = cooldownTime - timeDiff;
    
    return Math.max(0, Math.ceil(remaining / 1000)); // Retorna segundos restantes
  };

  // Formatear tiempo restante
  const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
    } catch (error) {
      // Silenciar errores de perfil
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPoints = async () => {
    try {
      setUserPoints(user?.Puntos_Usuarios || 0);
    } catch (error) {
      setUserPoints(0);
    }
  };

  const loadUserPublicationsCount = async () => {
    try {
      // Cargar contador real de donaciones desde el backend
      if (!user?.idUsuarios) {
        setUserPublicationsCount(0);
        return;
      }
      const stats = await ApiService.getUserStatistics(user.idUsuarios);
      const total = 
        stats?.statistics?.totalDonations ??
        stats?.statistics?.total_donations ??
        stats?.totalDonations ??
        stats?.total_donations ??
        stats?.donations ?? 0;
      setUserPublicationsCount(Number.isFinite(total) ? total : 0);
    } catch (error) {
      setUserPublicationsCount(0);
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

  const handleActionPress = (action) => {
    switch (action) {
      case 'home':
        navigation.navigate('ReceptionHomeScreen');
        break;
      case 'add_device':
        navigation.navigate('DeviceUploadSelectionScreen');
        break;
      case 'verify_email':
        Alert.alert('Próximamente', 'La verificación de correo estará disponible pronto');
        break;
      case 'verify_phone':
        Alert.alert('Próximamente', 'La verificación de celular estará disponible pronto');
        break;
      case 'change_password':
        Alert.alert('Próximamente', 'El cambio de contraseña estará disponible pronto');
        break;
      default:
        break;
    }
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

  const openImageSelector = async () => {
    // Verificación inmediata del cooldown antes de abrir el modal
    await checkCooldown();
    
    if (isImageChangeBlocked) {
      const remainingTime = getRemainingCooldownTime();
      Alert.alert(
        'Cooldown Activo',
        `Debes esperar ${formatRemainingTime(remainingTime)} minutos antes de cambiar tu imagen de perfil nuevamente.`,
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }
    setShowImageModal(true);
  };

  const selectImage = async (image) => {
    const now = Date.now();
    
    try {
      // Verificación adicional de seguridad antes de cambiar la imagen
      await checkCooldown();
      
      if (isImageChangeBlocked) {
        const remainingTime = getRemainingCooldownTime();
        Alert.alert(
          'Cooldown Activo',
          `No puedes cambiar tu imagen. Debes esperar ${formatRemainingTime(remainingTime)} minutos.`,
          [{ text: 'Entendido', style: 'default' }]
        );
        setShowImageModal(false);
        return;
      }
      
      // Guardar la imagen en AsyncStorage
      setProfileImage(image.source);
      await saveProfileImage(image.source);
      
      // Reset de los refs para permitir recarga
      loadedImageRef.current = false;
      
      // Guardar imagen en la base de datos usando ApiService
      try {
        await ApiService.updateProfile({
          Imagen_Usuarios: image.source
        });
        await refreshProfile();
      } catch (error) {
        console.error('Error updating profile image:', error);
        throw error; // Re-throw para que sea manejado por el catch externo
      }
      
      // Guardar timestamp del cambio y activar cooldown (específico por usuario)
      setLastImageChange(now);
      setIsImageChangeBlocked(true);
      const cooldownKey = `lastImageChange_${user?.idUsuarios}`;
      await AsyncStorage.setItem(cooldownKey, now.toString());
      
      
      setShowImageModal(false);
      
      // Mostrar confirmación
      Alert.alert(
        'Imagen Actualizada',
        'Tu imagen de perfil ha sido actualizada. Podrás cambiarla nuevamente en 5 minutos.',
        [{ text: 'Entendido', style: 'default' }]
      );
    } catch (error) {
      console.error('[ERROR] Error al cambiar imagen:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen. Inténtalo de nuevo.');
    }
  };

  const openEditNameModal = () => {
    setEditName({
      nombre: user?.Nombres_Usuarios || '',
      apellido: user?.Apellidos_Usuarios || ''
    });
    setShowEditNameModal(true);
  };

  const saveNameChanges = async () => {
    if (!editName.nombre.trim() || !editName.apellido.trim()) {
      Alert.alert('Error', 'Por favor completa ambos campos');
      return;
    }

    setIsLoading(true);

    try {
      // Actualizar perfil usando ApiService
      await ApiService.updateProfile({
        Nombres_Usuarios: editName.nombre.trim(),
        Apellidos_Usuarios: editName.apellido.trim(),
      });
      
      Alert.alert('Éxito', 'Nombre actualizado correctamente');
      await refreshProfile();
      setShowEditNameModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.imageItem} 
      onPress={() => selectImage(item)}
    >
      <Image source={item.source} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>Cargando perfil...</Text>
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
                Donaciones: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{userPublicationsCount}</Text>
              </Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Inicio', 'home-outline', '#4CAF50', () => {
                setSidebarVisible(false);
                handleActionPress('home');
              })}

              {renderSidebarItem('Añadir Dispositivos', 'add-circle-outline', '#FF9800', () => {
                setSidebarVisible(false);
                handleActionPress('add_device');
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
            <Text style={[styles.appName, { color: themeColors.text }]}>Mi Perfil</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContent}>

          {/* Tarjeta de Información del Usuario */}
          <LinearGradient
            colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image source={profileImage} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                  </Text>
                )}
                <TouchableOpacity 
                  style={[
                    styles.editIconContainer, 
                    isImageChangeBlocked && styles.editIconContainerBlocked
                  ]} 
                  onPress={openImageSelector}
                >
                  <Ionicons 
                    name={isImageChangeBlocked ? "time" : "pencil"} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameContainer}>
                  <Text style={[styles.userName, { color: themeColors.text }]}>{user?.Apellidos_Usuarios}, {user?.Nombres_Usuarios}</Text>
                  <TouchableOpacity style={styles.editNameIcon} onPress={openEditNameModal}>
                    <Ionicons name="pencil" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>{user?.Email_Usuarios}</Text>
                <Text style={[styles.userType, { color: themeColors.textSecondary }]}>
                  Recepción
                </Text>
              </View>
            </View>
            
            {/* Indicador de cooldown debajo de la información del usuario */}
            {isImageChangeBlocked && (
              <View style={styles.cooldownIndicator}>
                <Ionicons name="time" size={12} color="#FF6B6B" />
                <Text style={styles.cooldownText}>
                  Cambio disponible en {formatRemainingTime(getRemainingCooldownTime())}
                </Text>
              </View>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>{userPublicationsCount}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Donaciones</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Configuración de Cuenta */}
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Configuración de Cuenta</Text>
          
          <View style={styles.buttonsContainer}>
            <LinearGradient
              colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#E9ECEF', '#F8F9FA']}
              style={styles.actionButton}
            >
              <TouchableOpacity 
                style={styles.actionButtonContent}
                onPress={() => handleActionPress('verify_email')}
              >
                <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Verificar Correo</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient
              colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#E9ECEF', '#F8F9FA']}
              style={styles.actionButton}
            >
              <TouchableOpacity 
                style={styles.actionButtonContent}
                onPress={() => handleActionPress('verify_phone')}
              >
                <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Verificar Celular</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient
              colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#E9ECEF', '#F8F9FA']}
              style={styles.actionButton}
            >
              <TouchableOpacity 
                style={styles.actionButtonContent}
                onPress={() => handleActionPress('change_password')}
              >
                <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Cambiar Contraseña</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* Modal para seleccionar imagen */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
        onShow={async () => {
          // Verificación adicional cuando el modal se abre
          await checkCooldown();
          if (isImageChangeBlocked) {
            setShowImageModal(false);
            const remainingTime = getRemainingCooldownTime();
            Alert.alert(
              'Cooldown Activo',
              `No puedes cambiar tu imagen. Debes esperar ${formatRemainingTime(remainingTime)} minutos.`,
              [{ text: 'Entendido', style: 'default' }]
            );
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Foto de Perfil</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableImages}
              renderItem={renderImageItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.imageGrid}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para editar nombre */}
      <Modal
        visible={showEditNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.overlay }]}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={[styles.editNameModalContent, { backgroundColor: themeColors.surface }]}>
              <View style={styles.editNameModalHeader}>
                <Text style={[styles.editNameModalTitle, { color: themeColors.text }]}>Editar Nombre y Apellido</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowEditNameModal(false)}
                >
                  <Ionicons name="close" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.inputsContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>Nombre</Text>
                  <TextInput
                    style={[styles.nameInput, { 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border, 
                      color: themeColors.text 
                    }]}
                    value={editName.nombre}
                    onChangeText={(text) => setEditName(prev => ({ ...prev, nombre: text }))}
                    placeholder="Ingresa tu nombre"
                    placeholderTextColor={themeColors.textSecondary}
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>Apellido</Text>
                  <TextInput
                    style={[styles.nameInput, { 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border, 
                      color: themeColors.text 
                    }]}
                    value={editName.apellido}
                    onChangeText={(text) => setEditName(prev => ({ ...prev, apellido: text }))}
                    placeholder="Ingresa tu apellido"
                    placeholderTextColor={themeColors.textSecondary}
                    returnKeyType="done"
                  />
                </View>
              </ScrollView>
              
              <View style={styles.editNameButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { backgroundColor: themeColors.card }]}
                  onPress={() => setShowEditNameModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                  onPress={saveNameChanges}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  profileContent: {
    padding: 1,
    paddingTop: 10,
    paddingBottom: 40,
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
  sidebarItemSubtitle: {
    fontSize: 12,
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
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  imageGrid: {
    paddingVertical: 10,
  },
  imageItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editNameIcon: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  editNameModalContent: {
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
    minHeight: 330,
  },
  editNameModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editNameModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputsContainer: {
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonContent: {
    padding: 20,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
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
  editIconContainerBlocked: {
    backgroundColor: '#FF6B6B',
    opacity: 0.7,
  },
  cooldownIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    alignSelf: 'center',
  },
  cooldownText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '600',
  },
});
