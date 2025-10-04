import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

export default function HomeScreen({ navigation }) {
  const { user, signOut, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsLoaded, setPointsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Log screen load
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[SCREEN] EL USUARIO ENTRO A LA PANTALLA HOME - ${time} ${date}`);
    
    // Cargar perfil del usuario al entrar
    loadUserProfile();
    // Cargar puntos solo una vez al entrar
    loadUserPoints();
  }, []);

  // Cargar imagen de perfil cuando el usuario esté disponible y el perfil esté cargado
  useEffect(() => {
    if (user && user.ImagenPerfil_Usuarios && !imageLoaded) {
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
    if (!user?.ImagenPerfil_Usuarios) {
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
        'perfil1animal.png': require('../img/perfil1animal.png'),
        'perfil1flores.png': require('../img/perfil1flores.png'),
        'perfil2animal.png': require('../img/perfil2animal.png'),
        'perfil2flores.png': require('../img/perfil2flores.png'),
        'perfil3animal.png': require('../img/perfil3animal.png'),
        'perfil3flores.png': require('../img/perfil3flores.png'),
        'perfil4animal.png': require('../img/perfil4animal.png'),
        'perfil4flores.png': require('../img/perfil4flores.png'),
        'perfil5animal.png': require('../img/perfil5animal.png'),
        'perfil5flores.png': require('../img/perfil5flores.png')
      };

      const imageSource = imageMap[user.ImagenPerfil_Usuarios];
      if (imageSource) {
        setProfileImage(imageSource);
      } else {
        setProfileImage(null);
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

      const response = await ApiService.getUserPoints(user.idUsuarios);
      
      if (response.success && response.data) {
        setUserPoints(response.data.puntos || 0);
        setPointsLoaded(true);
        console.log(`[POINTS] Puntos cargados: ${response.data.puntos}`);
      } else {
        setUserPoints(0);
        setPointsLoaded(true);
        console.log('[POINTS] No se pudieron cargar los puntos');
      }
    } catch (error) {
      console.error('Error loading user points:', error);
      setUserPoints(0);
      setPointsLoaded(true);
    }
  };

  const loadUserProfile = async () => {
    // Log profile load start
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[FUNCTION] EL USUARIO INICIO LA CARGA DEL PERFIL - ${time} ${date}`);
    
    setIsLoading(true);
    try {
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
      case 'donate':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON DONAR DISPOSITIVOS - ${time} ${date}`);
        navigation.navigate('Donation');
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
        navigation.navigate('ExchangeShop');
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
        navigation.navigate('Profile');
        break;
      case 'stats':
        console.log(`[BUTTON] EL USUARIO APRETO EL BOTON VER ESTADISTICAS - ${time} ${date}`);
        navigation.navigate('Statistics');
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

  return (
    <View style={styles.container}>
      {/* Header con logo y botón de cerrar sesión */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../logo-EcoRAEE.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>EcoRAEE</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Tarjeta de Bienvenida */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <Text style={styles.userName}>{user?.Apellidos_Usuarios}, {user?.Nombres_Usuarios}</Text>
              <Text style={styles.userType}>Ciudadano</Text>
              <Text style={styles.pointsText}>Puntos: <Text style={styles.pointsValue}>{userPoints}</Text></Text>
            </View>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={profileImage} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.Nombres_Usuarios?.charAt(0)}{user?.Apellidos_Usuarios?.charAt(0)}
                </Text>
              )}
          </View>
        </View>
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleActionPress('donate')}
        >
          <Text style={styles.actionButtonText}>Donar Dispositivos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleActionPress('deliveries')}
        >
          <Text style={styles.actionButtonText}>Tienda de Canjes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleActionPress('stats')}
        >
          <Text style={styles.actionButtonText}>Ver Estadísticas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleActionPress('profile')}
        >
          <Text style={styles.actionButtonText}>Mi Perfil</Text>
        </TouchableOpacity>

        {/* Información sobre EcoRAEE */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre EcoRAEE</Text>
          <Text style={styles.infoText}>
            EcoRAEE (Residuos de Aparatos Eléctricos y Electrónicos.) es una plataforma que conecta ciudadanos con técnicos especializados e instituciones educativas para promover el reciclaje responsable de residuos electrónicos y la economía circular.
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
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
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
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
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
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
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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