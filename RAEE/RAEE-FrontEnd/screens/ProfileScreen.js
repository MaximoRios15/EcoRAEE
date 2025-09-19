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
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

export default function ProfileScreen({ navigation }) {
  const { user, signOut, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editName, setEditName] = useState({ nombre: '', apellido: '' });

  // Imágenes disponibles en la carpeta img
  const availableImages = [
    { id: 1, name: 'perfil1animal.png', source: require('../img/perfil1animal.png') },
    { id: 2, name: 'perfil1flores.png', source: require('../img/perfil1flores.png') },
    { id: 3, name: 'perfil2animal.png', source: require('../img/perfil2animal.png') },
    { id: 4, name: 'perfil2flores.png', source: require('../img/perfil2flores.png') },
    { id: 5, name: 'perfil3animal.png', source: require('../img/perfil3animal.png') },
    { id: 6, name: 'perfil3flores.png', source: require('../img/perfil3flores.png') },
  ];

  useEffect(() => {
    // Cargar perfil del usuario al entrar
    loadUserProfile();
    // Cargar imagen de perfil guardada
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        const imageData = JSON.parse(savedImage);
        setProfileImage(imageData);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const saveProfileImage = async (imageData) => {
    try {
      await AsyncStorage.setItem('profileImage', JSON.stringify(imageData));
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
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

  const openImageSelector = () => {
    setShowImageModal(true);
  };

  const selectImage = async (image) => {
    setProfileImage(image.source);
    await saveProfileImage(image.source);
    setShowImageModal(false);
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
      const result = await ApiService.updateUserProfile({
        Nombres_Usuarios: editName.nombre.trim(),
        Apellidos_Usuarios: editName.apellido.trim(),
      });

      if (result.success) {
        Alert.alert('Éxito', 'Nombre actualizado correctamente');
        // Actualizar el perfil del usuario en el contexto
        await refreshProfile();
        setShowEditNameModal(false);
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el nombre');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Error de conexión. Verifica tu conexión a internet.');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* Header con botón volver y botón de cerrar sesión */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Título Mi Perfil */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>

          {/* Tarjeta de Información del Usuario */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image source={profileImage} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                  </Text>
                )}
                <TouchableOpacity style={styles.editIconContainer} onPress={openImageSelector}>
                  <Ionicons name="pencil" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{user?.Apellidos_Usuarios}, {user?.Nombres_Usuarios}</Text>
                  <TouchableOpacity style={styles.editNameIcon} onPress={openEditNameModal}>
                    <Ionicons name="pencil" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userEmail}>{user?.Email_Usuarios}</Text>
                <Text style={styles.userType}>Ciudadano</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.Puntos_Usuarios || 0}</Text>
                <Text style={styles.statLabel}>Puntos Totales</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Donaciones</Text>
              </View>
            </View>
          </View>

          {/* Configuración de Cuenta */}
          <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleActionPress('verify_email')}
            >
              <Text style={styles.actionButtonText}>Verificar Correo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleActionPress('verify_phone')}
            >
              <Text style={styles.actionButtonText}>Verificar Celular</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleActionPress('change_password')}
            >
              <Text style={styles.actionButtonText}>Cambiar Contraseña</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para seleccionar imagen */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
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
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.editNameModalContent}>
              <View style={styles.editNameModalHeader}>
                <Text style={styles.editNameModalTitle}>Editar Nombre</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowEditNameModal(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.inputsContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={editName.nombre}
                    onChangeText={(text) => setEditName(prev => ({ ...prev, nombre: text }))}
                    placeholder="Ingresa tu nombre"
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Apellido</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={editName.apellido}
                    onChangeText={(text) => setEditName(prev => ({ ...prev, apellido: text }))}
                    placeholder="Ingresa tu apellido"
                    returnKeyType="done"
                  />
                </View>
              </ScrollView>
              
              <View style={styles.editNameButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowEditNameModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    padding: 4,
  },
  editNameModalContent: {
    backgroundColor: 'white',
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
    color: '#333',
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
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
