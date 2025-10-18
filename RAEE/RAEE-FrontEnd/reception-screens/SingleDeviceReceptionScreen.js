import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width: screenWidth } = Dimensions.get('window');

export default function SingleDeviceReceptionScreen({ navigation }) {
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
  
  // Estados para el sidebar (idénticos a ReceptionHomeScreen)
  const [profileImage, setProfileImage] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userPublicationsCount, setUserPublicationsCount] = useState(0);
  const [pointsLoaded, setPointsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Estados para el buscador de usuarios
  const [searchDni, setSearchDni] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Estados para el modal de registro de dispositivos
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [isSubmittingDevice, setIsSubmittingDevice] = useState(false);
  
  // Estados para los datos del formulario
  const [deviceForm, setDeviceForm] = useState({
    idCategorias_Equipos: '',
    idMarcas_Equipos: '',
    Modelo_Equipos: '',
    Descripcion_Equipos: '',
    idEstados_Equipos: '',
    PesoKG_Equipos: '',
    DimencionesCM_Equipos: '',
    Accesorios_Equipos: '',
    ImagenPrincipal_Equipos: null,
  });
  
  // Estados para los datos de las tablas relacionadas
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  
  // Estados para manejar los dropdowns
  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState(false);
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);

  // Cargar preferencia de tema
  useEffect(() => {
    loadThemePreference();
    
    // Log screen load (igual que en ReceptionHomeScreen)
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[SCREEN] EL USUARIO ENTRO A LA PANTALLA SINGLE DEVICE RECEPTION - ${time} ${date}`);
    
    // Simular carga de datos del usuario
    setUserPoints(user.Puntos_Usuarios || 250);
    setPointsLoaded(true);
    
    // Cargar contador de publicaciones
    loadUserPublicationsCount();
    
    // Cargar imagen de perfil
    loadUserProfileImage();
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
  const toggleTheme = async () => {
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
    border: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    header: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
    sidebarGradient: isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF'],
    accent: isDarkMode ? '#FF6B6B' : '#E53E3E',
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
              setSidebarVisible(false);
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

  // Toggle sidebar simple
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Funciones de carga de datos del usuario (copiadas de ReceptionHomeScreen)
  const loadUserProfileImage = async () => {
    // Implementación futura para cargar imagen de perfil
  };

  const loadUserPoints = async () => {
    // Implementación futura para cargar puntos del usuario
  };

  const loadUserPublicationsCount = async () => {
    // Implementación futura para cargar conteo de publicaciones
  };

  // Función para renderizar elementos del sidebar (copiada de ProfileReceptionScreen)
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

  // Función mejorada para manejar acciones del sidebar
  const handleActionPress = (action) => {
    // Log button press
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    
    switch (action) {
      case 'home':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON INICIO - ${time} ${date}`);
        navigation.navigate('ReceptionHomeScreen');
        break;
      case 'profile':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON MI PERFIL - ${time} ${date}`);
        navigation.navigate('ProfileReceptionScreen');
        break;
      case 'add_device':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON AÑADIR DISPOSITIVOS - ${time} ${date}`);
        navigation.navigate('DeviceUploadSelectionScreen');
        break;
      case 'verify_email':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON VERIFICAR CORREO - ${time} ${date}`);
        Alert.alert('Próximamente', 'La verificación de correo estará disponible pronto');
        break;
      case 'verify_phone':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON VERIFICAR CELULAR - ${time} ${date}`);
        Alert.alert('Próximamente', 'La verificación de celular estará disponible pronto');
        break;
      case 'change_password':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON CAMBIAR CONTRASEÑA - ${time} ${date}`);
        Alert.alert('Próximamente', 'El cambio de contraseña estará disponible pronto');
        break;
      case 'toggle_theme':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON MODO ${isDarkMode ? 'CLARO' : 'OSCURO'} - ${time} ${date}`);
        toggleTheme();
        break;
      default:
        console.log(`[BUTTON] Acción no reconocida: ${action} - ${time} ${date}`);
    }
  };

  // Función para buscar usuario por DNI
  const handleSearchUser = async () => {
    if (!searchDni.trim()) {
      setSearchError('Por favor ingresa un DNI válido');
      return;
    }

    // Validar formato del DNI (8 dígitos)
    if (!/^\d{8}$/.test(searchDni.trim())) {
      setSearchError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setFoundUser(null);

    try {
      const response = await ApiService.searchUserByDni(searchDni.trim());
      
      if (response.success && response.data) {
        setFoundUser(response.data);
        setSearchError('');
      } else {
        // Manejar diferentes tipos de errores
        if (response.data && response.data.Activo_Usuarios === '0') {
          setSearchError(`Usuario "${response.data.Nombres_Usuarios} ${response.data.Apellidos_Usuarios}" encontrado pero está inactivo. No puede realizar operaciones.`);
        } else {
          setSearchError(response.message || 'Usuario no encontrado');
        }
      }
    } catch (error) {
      console.error('Error searching user:', error);
      
      // Manejar errores específicos del servidor
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403 && data.data && data.data.user_status === 'inactive') {
          setSearchError(`Usuario "${data.data.name}" encontrado pero está inactivo. No puede realizar operaciones.`);
        } else if (status === 404) {
          setSearchError('Usuario no encontrado con el DNI proporcionado');
        } else if (status === 400) {
          setSearchError(data.message || 'DNI inválido');
        } else {
          setSearchError('Error del servidor. Intenta nuevamente.');
        }
      } else {
        setSearchError('Error al conectar con el servidor. Verifica tu conexión.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchDni('');
    setFoundUser(null);
    setSearchError('');
  };

  // Función para formatear la dirección del usuario
  const formatUserAddress = (user) => {
    if (!user.direccion) return 'Sin dirección registrada';
    
    const { direccion } = user;
    let address = '';
    
    if (direccion.Calle_Direcciones) address += direccion.Calle_Direcciones;
    if (direccion.Numero_Direcciones) address += ` ${direccion.Numero_Direcciones}`;
    if (direccion.Piso_Direcciones) address += `, Piso ${direccion.Piso_Direcciones}`;
    if (direccion.Departamento_Direcciones) address += `, Depto ${direccion.Departamento_Direcciones}`;
    if (direccion.Barrio_Direcciones) address += `, ${direccion.Barrio_Direcciones}`;
    if (direccion.Nombres_Municipios) address += `, ${direccion.Nombres_Municipios}`;
    
    return address || 'Dirección incompleta';
  };

  // Funciones para cargar datos de equipos
  const loadCategorias = async () => {
    setLoadingCategorias(true);
    try {
      console.log('Cargando categorías...');
      const response = await ApiService.getCategories();
      console.log('Respuesta categorías:', response);
      
      if (response && response.success && response.data) {
        setCategorias(response.data);
        console.log('Categorías cargadas exitosamente:', response.data.length);
      } else {
        const errorMsg = response?.message || 'Respuesta inválida del servidor';
        console.error('Error loading categorias:', errorMsg);
        console.error('Respuesta completa:', response);
        Alert.alert('Error', `No se pudieron cargar las categorías: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error loading categorias:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Error al cargar las categorías: ${error.message}`);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const loadMarcas = async () => {
    setLoadingMarcas(true);
    try {
      console.log('Cargando marcas...');
      const response = await ApiService.getBrands();
      console.log('Respuesta marcas:', response);
      
      if (response && response.success && response.data) {
        setMarcas(response.data);
        console.log('Marcas cargadas exitosamente:', response.data.length);
      } else {
        const errorMsg = response?.message || 'Respuesta inválida del servidor';
        console.error('Error loading marcas:', errorMsg);
        console.error('Respuesta completa:', response);
        Alert.alert('Error', `No se pudieron cargar las marcas: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error loading marcas:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Error al cargar las marcas: ${error.message}`);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const loadEstados = async () => {
    setLoadingEstados(true);
    try {
      console.log('Cargando estados...');
      const response = await ApiService.getStates();
      console.log('Respuesta estados:', response);
      
      if (response && response.success && response.data) {
        setEstados(response.data);
        console.log('Estados cargados exitosamente:', response.data.length);
      } else {
        const errorMsg = response?.message || 'Respuesta inválida del servidor';
        console.error('Error loading estados:', errorMsg);
        console.error('Respuesta completa:', response);
        Alert.alert('Error', `No se pudieron cargar los estados: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error loading estados:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Error al cargar los estados: ${error.message}`);
    } finally {
      setLoadingEstados(false);
    }
  };

  // Función para abrir el modal de registro de dispositivo
  const handleOpenDeviceModal = () => {
    setShowDeviceModal(true);
    // Cargar datos si no están cargados
    if (categorias.length === 0) loadCategorias();
    if (marcas.length === 0) loadMarcas();
    if (estados.length === 0) loadEstados();
  };

  // Función para cerrar el modal de registro de dispositivo
  const handleCloseDeviceModal = () => {
    setShowDeviceModal(false);
    // Limpiar formulario
    setDeviceForm({
      idCategorias_Equipos: '',
      idMarcas_Equipos: '',
      Modelo_Equipos: '',
      Descripcion_Equipos: '',
      idEstados_Equipos: '',
      PesoKG_Equipos: '',
      DimencionesCM_Equipos: '',
      Accesorios_Equipos: '',
      ImagenPrincipal_Equipos: '',
    });
  };

  // Función para manejar cambios en el formulario de dispositivo
  const handleDeviceFormChange = (field, value) => {
    setDeviceForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si se cambia la categoría, filtrar las marcas
    if (field === 'idCategorias_Equipos') {
      const marcasFiltradas = marcas.filter(marca => marca.idCategorias_Marcas === value);
      setMarcasFiltradas(marcasFiltradas);
      // Limpiar la marca seleccionada si no pertenece a la nueva categoría
      setDeviceForm(prev => ({
        ...prev,
        idMarcas_Equipos: ''
      }));
    }
  };

  // Funciones para manejar los dropdowns
  const handleCategoriaSelect = (categoria) => {
    handleDeviceFormChange('idCategorias_Equipos', categoria.idCategorias);
    setShowCategoriaDropdown(false);
  };

  const handleMarcaSelect = (marca) => {
    handleDeviceFormChange('idMarcas_Equipos', marca.idMarcas);
    setShowMarcaDropdown(false);
  };

  const handleEstadoSelect = (estado) => {
    handleDeviceFormChange('idEstados_Equipos', estado.idEstadosEquipos);
    setShowEstadoDropdown(false);
  };

  // Función para obtener el nombre de la categoría seleccionada
  const getSelectedCategoriaName = () => {
    const categoria = categorias.find(cat => cat.idCategorias === deviceForm.idCategorias_Equipos);
    return categoria ? categoria.Nombres_Categorias : 'Seleccionar categoría';
  };

  // Función para obtener el nombre de la marca seleccionada
  const getSelectedMarcaName = () => {
    const marca = marcas.find(mar => mar.idMarcas === deviceForm.idMarcas_Equipos);
    return marca ? marca.Nombres_Marcas : 'Seleccionar marca';
  };

  // Función para obtener el nombre del estado seleccionado
  const getSelectedEstadoName = () => {
    const estado = estados.find(est => est.idEstadosEquipos === deviceForm.idEstados_Equipos);
    return estado ? estado.Nombres_EstadosEquipos : 'Seleccionar estado';
  };

  // Función para enviar el formulario de registro de dispositivo
  const handleSubmitDevice = async () => {
    try {
      // Validar campos requeridos
      if (!deviceForm.idCategorias_Equipos) {
        Alert.alert('Campo requerido', 'Por favor selecciona una categoría para el dispositivo');
        return;
      }
      if (!deviceForm.idMarcas_Equipos) {
        Alert.alert('Campo requerido', 'Por favor selecciona una marca para el dispositivo');
        return;
      }
      if (!deviceForm.idEstados_Equipos) {
        Alert.alert('Campo requerido', 'Por favor selecciona el estado del dispositivo');
        return;
      }
      if (!deviceForm.Modelo_Equipos.trim()) {
        Alert.alert('Campo requerido', 'Por favor ingresa el modelo del dispositivo');
        return;
      }
      
      // Validaciones adicionales
      if (deviceForm.Modelo_Equipos.trim().length < 2) {
        Alert.alert('Modelo inválido', 'El modelo debe tener al menos 2 caracteres');
        return;
      }
      if (deviceForm.PesoKG_Equipos && isNaN(parseFloat(deviceForm.PesoKG_Equipos))) {
        Alert.alert('Peso inválido', 'Por favor ingresa un peso válido en kilogramos');
        return;
      }
      if (deviceForm.PesoKG_Equipos && parseFloat(deviceForm.PesoKG_Equipos) <= 0) {
        Alert.alert('Peso inválido', 'El peso debe ser mayor a 0 kilogramos');
        return;
      }
      if (deviceForm.PesoKG_Equipos && parseFloat(deviceForm.PesoKG_Equipos) > 1000) {
        Alert.alert('Peso inválido', 'El peso no puede ser mayor a 1000 kilogramos');
        return;
      }

      setIsSubmittingDevice(true);

      // Preparar datos para enviar
      const equipmentData = {
        idCategorias_Equipos: deviceForm.idCategorias_Equipos,
        idMarcas_Equipos: deviceForm.idMarcas_Equipos,
        idEstados_Equipos: deviceForm.idEstados_Equipos,
        Modelo_Equipos: deviceForm.Modelo_Equipos.trim(),
        Descripcion_Equipos: deviceForm.Descripcion_Equipos.trim(),
        PesoKG_Equipos: deviceForm.PesoKG_Equipos ? parseFloat(deviceForm.PesoKG_Equipos) : null,
        Dimensiones_Equipos: deviceForm.Dimensiones_Equipos.trim(),
        Accesorios_Equipos: deviceForm.Accesorios_Equipos.trim(),
        idUsuarios: foundUser.idUsuarios
      };

      // Enviar al backend
      const response = await ApiService.createEquipment(equipmentData, foundUser.idUsuarios, foundUser.Roles_Usuarios);

      if (response.success) {
        Alert.alert(
          'Éxito',
          'Dispositivo registrado correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                handleCloseDeviceModal();
                // Limpiar formulario
                setDeviceForm({
                  idCategorias_Equipos: '',
                  idMarcas_Equipos: '',
                  idEstados_Equipos: '',
                  Modelo_Equipos: '',
                  Descripcion_Equipos: '',
                  PesoKG_Equipos: '',
                  Dimensiones_Equipos: '',
                  Accesorios_Equipos: ''
                });
                // Limpiar búsqueda de usuario
                handleClearSearch();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al registrar el dispositivo');
      }
    } catch (error) {
      console.error('Error al registrar dispositivo:', error);
      Alert.alert('Error', 'Error al registrar el dispositivo. Por favor intenta nuevamente.');
    } finally {
      setIsSubmittingDevice(false);
    }
  };

  // Función para renderizar tarjetas de acción
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

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Sidebar */}
      {sidebarVisible && (
        <View style={styles.sidebar}>
          <LinearGradient
            colors={isDarkMode ? ['#1A1A2E', '#16213E'] : ['#FFFFFF', '#F8F9FA']}
            style={styles.sidebarGradient}
          >
            {/* Sidebar Welcome Section */}
            <View style={styles.sidebarWelcome}>
              <View style={styles.sidebarAvatarContainer}>
                {user?.Imagen_Usuarios ? (
                  <Image 
                    source={{ uri: user.Imagen_Usuarios }} 
                    style={styles.sidebarAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.sidebarAvatarText}>
                    {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                  </Text>
                )}
              </View>
              <Text style={styles.sidebarWelcomeTitle}>¡Bienvenido a EcoRAEE!</Text>
              <Text style={styles.sidebarUserName}>{user?.Nombres_Usuarios} {user?.Apellidos_Usuarios}</Text>
              <Text style={styles.sidebarUserType}>
                Recepción EcoRAEE
              </Text>
              <Text style={[styles.sidebarPointsText, { color: themeColors.text }]}>
                Donaciones: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{userPublicationsCount}</Text>
              </Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Mi Perfil', 'person-outline', '#2196F3', () => {
                setSidebarVisible(false);
                handleActionPress('profile');
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
          style={styles.overlay}
          onPress={() => setSidebarVisible(false)}
          activeOpacity={1}
        />
      )}

      {/* Modern Header */}
      <View style={[styles.modernHeader, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={[
              styles.sidebarToggle, 
              { 
                backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF',
                opacity: isSearching ? 0.6 : 1,
              }
            ]} 
            onPress={toggleSidebar}
            disabled={isSearching}
          >
            <Ionicons 
              name="menu" 
              size={20} 
              color={themeColors.text} 
            />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../img/logo-EcoRAEE.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Dispositivo Único</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
            Registra un dispositivo electrónico individual del ciudadano para generar puntos.
          </Text>
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>

        {/* Formulario de búsqueda */}
        <TouchableOpacity style={styles.actionCard} activeOpacity={1}>
          <LinearGradient
            colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.actionCardGradient}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionCardTextContainer}>
                <Text style={[styles.actionCardTitle, { color: themeColors.text }]}>Buscar Ciudadano</Text>
                <Text style={[styles.actionCardSubtitle, { color: themeColors.textSecondary }]}>Ingresa el DNI del ciudadano para cargar sus datos</Text>
              </View>
              <View style={styles.actionCardIcons}>
                <View style={[
                  styles.actionIcon,
                  { backgroundColor: (themeColors.primary) + '20' }
                ]}>
                  <Ionicons name="search-outline" size={22} color={themeColors.primary} />
                </View>
              </View>
            </View>
            
            <View style={styles.searchInputContainer}>
              <View style={[styles.inputWrapper, { borderColor: themeColors.border }]}>
                <Ionicons name="person-outline" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.searchInput, { color: themeColors.text }]}
                  placeholder="Ingresa el DNI (ej: 12345678)"
                  placeholderTextColor={themeColors.textSecondary}
                  value={searchDni}
                  onChangeText={setSearchDni}
                  keyboardType="numeric"
                  maxLength={8}
                  editable={!isSearching}
                />
                {searchDni.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.modernSearchButton}
                onPress={handleSearchUser}
                disabled={isSearching || !searchDni.trim()}
              >
                <LinearGradient
                  colors={isSearching || !searchDni.trim() 
                    ? ['#CCCCCC', '#999999'] 
                    : isDarkMode 
                      ? ['#4CAF50', '#2E7D32'] 
                      : ['#4CAF50', '#2E7D32']
                  }
                  style={styles.modernSearchButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.modernSearchButtonContent}>
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="search" size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.modernSearchButtonText}>
                      {isSearching ? 'Buscando...' : 'Buscar Ciudadano'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

          {/* Error de búsqueda */}
          {searchError ? (
            <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="alert-circle" size={20} color="#F44336" />
              <Text style={[styles.errorText, { color: '#F44336' }]}>{searchError}</Text>
            </View>
          ) : null}

        {/* Resultados de la búsqueda */}
        {foundUser && (
          <View style={[styles.userResultContainer, { backgroundColor: themeColors.background }]}>
            <View style={styles.userResultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={[styles.userResultTitle, { color: themeColors.text }]}>
                Usuario Encontrado
              </Text>
            </View>

            <View style={[styles.userInfoCard, { backgroundColor: themeColors.surface }]}>
              {/* Avatar y datos básicos */}
              <View style={styles.userBasicInfo}>
                <View style={[styles.userAvatar, { backgroundColor: themeColors.primary + '20' }]}>
                  {foundUser.ImagenPerfil_Usuarios ? (
                    <Image 
                      source={{ uri: foundUser.ImagenPerfil_Usuarios }} 
                      style={styles.userAvatarImage}
                    />
                  ) : (
                    <Text style={[styles.userAvatarText, { color: themeColors.primary }]}>
                      {foundUser?.Nombres_Usuarios?.charAt(0)}{foundUser?.Apellidos_Usuarios?.charAt(0)}
                    </Text>
                  )}
                </View>
                
                <View style={styles.userBasicDetails}>
                  <Text style={[styles.userName, { color: themeColors.text }]}>
                    {foundUser?.Nombres_Usuarios} {foundUser?.Apellidos_Usuarios}
                  </Text>
                  <Text style={[styles.userDni, { color: themeColors.textSecondary }]}>
                    DNI: {foundUser?.DNI_Usuarios || 'No disponible'}
                  </Text>
                  <View style={styles.userPointsContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.userPoints, { color: themeColors.text }]}>
                      {foundUser?.Puntos_Usuarios || 0} puntos
                    </Text>
                  </View>
                </View>
              </View>

              {/* Estado del usuario */}
              <View style={styles.userStatusContainer}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: foundUser?.Activo_Usuarios === '1' ? '#E8F5E8' : '#FFEBEE' 
                }]}>
                  <Ionicons 
                    name={foundUser?.Activo_Usuarios === '1' ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={foundUser?.Activo_Usuarios === '1' ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={[styles.statusText, { 
                    color: foundUser?.Activo_Usuarios === '1' ? '#4CAF50' : '#F44336' 
                  }]}>
                    {foundUser?.Activo_Usuarios === '1' ? 'Usuario Activo' : 'Usuario Inactivo'}
                  </Text>
                </View>
                
                <View style={[styles.roleBadge, { backgroundColor: themeColors.primary + '20' }]}>
                  <Ionicons name="person-circle-outline" size={16} color={themeColors.primary} />
                  <Text style={[styles.roleText, { color: themeColors.primary }]}>
                    {foundUser?.Roles_Usuarios || 'Sin rol'}
                  </Text>
                </View>
              </View>

              {/* Información detallada */}
              <View style={styles.userDetailedInfo}>
                <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                  <Ionicons name="card-outline" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>ID Usuario:</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    #{foundUser?.idUsuarios || 'N/A'}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                  <Ionicons name="mail-outline" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Email:</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {foundUser?.Email_Usuarios || 'No registrado'}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                  <Ionicons name="call-outline" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Teléfono:</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {foundUser?.Telefono_Usuarios || 'No registrado'}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                  <Ionicons name="location-outline" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Dirección:</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {foundUser ? formatUserAddress(foundUser) : 'No disponible'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Registro:</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {foundUser?.FechaRegistro_Usuarios ? 
                      new Date(foundUser.FechaRegistro_Usuarios).toLocaleDateString('es-ES') : 
                      'No disponible'
                    }
                  </Text>
                </View>
              </View>

              {/* Advertencia para usuarios inactivos */}
              {foundUser?.Activo_Usuarios !== '1' && (
                <View style={[styles.warningContainer, { backgroundColor: '#FFF3CD' }]}>
                  <Ionicons name="warning" size={20} color="#856404" />
                  <Text style={[styles.warningText, { color: '#856404' }]}>
                    Este usuario está inactivo y no puede realizar operaciones de registro de dispositivos.
                  </Text>
                </View>
              )}

              {/* Botón de acción */}
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: foundUser.Activo_Usuarios === '1' ? themeColors.primary : '#CCCCCC',
                    opacity: foundUser.Activo_Usuarios === '1' ? 1 : 0.6
                  }
                ]}
                onPress={() => {
                  if (foundUser.Activo_Usuarios !== '1') {
                    Alert.alert(
                      'Usuario Inactivo',
                      'Este usuario está inactivo y no puede realizar operaciones de registro de dispositivos.',
                      [{ text: 'Entendido' }]
                    );
                    return;
                  }
                  
                  handleOpenDeviceModal();
                }}
                disabled={foundUser.Activo_Usuarios !== '1'}
              >
                <Ionicons 
                  name={foundUser.Activo_Usuarios === '1' ? "add-circle-outline" : "ban-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.actionButtonText}>
                  {foundUser.Activo_Usuarios === '1' ? 'Registrar Dispositivo' : 'Usuario Inactivo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}




      </ScrollView>

      {/* Modal de Registro de Dispositivo */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDeviceModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1A1A2E' : '#FFFFFF' }]}>
          <LinearGradient
            colors={isDarkMode ? ['#1A1A2E', '#16213E'] : ['#4CAF50', '#45A049']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                onPress={handleCloseDeviceModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Registrar Dispositivo</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
          </LinearGradient>

          <ScrollView style={[styles.modalContent, { backgroundColor: themeColors.surface }]} showsVerticalScrollIndicator={false}>
            <View style={styles.modalForm}>
              {/* Información del Usuario */}
              <View style={styles.userInfoSection}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Usuario Propietario
                </Text>
                <View style={[styles.userInfoCard, { backgroundColor: isDarkMode ? '#2C2C3E' : '#F5F5F5' }]}>
                  <Text style={[styles.userInfoText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                    {foundUser?.Nombres_Usuarios} {foundUser?.Apellidos_Usuarios}
                  </Text>
                  <Text style={[styles.userInfoSubtext, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                    DNI: {foundUser?.DNI_Usuarios}
                  </Text>
                </View>
              </View>

              {/* Categoría */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Categoría *
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowCategoriaDropdown(!showCategoriaDropdown)}
                  >
                    <Text style={[styles.pickerText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                      {getSelectedCategoriaName()}
                    </Text>
                    <Ionicons 
                      name={showCategoriaDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isDarkMode ? '#FFFFFF' : '#333333'} 
                    />
                  </TouchableOpacity>
                  {showCategoriaDropdown && (
                    <View style={[styles.dropdownList, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                      {loadingCategorias ? (
                        <View style={styles.dropdownItem}>
                          <ActivityIndicator size="small" color="#4CAF50" />
                          <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                            Cargando...
                          </Text>
                        </View>
                      ) : (
                        <FlatList
                          data={categorias}
                          keyExtractor={(item) => item.idCategorias.toString()}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleCategoriaSelect(item)}
                            >
                              <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                                {item.Nombres_Categorias}
                              </Text>
                            </TouchableOpacity>
                          )}
                          maxHeight={150}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Marca */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Marca *
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                  <TouchableOpacity
                    style={[styles.pickerButton, !deviceForm.idCategorias_Equipos && { opacity: 0.5 }]}
                    onPress={() => {
                      if (deviceForm.idCategorias_Equipos) {
                        setShowMarcaDropdown(!showMarcaDropdown);
                      } else {
                        Alert.alert('Atención', 'Primero selecciona una categoría');
                      }
                    }}
                    disabled={!deviceForm.idCategorias_Equipos}
                  >
                    <Text style={[styles.pickerText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                      {getSelectedMarcaName()}
                    </Text>
                    <Ionicons 
                      name={showMarcaDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isDarkMode ? '#FFFFFF' : '#333333'} 
                    />
                  </TouchableOpacity>
                  {showMarcaDropdown && deviceForm.idCategorias_Equipos && (
                    <View style={[styles.dropdownList, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                      {loadingMarcas ? (
                        <View style={styles.dropdownItem}>
                          <ActivityIndicator size="small" color="#4CAF50" />
                          <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                            Cargando...
                          </Text>
                        </View>
                      ) : marcasFiltradas.length > 0 ? (
                        <FlatList
                          data={marcasFiltradas}
                          keyExtractor={(item) => item.idMarcas.toString()}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleMarcaSelect(item)}
                            >
                              <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                                {item.Nombres_Marcas}
                              </Text>
                            </TouchableOpacity>
                          )}
                          maxHeight={150}
                        />
                      ) : (
                        <View style={styles.dropdownItem}>
                          <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                            No hay marcas disponibles para esta categoría
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Estado */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Estado del Equipo *
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowEstadoDropdown(!showEstadoDropdown)}
                  >
                    <Text style={[styles.pickerText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                      {getSelectedEstadoName()}
                    </Text>
                    <Ionicons 
                      name={showEstadoDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isDarkMode ? '#FFFFFF' : '#333333'} 
                    />
                  </TouchableOpacity>
                  {showEstadoDropdown && (
                    <View style={[styles.dropdownList, { backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF', borderColor: isDarkMode ? '#444444' : '#DDDDDD' }]}>
                      {loadingEstados ? (
                        <View style={styles.dropdownItem}>
                          <ActivityIndicator size="small" color="#4CAF50" />
                          <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                            Cargando...
                          </Text>
                        </View>
                      ) : (
                        <FlatList
                          data={estados}
                          keyExtractor={(item) => item.idEstadosEquipos.toString()}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleEstadoSelect(item)}
                            >
                              <Text style={[styles.dropdownItemText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                                {item.Nombres_EstadosEquipos}
                              </Text>
                            </TouchableOpacity>
                          )}
                          maxHeight={150}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Modelo */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Modelo *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }]}
                  value={deviceForm.Modelo_Equipos}
                  onChangeText={(text) => handleDeviceFormChange('Modelo_Equipos', text)}
                  placeholder="Ingrese el modelo del equipo"
                  placeholderTextColor="#95A5A6"
                />
              </View>

              {/* Descripción */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Descripción
                </Text>
                <TextInput
                  style={[styles.formTextArea, { 
                    backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }]}
                  value={deviceForm.Descripcion_Equipos}
                  onChangeText={(text) => handleDeviceFormChange('Descripcion_Equipos', text)}
                  placeholder="Descripción detallada del equipo"
                  placeholderTextColor="#95A5A6"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Peso */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Peso (KG)
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }]}
                  value={deviceForm.PesoKG_Equipos}
                  onChangeText={(text) => handleDeviceFormChange('PesoKG_Equipos', text)}
                  placeholder="Peso en kilogramos"
                  placeholderTextColor="#95A5A6"
                  keyboardType="numeric"
                />
              </View>

              {/* Dimensiones */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Dimensiones (CM)
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }]}
                  value={deviceForm.DimencionesCM_Equipos}
                  onChangeText={(text) => handleDeviceFormChange('DimencionesCM_Equipos', text)}
                  placeholder="Ej: 30x20x15"
                  placeholderTextColor="#95A5A6"
                />
              </View>

              {/* Accesorios */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
                  Accesorios
                </Text>
                <TextInput
                  style={[styles.formTextArea, { 
                    backgroundColor: isDarkMode ? '#2C2C3E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }]}
                  value={deviceForm.Accesorios_Equipos}
                  onChangeText={(text) => handleDeviceFormChange('Accesorios_Equipos', text)}
                  placeholder="Lista de accesorios incluidos"
                  placeholderTextColor="#95A5A6"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Botones */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseDeviceModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmitDevice}
                  disabled={isSubmittingDevice}
                >
                  {isSubmittingDevice ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Registrar Dispositivo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sidebarStatsContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  sidebarPublicationsText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  sidebarPublicationsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
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
  // Header styles
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
  headerRight: {
    width: 50,
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
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Welcome Card styles
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
  // Actions Section styles
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
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 14,
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
  // Info Card styles
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
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  // Estilos del formulario de búsqueda
  searchContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  searchInputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modernSearchButton: {
    marginTop: 8,
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
  modernSearchButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modernSearchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modernSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },

  // Estilos de resultados de usuario
  userResultContainer: {
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
  userResultGradient: {
    flex: 1,
  },
  userResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    gap: 8,
  },
  userResultTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  userInfoCard: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  userBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userBasicDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userDni: {
    fontSize: 14,
    marginBottom: 6,
  },
  userPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userPoints: {
    fontSize: 14,
    fontWeight: '500',
  },
  userStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    flex: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userDetailedInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningText: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },

  // Estilos de instrucciones
  instructionsContainer: {
    margin: 20,
    marginTop: 0,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Estilos del Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalForm: {
    padding: 24,
  },
  userInfoSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  userInfoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#2C3E50',
  },
  userInfoSubtext: {
    fontSize: 15,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2C3E50',
  },
  formInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTextArea: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderColor: '#E8F5E8',
    textAlignVertical: 'top',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerContainer: {
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    height: 54,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
    color: '#2C3E50',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    paddingBottom: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#95A5A6',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Estilos para dropdowns
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 1,
  },
});