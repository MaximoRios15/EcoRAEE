import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2; // 2 columnas con margen

export default function ExchangeShopScreen({ navigation }) {
  // Datos simulados del usuario
  const user = {
    idUsuarios: 1,
    Nombres_Usuarios: 'Juan',
    Apellidos_Usuarios: 'Pérez',
    Puntos_Usuarios: 250
  };
  const [searchText, setSearchText] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]); // Equipos originales sin filtrar
  const [isLoading, setIsLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(user?.Puntos_Usuarios || 0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [cart, setCart] = useState([]); // Carrito de compras
  const [showCartModal, setShowCartModal] = useState(false); // Modal del carrito

  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // true = modo oscuro (actual), false = modo claro
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    selectedCategory: null,
    selectedState: null,
    minPoints: '',
    maxPoints: '',
    minWeight: '',
    maxWeight: '',
    hasAccessories: null
  });

  const filterOptions = [
    { id: 'mejor-precio', name: 'Mejor precio', icon: 'card' },
    { id: 'envio-gratis', name: 'Envío gratis', icon: 'car' },
    { id: 'disponible', name: 'Disponible', icon: 'checkmark-circle' }
  ];

  useEffect(() => {
    loadEquipment();
    loadCategories();
    loadStates();
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

  // Función para renderizar elementos del sidebar con Ionicons
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
      case 'stats':
        // Navegar a estadísticas
        navigation.navigate('StatisticsCitizenScreen');
        break;
      case 'profile':
        // Navegar a perfil
        navigation.navigate('ProfileCitizenScreen');
        break;
      case 'home':
    navigation.navigate('CitizenHomeScreen');
        break;
      case 'exchange':
        // Ya estamos en la tienda; cerramos el sidebar
        setSidebarVisible(false);
        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            // Aquí implementarías la lógica de logout
            console.log('Cerrando sesión');
          }
        }
      ]
    );
  };

  const loadCategories = async () => {
    try {
      // Simulando carga de categorías
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockCategories = [
        { id: 1, name: 'Computadoras' },
        { id: 2, name: 'Teléfonos' },
        { id: 3, name: 'Tablets' },
        { id: 4, name: 'Electrodomésticos' },
        { id: 5, name: 'Otros' }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStates = async () => {
    try {
      // Simulando carga de estados
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockStates = [
        { id: 1, name: 'Excelente' },
        { id: 2, name: 'Bueno' },
        { id: 3, name: 'Regular' },
        { id: 4, name: 'Malo' }
      ];
      
      setStates(mockStates);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const getImageByCategory = (categoryId) => {
    const imageMap = {
      1: require('../img/profile/perfil1animal.png'),
      2: require('../img/profile/perfil2animal.png'),
      3: require('../img/profile/perfil3animal.png'),
      4: require('../img/profile/perfil4animal.png'),
      5: require('../img/profile/perfil5animal.png'),
    };
    return imageMap[categoryId] || require('../img/profile/perfil1animal.png');
  };

  const getStateIcon = (state) => {
    if (!state) return <Ionicons name="help-circle" size={16} color="#999" />;
    
    const stateLower = state.toLowerCase().trim();
    
    // Funcional - check verde
    if (stateLower === 'funcional' || 
        stateLower === 'activo' || 
        stateLower === 'disponible' ||
        (stateLower.includes('funcional') && !stateLower.includes('parcialmente') && !stateLower.includes('no'))) {
      return <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />;
    } 
    // Parcialmente funcional - icono amarillo
    else if (stateLower.includes('parcialmente') || 
             stateLower.includes('parcial') ||
             stateLower === 'parcialmente funcional') {
      return <Ionicons name="warning" size={16} color="#FFC107" />;
    } 
    // No funcional - icono rojo
    else if (stateLower.includes('no funcional') || 
             stateLower.includes('no-funcional') || 
             stateLower === 'no funcional' ||
             stateLower === 'inactivo' ||
             stateLower === 'dañado') {
      return <Ionicons name="close-circle" size={16} color="#F44336" />;
    } 
    // Para repuesto - icono azul
    else if (stateLower.includes('repuesto') || 
             stateLower.includes('repuestos') ||
             stateLower === 'para repuesto' ||
             stateLower === 'para repuestos') {
      return <Ionicons name="construct" size={16} color="#2196F3" />;
    } 
    // Estado desconocido - icono gris
    else {
      return <Ionicons name="help-circle" size={16} color="#999" />;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (filters.selectedCategory !== null) count++;
    if (filters.selectedState !== null) count++;
    if (filters.minPoints !== '') count++;
    if (filters.maxPoints !== '') count++;
    if (filters.minWeight !== '') count++;
    if (filters.maxWeight !== '') count++;
    if (filters.hasAccessories !== null) count++;
    
    return count;
  };

  const getActiveFiltersList = () => {
    const activeFilters = [];
    
    // Categoría
    if (filters.selectedCategory !== null) {
      const category = categories.find(cat => cat.id === filters.selectedCategory);
      if (category) {
        activeFilters.push(`Categoría: ${category.name}`);
      }
    }
    
    // Estado
    if (filters.selectedState !== null) {
      const state = states.find(st => st.id === filters.selectedState);
      if (state) {
        activeFilters.push(`Estado: ${state.name}`);
      }
    }
    
    // Puntos
    if (filters.minPoints !== '' && filters.maxPoints !== '') {
      activeFilters.push(`Puntos: ${filters.minPoints}-${filters.maxPoints}`);
    } else if (filters.minPoints !== '') {
      activeFilters.push(`Puntos: ${filters.minPoints}+`);
    } else if (filters.maxPoints !== '') {
      activeFilters.push(`Puntos: -${filters.maxPoints}`);
    }
    
    // Peso
    if (filters.minWeight !== '' && filters.maxWeight !== '') {
      activeFilters.push(`Peso: ${filters.minWeight}-${filters.maxWeight}kg`);
    } else if (filters.minWeight !== '') {
      activeFilters.push(`Peso: ${filters.minWeight}+kg`);
    } else if (filters.maxWeight !== '') {
      activeFilters.push(`Peso: -${filters.maxWeight}kg`);
    }
    
    // Accesorios
    if (filters.hasAccessories === true) {
      activeFilters.push('Con accesorios');
    } else if (filters.hasAccessories === false) {
      activeFilters.push('Sin accesorios');
    }
    
    return activeFilters;
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
      
      Alert.alert(
        'Agregado al carrito',
        `${item.title} se agregó al carrito`,
        [{ text: 'OK' }]
      );
    } else {
      // Si no existe, agregar nuevo item
      const newItem = { ...item, quantity: 1 };
      setCart([...cart, newItem]);
      
      Alert.alert(
        'Agregado al carrito',
        `${item.title} se agregó al carrito`,
        [{ text: 'OK' }]
      );
    }
  };

  const removeFromCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem && existingItem.quantity > 1) {
      // Si hay más de 1, disminuir cantidad
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      // Si hay solo 1, eliminar del carrito
      setCart(cart.filter(cartItem => cartItem.id !== item.id));
    }
    
    Alert.alert(
      'Eliminado del carrito',
      `${item.title} se eliminó del carrito`,
      [{ text: 'OK' }]
    );
  };

  const isInCart = (item) => {
    return cart.some(cartItem => cartItem.id === item.id);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotalPoints = () => {
    return cart.reduce((total, item) => total + (item.pointsPrice * item.quantity), 0);
  };

  // Función para remover completamente un item del carrito
  const removeItemFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Función para canjear publicaciones
  const handleExchange = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'No hay publicaciones en el carrito');
      return;
    }

    const totalPoints = getCartTotalPoints();
    if (totalPoints > userPoints) {
      Alert.alert(
        'Puntos insuficientes', 
        `Necesitas ${totalPoints} puntos pero solo tienes ${userPoints} puntos disponibles`
      );
      return;
    }

    Alert.alert(
      'Confirmar canje',
      `¿Estás seguro de que quieres canjear estos ${cart.length} artículos por ${totalPoints} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Canjear', 
          onPress: async () => {
            setIsLoading(true);
            try {
              // Aquí iría la lógica para procesar el canje
              // Por ahora simularemos el éxito
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert(
                '¡Canje exitoso!',
                `Has canjeado ${cart.length} artículos por ${totalPoints} puntos`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setCart([]); // Limpiar carrito
                      setShowCartModal(false); // Cerrar modal
                      // Actualizar puntos del usuario (aquí deberías llamar a la API)
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo procesar el canje. Intenta nuevamente.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      // Simulando carga de equipos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEquipment = [
        {
          id: 1,
          title: 'Laptop HP Pavilion',
          brand: 'HP',
          pointsPrice: 150,
          image: getImageByCategory(1),
          category: 'computadoras',
          categoryId: 1,
          stateId: 1,
          shipping: 'Calle 123, Medellín',
          installments: '',
          description: 'Laptop en excelente estado, ideal para trabajo y estudio',
          weight: 2.5,
          dimensions: '35x25x2 cm',
          accessories: 'Cargador incluido',
          state: 'Excelente',
          categoryName: 'Computadoras',
          owner: 'María García',
          dateAdded: '2024-01-15'
        },
        {
          id: 2,
          title: 'iPhone 12',
          brand: 'Apple',
          pointsPrice: 200,
          image: getImageByCategory(2),
          category: 'teléfonos',
          categoryId: 2,
          stateId: 2,
          shipping: 'Carrera 45, Bogotá',
          installments: '',
          description: 'iPhone en buen estado, batería al 85%',
          weight: 0.2,
          dimensions: '15x7x1 cm',
          accessories: 'Cargador y audífonos',
          state: 'Bueno',
          categoryName: 'Teléfonos',
          owner: 'Carlos López',
          dateAdded: '2024-01-20'
        },
        {
          id: 3,
          title: 'Tablet Samsung Galaxy',
          brand: 'Samsung',
          pointsPrice: 120,
          image: getImageByCategory(3),
          category: 'tablets',
          categoryId: 3,
          stateId: 1,
          shipping: 'Avenida 80, Cali',
          installments: '',
          description: 'Tablet perfecta para entretenimiento',
          weight: 0.5,
          dimensions: '25x17x1 cm',
          accessories: 'Cargador y funda',
          state: 'Excelente',
          categoryName: 'Tablets',
          owner: 'Ana Rodríguez',
          dateAdded: '2024-01-25'
        }
      ];
      
      setAllEquipment(mockEquipment);
      setEquipment(mockEquipment);
    } catch (error) {
      console.error('Error loading equipment:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    
    if (text.trim() === '') {
      // Si no hay texto, mostrar todos los equipos
      setEquipment([...allEquipment]);
    } else {
      // Filtrar equipos por texto de búsqueda
      const filteredEquipment = allEquipment.filter(item => {
        const searchText = text.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.brand.toLowerCase().includes(searchText) ||
          item.description.toLowerCase().includes(searchText) ||
          item.categoryName.toLowerCase().includes(searchText)
        );
      });
      setEquipment(filteredEquipment);
    }
  };

  const applyFilters = () => {
    // Aplicar filtros a los equipos originales
    let filteredEquipment = [...allEquipment];
    
    // Filtrar por categoría
    if (filters.selectedCategory !== null) {
      filteredEquipment = filteredEquipment.filter(item => 
        item.categoryId === filters.selectedCategory
      );
    }
    
    // Filtrar por estado
    if (filters.selectedState !== null) {
      filteredEquipment = filteredEquipment.filter(item => 
        item.stateId === filters.selectedState
      );
    }
    
    // Filtrar por puntos mínimo
    if (filters.minPoints !== '') {
      const minPoints = parseInt(filters.minPoints);
      filteredEquipment = filteredEquipment.filter(item => 
        item.pointsPrice >= minPoints
      );
    }
    
    // Filtrar por puntos máximo
    if (filters.maxPoints !== '') {
      const maxPoints = parseInt(filters.maxPoints);
      filteredEquipment = filteredEquipment.filter(item => 
        item.pointsPrice <= maxPoints
      );
    }
    
    // Filtrar por peso mínimo
    if (filters.minWeight !== '') {
      const minWeight = parseFloat(filters.minWeight);
      filteredEquipment = filteredEquipment.filter(item => 
        item.weight >= minWeight
      );
    }
    
    // Filtrar por peso máximo
    if (filters.maxWeight !== '') {
      const maxWeight = parseFloat(filters.maxWeight);
      filteredEquipment = filteredEquipment.filter(item => 
        item.weight <= maxWeight
      );
    }
    
    // Filtrar por accesorios
    if (filters.hasAccessories !== null) {
      filteredEquipment = filteredEquipment.filter(item => {
        if (filters.hasAccessories === true) {
          return item.accessories && item.accessories.trim() !== '';
        } else {
          return !item.accessories || item.accessories.trim() === '';
        }
      });
    }
    
    // Aplicar búsqueda de texto si existe
    if (searchText.trim() !== '') {
      const searchTextLower = searchText.toLowerCase();
      filteredEquipment = filteredEquipment.filter(item => 
        item.title.toLowerCase().includes(searchTextLower) ||
        item.brand.toLowerCase().includes(searchTextLower) ||
        item.description.toLowerCase().includes(searchTextLower) ||
        item.categoryName.toLowerCase().includes(searchTextLower)
      );
    }
    
    setEquipment(filteredEquipment);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      selectedCategory: null,
      selectedState: null,
      minPoints: '',
      maxPoints: '',
      minWeight: '',
      maxWeight: '',
      hasAccessories: null
    });
    setSearchText(''); // Limpiar también la búsqueda
    // Mostrar todos los equipos originales sin filtros
    setEquipment([...allEquipment]);
    setShowFilterModal(false);
  };

  const handleRedeem = (item) => {
    if (userPoints < item.pointsPrice) {
      Alert.alert(
        'Puntos insuficientes',
        `Necesitas ${item.pointsPrice} puntos para canjear este artículo. Tienes ${userPoints} puntos.`
      );
      return;
    }

    Alert.alert(
      'Confirmar canje',
      `¿Deseas canjear ${item.title} por ${item.pointsPrice} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Canjear', 
          onPress: () => {
            // Aquí implementarías la lógica de canje
            Alert.alert('Éxito', '¡Artículo canjeado exitosamente!');
          }
        }
      ]
    );
  };

  const renderEquipmentCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: themeColors.surface }]}
      onPress={() => handleRedeem(item)}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} />
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            { backgroundColor: themeColors.primary },
            isInCart(item) && styles.removeFromCartButton
          ]}
          onPress={() => isInCart(item) ? removeFromCart(item) : addToCart(item)}
        >
          <Ionicons 
            name={isInCart(item) ? "close" : "cart-outline"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: themeColors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.brandContainer}>
          <Text style={[styles.brandName, { color: themeColors.primary }]}>{item.category}</Text>
        </View>
        
        <View style={styles.stateContainer}>
          {getStateIcon(item.state)}
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>{item.state}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.pointsPrice, { color: themeColors.primary }]}>{item.pointsPrice} puntos</Text>
        </View>
        
        <Text style={[styles.shipping, { color: themeColors.primary }]}>{item.shipping}</Text>
      </View>
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
                Puntos: <Text style={[styles.sidebarPointsValue, { color: themeColors.primary }]}>{userPoints}</Text>
              </Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.sidebarMenu}>
              {renderSidebarItem('Inicio', 'home-outline', undefined, () => {
                setSidebarVisible(false);
                handleActionPress('home');
              })}
              {renderSidebarItem('Ver Estadísticas', 'bar-chart-outline', undefined, () => {
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

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
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
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Tienda de Canjes</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadEquipment}>
              <Ionicons name="refresh" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cartButton} 
              onPress={() => setShowCartModal(true)}
            >
              <Ionicons name="cart" size={24} color={themeColors.text} />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
            Canjea tus puntos por equipos electrónicos disponibles
          </Text>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Buscar equipos..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>
        
        {/* User Points */}
        <View style={[styles.pointsContainer, { backgroundColor: themeColors.card }]}>
          <Ionicons name="star" size={20} color={themeColors.primary} />
          <Text style={[styles.pointsText, { color: themeColors.text }]}>Tienes {userPoints} puntos disponibles</Text>
        </View>
      </View>

      {/* Filter Button */}
      <View style={[styles.filterButtonContainer, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: themeColors.primary }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="white" />
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
        
        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <View style={[styles.activeFiltersContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.primary }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.activeFiltersScroll}
            >
              {getActiveFiltersList().map((filter, index) => (
                <View key={index} style={[styles.activeFilterTag, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.activeFilterText}>{filter}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={clearFilters} style={[styles.clearFiltersButton, { backgroundColor: themeColors.card }]}>
              <Ionicons name="close" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Equipment List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>Cargando equipos...</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderEquipmentCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[styles.equipmentList, { backgroundColor: themeColors.background }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.modalBody, { backgroundColor: themeColors.surface }]}>
              {/* Categoría */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.text }]}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        { backgroundColor: themeColors.card, borderColor: themeColors.border },
                        filters.selectedCategory === null && [styles.selectedOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                      ]}
                      onPress={() => setFilters({...filters, selectedCategory: null})}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: themeColors.text },
                        filters.selectedCategory === null && [styles.selectedOptionText, { color: 'white' }]
                      ]}>
                        Todas
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.optionButton,
                          { backgroundColor: themeColors.card, borderColor: themeColors.border },
                          filters.selectedCategory === category.id && [styles.selectedOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                        ]}
                        onPress={() => setFilters({...filters, selectedCategory: category.id})}
                      >
                        <Text style={[
                          styles.optionText,
                          { color: themeColors.text },
                          filters.selectedCategory === category.id && [styles.selectedOptionText, { color: 'white' }]
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Estado */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.text }]}>Estado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filters.selectedState === null && [styles.selectedOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                      ]}
                      onPress={() => setFilters({...filters, selectedState: null})}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: themeColors.text },
                        filters.selectedState === null && [styles.selectedOptionText, { color: 'white' }]
                      ]}>
                        Todos
                      </Text>
                    </TouchableOpacity>
                    {states.map((state) => (
                      <TouchableOpacity
                        key={state.id}
                        style={[
                          styles.optionButton,
                          { backgroundColor: themeColors.card, borderColor: themeColors.border },
                          filters.selectedState === state.id && [styles.selectedOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                        ]}
                        onPress={() => setFilters({...filters, selectedState: state.id})}
                      >
                        <Text style={[
                          styles.optionText,
                          { color: themeColors.text },
                          filters.selectedState === state.id && [styles.selectedOptionText, { color: 'white' }]
                        ]}>
                          {state.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Puntos */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.text }]}>Puntos</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={[styles.rangeLabel, { color: themeColors.text }]}>Mínimo</Text>
                    <TextInput
                      style={[styles.rangeTextInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                      placeholder="0"
                      placeholderTextColor={themeColors.textSecondary}
                      value={filters.minPoints}
                      onChangeText={(text) => setFilters({...filters, minPoints: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={[styles.rangeLabel, { color: themeColors.text }]}>Máximo</Text>
                    <TextInput
                      style={[styles.rangeTextInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                      placeholder="1000"
                      placeholderTextColor={themeColors.textSecondary}
                      value={filters.maxPoints}
                      onChangeText={(text) => setFilters({...filters, maxPoints: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Peso */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.text }]}>Peso (kg)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={[styles.rangeLabel, { color: themeColors.text }]}>Mínimo</Text>
                    <TextInput
                      style={[styles.rangeTextInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                      placeholder="0"
                      placeholderTextColor={themeColors.textSecondary}
                      value={filters.minWeight}
                      onChangeText={(text) => setFilters({...filters, minWeight: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={[styles.rangeLabel, { color: themeColors.text }]}>Máximo</Text>
                    <TextInput
                      style={[styles.rangeTextInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                      placeholder="50"
                      placeholderTextColor={themeColors.textSecondary}
                      value={filters.maxWeight}
                      onChangeText={(text) => setFilters({...filters, maxWeight: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Accesorios */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.text }]}>Accesorios</Text>
                <View style={styles.accessoriesContainer}>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      filters.hasAccessories === null && [styles.selectedAccessoryOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: null})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      { color: themeColors.text },
                      filters.hasAccessories === null && [styles.selectedAccessoryText, { color: 'white' }]
                    ]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      { backgroundColor: themeColors.card, borderColor: themeColors.border },
                      filters.hasAccessories === true && [styles.selectedAccessoryOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: true})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      { color: themeColors.text },
                      filters.hasAccessories === true && [styles.selectedAccessoryText, { color: 'white' }]
                    ]}>
                      Con accesorios
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      { backgroundColor: themeColors.card, borderColor: themeColors.border },
                      filters.hasAccessories === false && [styles.selectedAccessoryOption, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: false})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      { color: themeColors.text },
                      filters.hasAccessories === false && [styles.selectedAccessoryText, { color: 'white' }]
                    ]}>
                      Sin accesorios
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
              <TouchableOpacity style={[styles.clearButton, { backgroundColor: themeColors.card }]} onPress={clearFilters}>
                <Text style={[styles.clearButtonText, { color: themeColors.textSecondary }]}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyButton, { backgroundColor: themeColors.primary }]} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal del Carrito - Nuevo Diseño */}
      <Modal
        visible={showCartModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCartModal(false)}
      >
        <View style={[styles.newModalOverlay, { backgroundColor: themeColors.overlay }]}>
          <View style={[styles.newCartModal, { backgroundColor: themeColors.surface }]}>
            {/* Header */}
            <View style={[styles.newModalHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.newModalTitle, { color: themeColors.text }]}>Mi Carrito</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCartModal(false)}
              >
                <Ionicons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Contenido */}
            <View style={styles.newModalContent}>
              {cart.length === 0 ? (
                <View style={styles.newEmptyCart}>
                  <Ionicons name="cart-outline" size={80} color={themeColors.textSecondary} />
                  <Text style={[styles.newEmptyText, { color: themeColors.text }]}>Tu carrito está vacío</Text>
                  <Text style={[styles.newEmptySubtext, { color: themeColors.textSecondary }]}>Agrega publicaciones para canjear</Text>
                </View>
              ) : (
                <ScrollView 
                  style={styles.newScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {cart.map((item) => (
                    <View key={item.id} style={[styles.newCartItem, { borderBottomColor: themeColors.border }]}>
                      <Image source={item.image} style={styles.newItemImage} />
                      <View style={styles.newItemDetails}>
                        <Text style={[styles.newItemTitle, { color: themeColors.text }]}>{item.title}</Text>
                        <Text style={[styles.newItemBrand, { color: themeColors.textSecondary }]}>{item.brand}</Text>
                        <Text style={[styles.newItemPoints, { color: themeColors.primary }]}>{item.pointsPrice} puntos</Text>
                        <Text style={[styles.newItemLocation, { color: themeColors.textSecondary }]}>{item.shipping}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.newRemoveButton}
                        onPress={() => removeItemFromCart(item.id)}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Footer - Solo si hay items */}
            {cart.length > 0 && (
              <View style={[styles.newModalFooter, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
                <View style={styles.newTotalRow}>
                  <Text style={[styles.newTotalLabel, { color: themeColors.text }]}>Total:</Text>
                  <Text style={[styles.newTotalAmount, { color: themeColors.primary }]}>{getCartTotalPoints()} puntos</Text>
                </View>
                
                <View style={styles.newButtonRow}>
                  <TouchableOpacity 
                    style={[styles.newClearButton, { borderColor: '#ff4444' }]}
                    onPress={() => setCart([])}
                  >
                    <Text style={styles.newClearText}>Limpiar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.newExchangeButton,
                      { backgroundColor: themeColors.primary },
                      getCartTotalPoints() > userPoints && styles.newExchangeDisabled
                    ]}
                    onPress={handleExchange}
                    disabled={getCartTotalPoints() > userPoints || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.newExchangeText}>Canjear</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {getCartTotalPoints() > userPoints && (
                  <Text style={styles.newWarningText}>
                    Puntos insuficientes (necesitas {getCartTotalPoints() - userPoints} más)
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  refreshButton: {
    padding: 5,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: -13,
  },
  pointsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButtonContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
  },
  activeFiltersScroll: {
    flex: 1,
  },
  activeFilterTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  clearFiltersButton: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 4,
    marginLeft: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedCategoryFilter: {
    backgroundColor: '#4CAF50',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  filterOptionsContainer: {
    marginTop: 10,
  },
  filterOptionsList: {
    paddingHorizontal: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  equipmentList: {
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 5,
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImageContainer: {
    position: 'relative',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  addToCartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFromCartButton: {
    backgroundColor: '#F44336', // Rojo para eliminar
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stateText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: 8,
  },
  pointsPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  installments: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  shipping: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  rangeTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  accessoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  selectedAccessoryOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  accessoryText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  selectedAccessoryText: {
    color: 'white',
    fontWeight: '600',
  },
  // Estilos del Modal del Carrito
  cartModal: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 15,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cartModalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 10,
  },
  cartScrollContent: {
    flexGrow: 1,
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 15,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  cartItemBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  cartItemPoints: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 3,
  },
  cartItemLocation: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  removeItemButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 0,
    backgroundColor: 'white',
  },
  cartTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartTotalPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearCartButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearCartButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  exchangeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  exchangeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  insufficientPointsText: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  // Nuevos estilos del modal
  newModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  newCartModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
  },
  newModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  newModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  newModalContent: {
    flex: 1,
  },
  newEmptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  newEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  newEmptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  newScrollView: {
    flex: 1,
  },
  newCartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  newItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#f8f8f8',
  },
  newItemDetails: {
    flex: 1,
  },
  newItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  newItemBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  newItemPoints: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 3,
  },
  newItemLocation: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  newRemoveButton: {
    backgroundColor: '#ff4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  newTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  newTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  newTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  newButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  newClearButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  newClearText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  newExchangeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  newExchangeDisabled: {
    backgroundColor: '#cccccc',
  },
  newExchangeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  newWarningText: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // Sidebar styles
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.75,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
