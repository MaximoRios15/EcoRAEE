import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Función para determinar si es una pantalla pequeña
const isSmallScreen = screenHeight < 700;
const isVerySmallScreen = screenHeight < 600;

// Función para obtener tamaños responsivos
const getResponsiveSize = (baseSize, smallScreenMultiplier = 0.8, verySmallScreenMultiplier = 0.7) => {
  if (isVerySmallScreen) return baseSize * verySmallScreenMultiplier;
  if (isSmallScreen) return baseSize * smallScreenMultiplier;
  return baseSize;
};



// Componente para el efecto rainbow animado horizontal
const RainbowText = ({ children, style }) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // Colores exactos que me diste + colores adicionales
  const colors = ['#066c34', '#319417', '#51b003', '#319417', '#066c34'];
  const text = children;
  
  useEffect(() => {
    const animateColors = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    animateColors();
  }, []);
  
  return (
    <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
      {text.split('').map((char, index) => {
        // Crea un efecto de onda que se mueve de izquierda a derecha
        const wavePosition = animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-0.2, 1.2], // Va de -0.2 a 1.2 para reiniciar justo después de la última E
        });

        // Calcula la posición del carácter en el texto (0 a 1)
        const charPosition = index / (text.length - 1);

        // Crea el índice de color usando la diferencia entre la onda y la posición del carácter
        const colorIndex = wavePosition.interpolate({
          inputRange: [charPosition - 0.2, charPosition + 0.2], // Rango alrededor de la posición del carácter
          outputRange: [0, colors.length - 1], // Va del primer color al último
        });

        const interpolatedColor = colorIndex.interpolate({
          inputRange: colors.map((_, i) => i), // Mapea 0, 1, 2, 3, 4 a los colores
          outputRange: colors,
          extrapolate: 'clamp', // Limita para evitar colores fuera del rango definido
        });
        
        return (
          <Animated.Text
            key={index}
            style={[
              style,
              {
                color: interpolatedColor,
              },
            ]}
          >
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    DNI_Usuarios: '',
    Password_Usuarios: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { isDarkMode, toggleTheme, themeColors } = useTheme();
  const { signInDemo } = useAuth();
  const sidebarAnimation = useRef(new Animated.Value(-screenWidth * 0.8)).current;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = () => {
    Alert.alert('Inicio de Sesión', 'Funcionalidad de inicio de sesión temporalmente deshabilitada');
  };

  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -screenWidth * 0.8 : 0;
    
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setSidebarVisible(!sidebarVisible);
  };

  const navigateToHome = async (screenName, roleName) => {
    console.log(`[SIDEBAR] Navegando a ${screenName} - Rol: ${roleName}`);
    setSidebarVisible(false);
    Animated.timing(sidebarAnimation, {
      toValue: -screenWidth * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Simular login automático con datos de usuario correspondientes al rol
    let mockUserData = {};
    
    switch (screenName) {
      case 'CitizenHomeScreen':
        mockUserData = {
          ID_Usuario: 1,
          DNI: '12345678',
          Nombres: 'Juan Demo',
          Apellidos: 'Ciudadano',
          Email: 'ciudadano@demo.com',
          Telefono: '987654321',
          Direccion: 'Av. Demo 123',
          Roles_Usuarios: 1, // Rol Ciudadano
          Estado: 'Activo'
        };
        break;
      case 'ReceptionHomeScreen':
        mockUserData = {
          ID_Usuario: 2,
          DNI: '87654321',
          Nombres: 'María Demo',
          Apellidos: 'Recepción',
          Email: 'recepcion@demo.com',
          Telefono: '123456789',
          Direccion: 'Av. Recepción 456',
          Roles_Usuarios: 4, // Rol Recepción
          Estado: 'Activo'
        };
        break;
      case 'AdminHomeScreen':
        mockUserData = {
          ID_Usuario: 3,
          DNI: '11223344',
          Nombres: 'Admin Demo',
          Apellidos: 'Administrador',
          Email: 'admin@demo.com',
          Telefono: '555666777',
          Direccion: 'Av. Admin 789',
          Roles_Usuarios: 5, // Rol Administrador
          Estado: 'Activo'
        };
        break;
      default:
        console.warn('Rol no reconocido:', screenName);
        return;
    }

    // Simular el proceso de login usando signInDemo
    try {
      const result = await signInDemo(mockUserData);
      
      if (result.success) {
        console.log(`[SIDEBAR] Login simulado exitoso para ${roleName}:`, mockUserData);
        // La navegación se manejará automáticamente por el useEffect en App.js
        // cuando detecte el cambio de usuario
      } else {
        console.error('Error en login simulado:', result.message);
      }
      
    } catch (error) {
      console.error('Error simulando login:', error);
    }
  };

  const sidebarItems = [
    {
      id: 1,
      title: 'Recepción',
      subtitle: 'Panel de Recepción',
      icon: 'business-outline',
      screen: 'ReceptionHomeScreen',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Ciudadano',
      subtitle: 'Panel de Ciudadano',
      icon: 'person-outline',
      screen: 'CitizenHomeScreen',
      color: '#2196F3'
    },
    {
      id: 3,
      title: 'Administrador',
      subtitle: 'Panel de Administración',
      icon: 'settings-outline',
      screen: 'AdminHomeScreen',
      color: '#FF9800'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: themeColors.header }]}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={[styles.menuButton, { backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF' }]}
                onPress={toggleSidebar}
              >
                <Ionicons 
                  name="menu" 
                  size={24} 
                  color={themeColors.text} 
                />
              </TouchableOpacity>
              
              <View style={styles.headerCenter} />
              
              <TouchableOpacity 
                style={[styles.themeToggle, { backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF' }]} 
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                  size={22} 
                  color={themeColors.text} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
        {/* Logo y nombre de la app */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../img/logo-EcoRAEE.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <RainbowText style={styles.appName}>EcoRAEE</RainbowText>
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>Inicio de Sesión</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Ingresa tus credenciales para acceder a tu cuenta EcoRAEE
          </Text>
        </View>

        {/* Formulario */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.formCard}
        >
          {/* DNI */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>DNI</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Ingresa tu DNI (7-8 dígitos)"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.DNI_Usuarios}
              onChangeText={(value) => {
                // Solo permitir números y limitar a 8 dígitos
                const numericValue = value.replace(/[^0-9]/g, '').slice(0, 8);
                handleInputChange('DNI_Usuarios', numericValue);
              }}
              onFocus={() => {
                const now = new Date();
                const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO DNI - ${time} ${date}`);
              }}
              keyboardType="numeric"
              maxLength={8}
              autoComplete="off"
            />
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Contraseña</Text>
            <View style={[styles.passwordContainer, { 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border 
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: themeColors.text }]}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Password_Usuarios}
                onChangeText={(value) => handleInputChange('Password_Usuarios', value)}
                onFocus={() => {
                   const now = new Date();
                   const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                   const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                   console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO CONTRASEÑA - ${time} ${date}`);
                 }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[EYEBUTTON] EL USUARIO APRETO EL BOTON VER/OCULTAR CONTRASEÑA - ${time} ${date}`);
                  setShowPassword(!showPassword);
                }}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Botón de inicio de sesión */}
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
            style={styles.loginButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Link de contraseña olvidada */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={() => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[BUTTON] EL USUARIO ENTRO A RECUPERAR CONTRASEÑA - ${time} ${date}`);
            navigation.navigate('ForgotPassword');
          }}
        >
          <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {/* Link a registro */}
        <View style={styles.registerLinkContainer}>
          <Text style={[styles.registerLinkText, { color: themeColors.textSecondary }]}>
            ¿No tienes una cuenta? 
          </Text>
          <TouchableOpacity onPress={() => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[BUTTON] EL USUARIO ENTRO A REGISTRARSE - ${time} ${date}`);
            navigation.navigate('Register');
          }}>
            <Text style={[styles.registerLink, { color: themeColors.primary }]}> Regístrate</Text>
          </TouchableOpacity>
        </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: themeColors.textSecondary }]}>
                Términos y Condiciones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: themeColors.textSecondary }]}>
                Política de Privacidad
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Overlay para cerrar sidebar */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar, 
          { 
            backgroundColor: themeColors.background,
            transform: [{ translateX: sidebarAnimation }]
          }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.sidebarContent}
        >
          {/* Header del sidebar */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarHeaderContent}>
              <Image 
                source={require('../img/logo-EcoRAEE.png')} 
                style={styles.sidebarLogo}
                resizeMode="contain"
              />
              <Text style={[styles.sidebarTitle, { color: themeColors.text }]}>
                EcoRAEE
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={toggleSidebar}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={themeColors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* Separador */}
          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          {/* Título de sección */}
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            Acceso Rápido a Paneles
          </Text>

          {/* Items del sidebar */}
          <View style={styles.sidebarItems}>
            {sidebarItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.sidebarItem, { borderColor: themeColors.border }]}
                onPress={() => navigateToHome(item.screen, item.title)}
              >
                <View style={[styles.sidebarItemIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.color} 
                  />
                </View>
                <View style={styles.sidebarItemContent}>
                  <Text style={[styles.sidebarItemTitle, { color: themeColors.text }]}>
                    {item.title}
                  </Text>
                  {/* Subtitle removido para alinear con diseño de Recepción */}
              </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={themeColors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer del sidebar */}
          <View style={styles.sidebarFooter}>
            <Text style={[styles.sidebarFooterText, { color: themeColors.textSecondary }]}>
              Versión 1.0.0
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header styles
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: getResponsiveSize(20, 15, 10),
    paddingBottom: getResponsiveSize(10, 5, 0),
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  menuButton: {
    width: getResponsiveSize(40, 35, 30),
    height: getResponsiveSize(40, 35, 30),
    borderRadius: getResponsiveSize(20, 17.5, 15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerCenter: {
    flex: 1,
  },
  themeToggle: {
    backgroundColor: '#2C2C3E',
    width: getResponsiveSize(40, 35, 30),
    height: getResponsiveSize(40, 35, 30),
    borderRadius: getResponsiveSize(20, 17.5, 15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeToggleIcon: {
    fontSize: getResponsiveSize(18, 16, 14),
  },

  // Sidebar styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sidebarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarItems: {
    flex: 1,
    paddingHorizontal: 20,
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
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  sidebarFooterText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: getResponsiveSize(10, 5, 0),
    paddingBottom: getResponsiveSize(20, 15, 10),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(30, 20, 15),
  },
  logoImage: {
    width: getResponsiveSize(125, 100, 80),
    height: getResponsiveSize(125, 100, 80),
    marginBottom: getResponsiveSize(5, 3, 2),
  },
  appName: {
    fontSize: getResponsiveSize(28, 24, 20),
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: getResponsiveSize(30, 20, 15),
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveSize(28, 24, 20),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(8, 6, 4),
  },
  subtitle: {
    fontSize: getResponsiveSize(16, 14, 12),
    textAlign: 'center',
    lineHeight: getResponsiveSize(22, 20, 18),
  },
  formCard: {
    borderRadius: 16,
    padding: getResponsiveSize(20, 15, 12),
    marginBottom: getResponsiveSize(30, 20, 15),
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: getResponsiveSize(20, 15, 12),
  },
  label: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(8, 6, 4),
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: getResponsiveSize(15, 12, 10),
    fontSize: getResponsiveSize(16, 14, 12),
    minHeight: getResponsiveSize(54, 48, 42),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingRight: getResponsiveSize(15, 12, 10),
    minHeight: getResponsiveSize(54, 48, 42),
  },
  passwordInput: {
    flex: 1,
    paddingVertical: getResponsiveSize(15, 12, 10),
    paddingLeft: getResponsiveSize(15, 12, 10),
    fontSize: getResponsiveSize(16, 14, 12),
  },
  eyeButton: {
    padding: getResponsiveSize(5, 4, 3),
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: getResponsiveSize(20, 15, 12),
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
  loginButtonGradient: {
    padding: getResponsiveSize(18, 15, 12),
    alignItems: 'center',
    minHeight: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(18, 16, 14),
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(30, 20, 15),
  },
  forgotPasswordText: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: '500',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getResponsiveSize(-20, -15, -10),
    marginBottom: getResponsiveSize(0, 5, 10),
  },
  registerLinkText: {
    fontSize: getResponsiveSize(16, 14, 12),
  },
  registerLink: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: getResponsiveSize(50, 30, 20),
    paddingTop: getResponsiveSize(20, 15, 10),
  },
  footerLink: {
    fontSize: getResponsiveSize(14, 12, 10),
    marginVertical: getResponsiveSize(2, 1.5, 1),
  },
});