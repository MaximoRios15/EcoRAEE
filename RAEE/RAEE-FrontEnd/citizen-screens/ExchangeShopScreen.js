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
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columnas con margen

export default function ExchangeShopScreen({ navigation }) {
  const { user } = useAuth();
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
  }, []);

  const loadCategories = async () => {
    try {
      const response = await ApiService.getCategories();
      
      if (response.success && response.data) {
        const transformedCategories = response.data.map(category => ({
          id: category.idCategorias,
          name: category.Nombres_Categorias
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStates = async () => {
    try {
      const response = await ApiService.getStates();
      
      if (response.success && response.data) {
        const transformedStates = response.data.map(state => ({
          id: state.idEstados,
          name: state.Nombres_Estados
        }));
        setStates(transformedStates);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const getImageByCategory = (categoryId) => {
    const imageMap = {
      1: require('../img/perfil1animal.png'),
      2: require('../img/perfil2animal.png'),
      3: require('../img/perfil3animal.png'),
      4: require('../img/perfil4animal.png'),
      5: require('../img/perfil5animal.png'),
    };
    return imageMap[categoryId] || require('../img/perfil1animal.png');
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
    console.log('Adding to cart:', item);
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
      console.log('New item to add:', newItem);
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
      // Cargar publicaciones reales desde la base de datos
      const response = await ApiService.getAllEquipment();
      
      if (response.success && response.data) {
        // Transformar los datos de las publicaciones al formato esperado por la UI
        const transformedEquipment = response.data.map((item, index) => {
          return {
            id: item.idPublicacion,
            title: item.Titulo_Publicacion || `${item.Marca_Equipos} ${item.Modelo_Equipos || ''}`.trim(),
            brand: item.Marca_Equipos,
            pointsPrice: item.Puntos_Publicacion,
            image: getImageByCategory(item.idCategorias),
            category: item.Nombres_Categorias?.toLowerCase() || 'otros',
            categoryId: item.idCategorias, // ID para filtrado
            stateId: item.idEstados, // ID para filtrado por estado
            shipping: item.Direccion_Ubicaciones && item.Municipios_Ubicaciones 
              ? `${item.Direccion_Ubicaciones}, ${item.Municipios_Ubicaciones}`
              : 'Ubicación no disponible',
            installments: `Puedes canjear con ${item.Puntos_Publicacion} puntos`,
            description: item.Descripcion_Publicacion || item.Descripcion_Equipos || '',
            weight: item.PesoKG_Equipos,
            dimensions: item.DimencionesCM_Equipos,
            accessories: item.Accesorios_Equipos,
            state: item.Nombres_Estados,
            categoryName: item.Nombres_Categorias,
            owner: `${item.Nombres_Usuarios} ${item.Apellidos_Usuarios}`,
            dateAdded: item.Fecha_Publicacion
          };
        });
        
        setAllEquipment(transformedEquipment); // Guardar equipos originales
        setEquipment(transformedEquipment); // Mostrar todos los equipos inicialmente
      } else {
        Alert.alert('Error', response.message || 'No se pudieron cargar los equipos');
      }
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
      style={styles.productCard}
      onPress={() => handleRedeem(item)}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} />
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            isInCart(item) && styles.removeFromCartButton
          ]}
          onPress={() => isInCart(item) ? removeFromCart(item) : addToCart(item)}
        >
          <Ionicons 
            name={isInCart(item) ? "close" : "add"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>{item.brand}</Text>
          {getStateIcon(item.state)}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.pointsPrice}>{item.pointsPrice} puntos</Text>
        </View>
        
        <Text style={styles.installments}>{item.installments}</Text>
        <Text style={styles.shipping}>{item.shipping}</Text>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tienda de Canjes</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadEquipment}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cartButton} 
              onPress={() => setShowCartModal(true)}
            >
              <Ionicons name="cart" size={24} color="white" />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar equipos..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>
        
        {/* User Points */}
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={20} color="#4CAF50" />
          <Text style={styles.pointsText}>Tienes {userPoints} puntos disponibles</Text>
        </View>
      </View>

      {/* Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="white" />
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
        
        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.activeFiltersScroll}
            >
              {getActiveFiltersList().map((filter, index) => (
                <View key={index} style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>{filter}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Equipment List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando equipos...</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderEquipmentCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.equipmentList}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Categoría */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filters.selectedCategory === null && styles.selectedOption
                      ]}
                      onPress={() => setFilters({...filters, selectedCategory: null})}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.selectedCategory === null && styles.selectedOptionText
                      ]}>
                        Todas
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.optionButton,
                          filters.selectedCategory === category.id && styles.selectedOption
                        ]}
                        onPress={() => setFilters({...filters, selectedCategory: category.id})}
                      >
                        <Text style={[
                          styles.optionText,
                          filters.selectedCategory === category.id && styles.selectedOptionText
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
                <Text style={styles.filterLabel}>Estado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filters.selectedState === null && styles.selectedOption
                      ]}
                      onPress={() => setFilters({...filters, selectedState: null})}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.selectedState === null && styles.selectedOptionText
                      ]}>
                        Todos
                      </Text>
                    </TouchableOpacity>
                    {states.map((state) => (
                      <TouchableOpacity
                        key={state.id}
                        style={[
                          styles.optionButton,
                          filters.selectedState === state.id && styles.selectedOption
                        ]}
                        onPress={() => setFilters({...filters, selectedState: state.id})}
                      >
                        <Text style={[
                          styles.optionText,
                          filters.selectedState === state.id && styles.selectedOptionText
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
                <Text style={styles.filterLabel}>Puntos</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="0"
                      value={filters.minPoints}
                      onChangeText={(text) => setFilters({...filters, minPoints: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Máximo</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="1000"
                      value={filters.maxPoints}
                      onChangeText={(text) => setFilters({...filters, maxPoints: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Peso */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Peso (kg)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="0"
                      value={filters.minWeight}
                      onChangeText={(text) => setFilters({...filters, minWeight: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Máximo</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="50"
                      value={filters.maxWeight}
                      onChangeText={(text) => setFilters({...filters, maxWeight: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Accesorios */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Accesorios</Text>
                <View style={styles.accessoriesContainer}>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      filters.hasAccessories === null && styles.selectedAccessoryOption
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: null})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      filters.hasAccessories === null && styles.selectedAccessoryText
                    ]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      filters.hasAccessories === true && styles.selectedAccessoryOption
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: true})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      filters.hasAccessories === true && styles.selectedAccessoryText
                    ]}>
                      Con accesorios
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accessoryOption,
                      filters.hasAccessories === false && styles.selectedAccessoryOption
                    ]}
                    onPress={() => setFilters({...filters, hasAccessories: false})}
                  >
                    <Text style={[
                      styles.accessoryText,
                      filters.hasAccessories === false && styles.selectedAccessoryText
                    ]}>
                      Sin accesorios
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
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
        <View style={styles.newModalOverlay}>
          <View style={styles.newCartModal}>
            {/* Header */}
            <View style={styles.newModalHeader}>
              <Text style={styles.newModalTitle}>Mi Carrito</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCartModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Contenido */}
            <View style={styles.newModalContent}>
              {cart.length === 0 ? (
                <View style={styles.newEmptyCart}>
                  <Ionicons name="cart-outline" size={80} color="#ddd" />
                  <Text style={styles.newEmptyText}>Tu carrito está vacío</Text>
                  <Text style={styles.newEmptySubtext}>Agrega publicaciones para canjear</Text>
                </View>
              ) : (
                <ScrollView 
                  style={styles.newScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {cart.map((item) => (
                    <View key={item.id} style={styles.newCartItem}>
                      <Image source={item.image} style={styles.newItemImage} />
                      <View style={styles.newItemDetails}>
                        <Text style={styles.newItemTitle}>{item.title}</Text>
                        <Text style={styles.newItemBrand}>{item.brand}</Text>
                        <Text style={styles.newItemPoints}>{item.pointsPrice} puntos</Text>
                        <Text style={styles.newItemLocation}>{item.shipping}</Text>
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
              <View style={styles.newModalFooter}>
                <View style={styles.newTotalRow}>
                  <Text style={styles.newTotalLabel}>Total:</Text>
                  <Text style={styles.newTotalAmount}>{getCartTotalPoints()} puntos</Text>
                </View>
                
                <View style={styles.newButtonRow}>
                  <TouchableOpacity 
                    style={styles.newClearButton}
                    onPress={() => setCart([])}
                  >
                    <Text style={styles.newClearText}>Limpiar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.newExchangeButton,
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
  headerTitle: {
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
    color: '#333',
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAccessoryOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  accessoryText: {
    fontSize: 14,
    color: '#666',
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
});
