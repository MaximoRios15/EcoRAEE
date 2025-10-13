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
  Dimensions,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function CategoriesAdminScreen({ navigation }) {
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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    Nombre_Categorias: '',
    Descripcion_Categorias: '',
    PuntosBase_Categorias: '',
    Multiplicador_Categorias: ''
  });

  useEffect(() => {
    loadThemePreference();
    loadCategories();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
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

  // Cargar categorías (datos mock para diseño)
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Datos mock para diseño UX/UI
      setTimeout(() => {
        setCategories([
          {
            ID_Categorias: 1,
            Nombre_Categorias: 'Smartphones',
            Descripcion_Categorias: 'Teléfonos inteligentes y accesorios',
            PuntosBase_Categorias: 50,
            Multiplicador_Categorias: 1.5
          },
          {
            ID_Categorias: 2,
            Nombre_Categorias: 'Laptops',
            Descripcion_Categorias: 'Computadoras portátiles',
            PuntosBase_Categorias: 100,
            Multiplicador_Categorias: 2.0
          },
          {
            ID_Categorias: 3,
            Nombre_Categorias: 'Tablets',
            Descripcion_Categorias: 'Tabletas y dispositivos similares',
            PuntosBase_Categorias: 75,
            Multiplicador_Categorias: 1.8
          },
          {
            ID_Categorias: 4,
            Nombre_Categorias: 'Monitores',
            Descripcion_Categorias: 'Pantallas y monitores',
            PuntosBase_Categorias: 80,
            Multiplicador_Categorias: 1.6
          },
          {
            ID_Categorias: 5,
            Nombre_Categorias: 'Teclados',
            Descripcion_Categorias: 'Teclados y mouse',
            PuntosBase_Categorias: 25,
            Multiplicador_Categorias: 1.2
          }
        ]);
        setCategoriesLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesLoading(false);
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

  const handleCreateCategory = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Categoría creada correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadCategories();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'No se pudo crear la categoría');
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Categoría actualizada correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadCategories();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'No se pudo actualizar la categoría');
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${category.Nombre_Categorias}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Simular operación para diseño UX/UI
              setTimeout(() => {
                Alert.alert('Éxito', 'Categoría eliminada correctamente (Demo)');
                loadCategories();
                setIsLoading(false);
              }, 1000);
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'No se pudo eliminar la categoría');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      Nombre_Categorias: category.Nombre_Categorias,
      Descripcion_Categorias: category.Descripcion_Categorias || '',
      PuntosBase_Categorias: category.PuntosBase_Categorias?.toString() || '',
      Multiplicador_Categorias: category.Multiplicador_Categorias?.toString() || ''
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCategory(null);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      Nombre_Categorias: '',
      Descripcion_Categorias: '',
      PuntosBase_Categorias: '',
      Multiplicador_Categorias: ''
    });
  };

  const renderSidebarItem = (title, icon, onPress) => (
    <TouchableOpacity style={[styles.sidebarItem, { backgroundColor: themeColors.card }]} onPress={onPress}>
      <Text style={styles.sidebarIcon}>{icon}</Text>
      <Text style={[styles.sidebarText, { color: themeColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

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


  const renderCategoryModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Nombre de la categoría"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.Nombre_Categorias}
              onChangeText={(value) => setFormData({...formData, Nombre_Categorias: value})}
            />

            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Descripción"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.Descripcion_Categorias}
              onChangeText={(value) => setFormData({...formData, Descripcion_Categorias: value})}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Puntos base"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.PuntosBase_Categorias}
              onChangeText={(value) => setFormData({...formData, PuntosBase_Categorias: value})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Multiplicador"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.Multiplicador_Categorias}
              onChangeText={(value) => setFormData({...formData, Multiplicador_Categorias: value})}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
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
                toggleTheme
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
            <Text style={[styles.appName, { color: themeColors.text }]}>Gestión Categorías</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Categorías Equipos</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={openCreateModal}
          >
            <LinearGradient
              colors={[themeColors.primary, '#45a049']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories Table */}
        <View style={[styles.tableContainer, { backgroundColor: themeColors.surface }]}>
          <View style={[styles.tableHeader, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Nombre</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Puntos Base</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Multiplicador</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Acciones</Text>
          </View>

          {categories.map((category, index) => (
            <View 
              key={category.ID_Categorias} 
              style={[
                styles.tableRow, 
                { backgroundColor: index % 2 === 0 ? themeColors.card : 'transparent' }
              ]}
            >
              <Text style={[styles.tableCell, styles.nameCell, { color: themeColors.text }]}>
                {category.Nombre_Categorias}
              </Text>
              <Text style={[styles.tableCell, { color: themeColors.text }]}>
                {category.PuntosBase_Categorias || 'N/A'}
              </Text>
              <Text style={[styles.tableCell, { color: themeColors.text }]}>
                {category.Multiplicador_Categorias || 'N/A'}
              </Text>
              <View style={styles.actionsCell}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(category)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.infoCard}
        >
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>Gestión de Categorías</Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Administra las categorías de equipos electrónicos. Cada categoría tiene puntos base y un multiplicador que determina la puntuación final del usuario.
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Modal */}
      {renderCategoryModal()}
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
  // Content styles
  headerSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
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
  addButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tableContainer: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableCell: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  nameCell: {
    textAlign: 'left',
    fontWeight: '500',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButtonText: {
    fontSize: 18,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});