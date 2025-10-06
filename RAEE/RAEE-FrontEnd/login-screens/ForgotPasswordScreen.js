import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
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

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const handleResetPassword = () => {
    // Validación básica
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    
    // Aquí iría la lógica para enviar el email de recuperación
    Alert.alert(
      'Correo Enviado', 
      'Se ha enviado un enlace de recuperación a tu correo electrónico',
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
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
          <Text style={[styles.title, { color: themeColors.text }]}>Recuperar Contraseña</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Text>
        </View>

        {/* Formulario */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.formCard}
        >
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }]}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor={themeColors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </LinearGradient>

        {/* Botón de enviar */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetPassword}
        >
          <LinearGradient
            colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
            style={styles.resetButtonGradient}
          >
            <Text style={styles.resetButtonText}>Enviar Enlace de Recuperación</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link de regreso al login */}
        <View style={styles.backToLoginContainer}>
          <Text style={[styles.backToLoginText, { color: themeColors.textSecondary }]}>
            ¿Recordaste tu contraseña? 
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.backToLoginLink, { color: themeColors.primary }]}>Iniciar Sesión</Text>
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
  resetButton: {
    borderRadius: 16,
    marginBottom: 15,
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
  resetButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backToLoginText: {
    fontSize: 16,
  },
  backToLoginLink: {
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