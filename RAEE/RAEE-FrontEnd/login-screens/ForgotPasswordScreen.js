import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design constants
const isSmallScreen = screenHeight < 700;
const isVerySmallScreen = screenHeight < 600;

// Responsive size function
const getResponsiveSize = (baseSize, smallScreenMultiplier = 0.8, verySmallScreenMultiplier = 0.7) => {
  if (isVerySmallScreen) return Math.round(baseSize * verySmallScreenMultiplier);
  if (isSmallScreen) return Math.round(baseSize * smallScreenMultiplier);
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

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { isDarkMode, toggleTheme, themeColors } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.background }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: themeColors.header }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft} />
              
              <View style={styles.headerCenter} />
              
              <TouchableOpacity 
                style={[styles.themeToggle, { backgroundColor: isDarkMode ? '#2C2C3E' : '#E9ECEF' }]} 
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                  size={getResponsiveSize(18, 16, 14)} 
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
            <Text style={[styles.backToLoginLink, { color: themeColors.primary }]}> Iniciar Sesión</Text>
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
  headerLeft: {
    width: 50,
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
  resetButton: {
    borderRadius: 16,
    marginBottom: getResponsiveSize(25, 20, 15),
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
    padding: getResponsiveSize(18, 16, 14),
    alignItems: 'center',
    minHeight: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(18, 16, 14),
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(20, 15, 12),
    marginTop: 'auto',
    paddingTop: getResponsiveSize(15, 12, 10),
  },
  backToLoginText: {
    fontSize: getResponsiveSize(16, 14, 12),
  },
  backToLoginLink: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: getResponsiveSize(50, 40, 30),
  },
  footerLink: {
    fontSize: getResponsiveSize(14, 12, 10),
    marginVertical: getResponsiveSize(2, 1, 1),
  },
});