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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { signIn } = useAuth();

  useEffect(() => {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    // Log button press
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    console.log(`[BUTTON] EL USUARIO APRETO EL BOTON INICIAR SESION - ${time} ${date}`);
    
    // Validación básica
    if (!formData.DNI_Usuarios || !formData.Password_Usuarios) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validación de formato DNI
    if (!/^\d{7,8}$/.test(formData.DNI_Usuarios)) {
      Alert.alert('Error', 'El DNI debe contener entre 7 y 8 dígitos');
      return;
    }

    // Validación de contraseña
    if (formData.Password_Usuarios.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn({
        DNI_Usuarios: formData.DNI_Usuarios,
        Password_Usuarios: formData.Password_Usuarios,
      });

      if (result.success) {
        // Log successful login
        console.log(`[LOGIN] LOGIN EXITOSO - Usuario: ${formData.DNI_Usuarios} - ${time} ${date}`);
        
        // La navegación se maneja automáticamente por el AuthContext
        Alert.alert('Éxito', result.message || 'Inicio de sesión exitoso');
      } else {
        // Log failed login
        console.log(`[LOGIN] LOGIN FALLIDO - Usuario: ${formData.DNI_Usuarios} - Error: ${result.message} - ${time} ${date}`);
        Alert.alert('Error', result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      // Log connection error
      console.log(`[LOGIN] ERROR DE CONEXION - Usuario: ${formData.DNI_Usuarios} - Error: ${error.message} - ${time} ${date}`);
      Alert.alert('Error', 'Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft} />
          
          <View style={styles.headerCenter} />
          
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF' }]} 
            onPress={toggleTheme}
          >
            <Text style={[styles.themeToggleIcon, { color: themeColors.text }]}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerLeft: {
    width: 50,
  },
  headerCenter: {
    flex: 1,
  },
  themeToggle: {
    backgroundColor: '#2C2C3E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 125,
    height: 125,
    marginBottom: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingRight: 15,
    minHeight: 54,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 5,
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 20,
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
    padding: 18,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 0,
  },
  registerLinkText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 50,
  },
  footerLink: {
    fontSize: 14,
    marginVertical: 2,
  },
});