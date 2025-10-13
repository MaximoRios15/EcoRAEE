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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function UsersAdminScreen({ navigation }) {
  // Datos simulados del usuario administrador
  const user = {
    idUsuarios: 1,
    Nombres_Usuarios: 'Admin',
    Apellidos_Usuarios: 'EcoRAEE',
    Correo_Usuarios: 'admin@ecoraee.com',
    Roles_Usuarios: '1'
  };

  // Función simulada de signOut
  const signOut = () => {
    console.log('Cerrando sesión...');
    navigation.navigate('Login');
  };
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    idUsuarios: '',
    DNI_Usuarios: '',
    Nombres_Usuarios: '',
    Apellidos_Usuarios: '',
    Password_Usuarios: '',
    Telefono_Usuarios: '',
    Email_Usuarios: '',
    Roles_Usuarios: '',
    Puntos_Usuarios: '',
    ImagenPerfil_Usuarios: '',
    FechaRegistro_Usuarios: '',
    Activo_Usuarios: '1',
    ubicaciones_Usuarios: ''
  });

  useEffect(() => {
    loadThemePreference();
    loadUsers();
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

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      // Datos mock para diseño UX/UI
      setTimeout(() => {
        setUsers([
          {
            idUsuarios: 1,
            DNI_Usuarios: '45026308',
            Nombres_Usuarios: 'Maximo Jesus',
            Apellidos_Usuarios: 'Rios',
            Password_Usuarios: 'password123',
            Telefono_Usuarios: '3765102868',
            Email_Usuarios: 'maximuz_ty@hotmail.com',
            Roles_Usuarios: '4',
            Puntos_Usuarios: 150,
            ImagenPerfil_Usuarios: 'profile1.jpg',
            FechaRegistro_Usuarios: '2024-01-15',
            Activo_Usuarios: '1',
            ubicaciones_Usuarios: 'Buenos Aires'
          },
          {
            idUsuarios: 2,
            DNI_Usuarios: '45053541',
            Nombres_Usuarios: 'Uruga',
            Apellidos_Usuarios: 'Azul',
            Password_Usuarios: 'password456',
            Telefono_Usuarios: '3764367492',
            Email_Usuarios: 'themagichest@gmail.com',
            Roles_Usuarios: '1',
            Puntos_Usuarios: 75,
            ImagenPerfil_Usuarios: 'profile2.jpg',
            FechaRegistro_Usuarios: '2024-02-20',
            Activo_Usuarios: '1',
            ubicaciones_Usuarios: 'Córdoba'
          },
          {
            idUsuarios: 3,
            DNI_Usuarios: '12345678',
            Nombres_Usuarios: 'María',
            Apellidos_Usuarios: 'González',
            Password_Usuarios: 'password789',
            Telefono_Usuarios: '3765123456',
            Email_Usuarios: 'maria.gonzalez@email.com',
            Roles_Usuarios: '2',
            Puntos_Usuarios: 200,
            ImagenPerfil_Usuarios: 'profile3.jpg',
            FechaRegistro_Usuarios: '2024-03-10',
            Activo_Usuarios: '1',
            ubicaciones_Usuarios: 'Santa Fe'
          },
          {
            idUsuarios: 4,
            DNI_Usuarios: '87654321',
            Nombres_Usuarios: 'Carlos',
            Apellidos_Usuarios: 'López',
            Password_Usuarios: 'password321',
            Telefono_Usuarios: '3765987654',
            Email_Usuarios: 'carlos.lopez@email.com',
            Roles_Usuarios: '3',
            Puntos_Usuarios: 50,
            ImagenPerfil_Usuarios: 'profile4.jpg',
            FechaRegistro_Usuarios: '2024-04-05',
            Activo_Usuarios: '0',
            ubicaciones_Usuarios: 'Mendoza'
          },
          {
            idUsuarios: 5,
            DNI_Usuarios: '11223344',
            Nombres_Usuarios: 'Ana',
            Apellidos_Usuarios: 'Martínez',
            Password_Usuarios: 'password654',
            Telefono_Usuarios: '3765112233',
            Email_Usuarios: 'ana.martinez@email.com',
            Roles_Usuarios: '1',
            Puntos_Usuarios: 300,
            ImagenPerfil_Usuarios: 'profile5.jpg',
            FechaRegistro_Usuarios: '2024-05-12',
            Activo_Usuarios: '1',
            ubicaciones_Usuarios: 'Tucumán'
          }
        ]);
        setUsersLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Usuario creado correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadUsers();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'No se pudo crear el usuario');
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setIsLoading(true);
      // Simular operación para diseño UX/UI
      setTimeout(() => {
        Alert.alert('Éxito', 'Usuario actualizado correctamente (Demo)');
        setModalVisible(false);
        resetForm();
        loadUsers();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario');
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar al usuario "${userToDelete.Nombres_Usuarios} ${userToDelete.Apellidos_Usuarios}"?`,
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
                Alert.alert('Éxito', 'Usuario eliminado correctamente (Demo)');
                loadUsers();
                setIsLoading(false);
              }, 1000);
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      idUsuarios: userToEdit.idUsuarios?.toString() || '',
      DNI_Usuarios: userToEdit.DNI_Usuarios || '',
      Nombres_Usuarios: userToEdit.Nombres_Usuarios || '',
      Apellidos_Usuarios: userToEdit.Apellidos_Usuarios || '',
      Password_Usuarios: userToEdit.Password_Usuarios || '',
      Telefono_Usuarios: userToEdit.Telefono_Usuarios || '',
      Email_Usuarios: userToEdit.Email_Usuarios || '',
      Roles_Usuarios: userToEdit.Roles_Usuarios?.toString() || '',
      Puntos_Usuarios: userToEdit.Puntos_Usuarios?.toString() || '',
      ImagenPerfil_Usuarios: userToEdit.ImagenPerfil_Usuarios || '',
      FechaRegistro_Usuarios: userToEdit.FechaRegistro_Usuarios || '',
      Activo_Usuarios: userToEdit.Activo_Usuarios?.toString() || '1',
      ubicaciones_Usuarios: userToEdit.ubicaciones_Usuarios || ''
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      idUsuarios: '',
      DNI_Usuarios: '',
      Nombres_Usuarios: '',
      Apellidos_Usuarios: '',
      Password_Usuarios: '',
      Telefono_Usuarios: '',
      Email_Usuarios: '',
      Roles_Usuarios: '',
      Puntos_Usuarios: '',
      ImagenPerfil_Usuarios: '',
      FechaRegistro_Usuarios: '',
      Activo_Usuarios: '1',
      ubicaciones_Usuarios: ''
    });
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return 'Ciudadano';
      case 2: return 'Institución';
      case 3: return 'Técnico';
      default: return 'Desconocido';
    }
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

  const renderUserModal = () => {
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
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>

              {/* ID Usuario (solo lectura en edición) */}
              {editingUser && (
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.textSecondary 
                  }]}
                  placeholder="ID Usuario"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.idUsuarios}
                  editable={false}
                />
              )}

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="DNI"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.DNI_Usuarios}
                onChangeText={(value) => setFormData({...formData, DNI_Usuarios: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Nombres"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Nombres_Usuarios}
                onChangeText={(value) => setFormData({...formData, Nombres_Usuarios: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Apellidos"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Apellidos_Usuarios}
                onChangeText={(value) => setFormData({...formData, Apellidos_Usuarios: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Contraseña"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Password_Usuarios}
                onChangeText={(value) => setFormData({...formData, Password_Usuarios: value})}
                secureTextEntry={true}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Teléfono"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Telefono_Usuarios}
                onChangeText={(value) => setFormData({...formData, Telefono_Usuarios: value})}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Email"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Email_Usuarios}
                onChangeText={(value) => setFormData({...formData, Email_Usuarios: value})}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Rol (1=Ciudadano, 2=Institución, 3=Técnico, 4=Admin)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Roles_Usuarios}
                onChangeText={(value) => setFormData({...formData, Roles_Usuarios: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Puntos"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Puntos_Usuarios}
                onChangeText={(value) => setFormData({...formData, Puntos_Usuarios: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Imagen de Perfil (nombre archivo)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.ImagenPerfil_Usuarios}
                onChangeText={(value) => setFormData({...formData, ImagenPerfil_Usuarios: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Fecha Registro (YYYY-MM-DD)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.FechaRegistro_Usuarios}
                onChangeText={(value) => setFormData({...formData, FechaRegistro_Usuarios: value})}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Activo (1=Sí, 0=No)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Activo_Usuarios}
                onChangeText={(value) => setFormData({...formData, Activo_Usuarios: value})}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }]}
                placeholder="Ubicación"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.ubicaciones_Usuarios}
                onChangeText={(value) => setFormData({...formData, ubicaciones_Usuarios: value})}
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
                  onPress={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingUser ? 'Actualizar' : 'Crear'}
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

  if (usersLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Cargando usuarios...
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
            <Text style={[styles.appName, { color: themeColors.text }]}>Gestión Usuarios</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Usuarios Sistema</Text>
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

        {/* Users Table */}
        <View style={[styles.tableContainer, { backgroundColor: themeColors.surface }]}>
          <View style={[styles.tableHeader, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>DNI</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Nombre</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Apellido</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Rol</Text>
            <Text style={[styles.tableHeaderText, { color: themeColors.text }]}>Acciones</Text>
          </View>

          {users.map((userItem, index) => (
            <View 
              key={userItem.DNI_Usuarios} 
              style={[
                styles.tableRow, 
                { backgroundColor: index % 2 === 0 ? themeColors.card : 'transparent' }
              ]}
            >
              <Text style={[styles.tableCell, styles.dniCell, { color: themeColors.text }]}>
                {userItem.DNI_Usuarios || 'N/A'}
              </Text>
              <Text style={[styles.tableCell, styles.nameCell, { color: themeColors.text }]}>
                {userItem.Nombres_Usuarios || 'Sin nombre'}
              </Text>
              <Text style={[styles.tableCell, styles.lastnameCell, { color: themeColors.text }]}>
                {userItem.Apellidos_Usuarios || 'Sin apellido'}
              </Text>
              <Text style={[styles.tableCell, styles.roleCell, { color: themeColors.text }]}>
                {getRoleName(userItem.Roles_Usuarios)}
              </Text>
              <View style={styles.actionsCell}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(userItem)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteUser(userItem)}
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
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>Gestión de Usuarios</Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Administra los usuarios del sistema EcoRAEE. Puedes crear, editar y gestionar los diferentes tipos de usuarios: ciudadanos, instituciones y técnicos.
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Modal */}
      {renderUserModal()}
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
    paddingVertical: 8,
  },
  dniCell: {
    flex: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  nameCell: {
    flex: 1.2,
    textAlign: 'left',
    fontWeight: '500',
  },
  lastnameCell: {
    flex: 1.2,
    textAlign: 'left',
    fontWeight: '500',
  },
  roleCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
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
