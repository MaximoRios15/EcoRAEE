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

export default function LocationsAdminScreen({ navigation }) {
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
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    Direccion_Ubicaciones: '',
    NroCalle_Ubicaciones: '',
    Provincia_Ubicaciones: '',
    Municipios_Ubicaciones: '',
    Latitud_Ubicaciones: '',
    Longitud_Ubicaciones: '',
    Estado_Ubicaciones: ''
  });

  useEffect(() => {
    loadThemePreference();
    loadLocations();
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

  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

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

  const loadLocations = async () => {
    setLocationsLoading(true);
    try {
      // Datos mock para diseño UX/UI
      setTimeout(() => {
        setLocations([
          {
            idUbicaciones: 1,
            Direccion_Ubicaciones: 'Av. Corrientes',
            NroCalle_Ubicaciones: '1234',
            Provincia_Ubicaciones: 'Buenos Aires',
            Municipios_Ubicaciones: 'CABA',
            Latitud_Ubicaciones: '-34.6037',
            Longitud_Ubicaciones: '-58.3816',
            Estado_Ubicaciones: 'Activo'
          },
          {
            idUbicaciones: 2,
            Direccion_Ubicaciones: 'Calle San Martín',
            NroCalle_Ubicaciones: '567',
            Provincia_Ubicaciones: 'Buenos Aires',
            Municipios_Ubicaciones: 'La Plata',
            Latitud_Ubicaciones: '-34.9214',
            Longitud_Ubicaciones: '-57.9544',
            Estado_Ubicaciones: 'Activo'
          },
          {
            idUbicaciones: 3,
            Direccion_Ubicaciones: 'Av. Libertador',
            NroCalle_Ubicaciones: '890',
            Provincia_Ubicaciones: 'Córdoba',
            Municipios_Ubicaciones: 'Córdoba Capital',
            Latitud_Ubicaciones: '-31.4201',
            Longitud_Ubicaciones: '-64.1888',
            Estado_Ubicaciones: 'Inactivo'
          }
        ]);
        setLocationsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLocationsLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Ubicación creada correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadLocations();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating location:', error);
      Alert.alert('Error', 'No se pudo crear la ubicación');
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Ubicación actualizada correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadLocations();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'No se pudo actualizar la ubicación');
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = (location) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la ubicación "${location.Direccion_Ubicaciones}"?`,
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
                Alert.alert('Éxito', 'Ubicación eliminada correctamente (Demo)');
                loadLocations();
                setIsLoading(false);
              }, 1000);
            } catch (error) {
              console.error('Error deleting location:', error);
              Alert.alert('Error', 'No se pudo eliminar la ubicación');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setFormData({
      Direccion_Ubicaciones: location.Direccion_Ubicaciones || '',
      NroCalle_Ubicaciones: location.NroCalle_Ubicaciones || '',
      Provincia_Ubicaciones: location.Provincia_Ubicaciones || '',
      Municipios_Ubicaciones: location.Municipios_Ubicaciones || '',
      Latitud_Ubicaciones: location.Latitud_Ubicaciones || '',
      Longitud_Ubicaciones: location.Longitud_Ubicaciones || '',
      Estado_Ubicaciones: location.Estado_Ubicaciones || ''
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingLocation(null);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      Direccion_Ubicaciones: '',
      NroCalle_Ubicaciones: '',
      Provincia_Ubicaciones: '',
      Municipios_Ubicaciones: '',
      Latitud_Ubicaciones: '',
      Longitud_Ubicaciones: '',
      Estado_Ubicaciones: ''
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

  const renderLocationModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </Text>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Dirección"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Direccion_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Direccion_Ubicaciones: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Número de calle"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.NroCalle_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, NroCalle_Ubicaciones: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Provincia"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Provincia_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Provincia_Ubicaciones: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Municipio"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Municipios_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Municipios_Ubicaciones: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Latitud"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Latitud_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Latitud_Ubicaciones: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Longitud"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Longitud_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Longitud_Ubicaciones: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Estado (Activo/Inactivo)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Estado_Ubicaciones}
                onChangeText={(value) => setFormData({...formData, Estado_Ubicaciones: value})}
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
                  onPress={editingLocation ? handleUpdateLocation : handleCreateLocation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingLocation ? 'Actualizar' : 'Crear'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (locationsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Cargando ubicaciones...
        </Text>
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
            <Text style={[styles.appName, { color: themeColors.text }]}>Gestión Ubicaciones</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Ubicaciones Sistema</Text>
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

        {/* Locations Table */}
        <View style={[styles.tableContainer, { backgroundColor: themeColors.surface }]}>
          <View style={[styles.tableHeader, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Dirección</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Nro Calle</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Provincia</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Municipio</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Acciones</Text>
          </View>

          {locations.map((location, index) => (
            <View 
              key={location.idUbicaciones} 
              style={[
                styles.tableRow, 
                { backgroundColor: index % 2 === 0 ? themeColors.card : 'transparent' }
              ]}
            >
              <Text style={[styles.tableCell, styles.addressCell, { color: themeColors.text }]}>
                {location.Direccion_Ubicaciones || 'Sin dirección'}
              </Text>
              <Text style={[styles.tableCell, styles.numberCell, { color: themeColors.text }]}>
                {location.NroCalle_Ubicaciones || 'N/A'}
              </Text>
              <Text style={[styles.tableCell, styles.provinceCell, { color: themeColors.text }]}>
                {location.Provincia_Ubicaciones || 'Sin provincia'}
              </Text>
              <Text style={[styles.tableCell, styles.municipalityCell, { color: themeColors.text }]}>
                {location.Municipios_Ubicaciones || 'Sin municipio'}
              </Text>
              <View style={styles.actionsCell}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(location)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteLocation(location)}
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
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>Gestión de Ubicaciones</Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Administra las ubicaciones de recolección de equipos electrónicos. Cada ubicación incluye dirección, coordenadas geográficas y información de contacto para facilitar el acceso de los usuarios.
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Modal */}
      {renderLocationModal()}
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
  content: {
    flex: 1,
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
  addressCell: {
    textAlign: 'left',
    fontSize: 10,
  },
  numberCell: {
    textAlign: 'center',
    fontSize: 12,
  },
  provinceCell: {
    textAlign: 'left',
    fontSize: 10,
  },
  municipalityCell: {
    textAlign: 'left',
    fontSize: 10,
  },
  statusCell: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    padding: 6,
    marginHorizontal: 3,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButtonText: {
    fontSize: 16,
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
  modalScrollView: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
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
    height: 60,
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
