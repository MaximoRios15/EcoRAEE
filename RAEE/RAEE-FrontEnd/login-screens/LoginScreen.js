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
  const { isDarkMode, toggleTheme, themeColors } = useTheme();
  const { signIn, signInDemo } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!formData.DNI_Usuarios || !formData.Password_Usuarios) {
      Alert.alert('Datos incompletos', 'Ingresa tu DNI y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(formData);
      if (!result.success) {
        Alert.alert('Error de inicio de sesión', result.message || 'Credenciales inválidas');
      }
    } catch (error) {
      Alert.alert('Error de conexión', error.message || 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

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
          style={[
            styles.loginButton,
            (isLoading || !formData.DNI_Usuarios || !formData.Password_Usuarios) && styles.loginButtonDisabled
          ]} 
          onPress={handleLogin}
          disabled={isLoading || !formData.DNI_Usuarios || !formData.Password_Usuarios}
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