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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para diseño responsivo
const isSmallScreen = screenHeight < 700;
const isVerySmallScreen = screenHeight < 600;

// Función para obtener tamaños responsivos
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

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    DNI_Usuarios: '',
    Nombres_Usuarios: '',
    Apellidos_Usuarios: '',
    Roles_Usuarios: 1, // 1=ciudadano, 2=institucion, 3=tecnico
    Email_Usuarios: '',
    Telefono_Usuarios: '',
    Direccion_Usuarios: '',
    NroCalle_Usuarios: '',
    Piso_Usuarios: '',
    Departamento_Usuarios: '',
    Barrio_Usuarios: '',
    Provincia_Usuarios: 'Misiones',
    Municipios_Usuarios: '',
    Password_Usuarios: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  // Estados para flujo por secciones y verificaciones
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { isDarkMode, toggleTheme, themeColors } = useTheme();

  // Seleccionar imagen aleatoria al cargar el componente
  React.useEffect(() => {
    selectRandomProfileImage();
  }, []);

  // Imágenes de perfil disponibles
  const profileImages = [
    'perfil1animal.png',
    'perfil1flores.png',
    'perfil2animal.png',
    'perfil2flores.png',
    'perfil3animal.png',
    'perfil3flores.png',
    'perfil4animal.png',
    'perfil4flores.png',
    'perfil5animal.png',
    'perfil5flores.png'
  ];

  // Mapeo de nombres de imágenes a require
  const getProfileImageSource = (imageName) => {
    const imageMap = {
      'perfil1animal.png': require('../img/profile/perfil1animal.png'),
      'perfil1flores.png': require('../img/profile/perfil1flores.png'),
      'perfil2animal.png': require('../img/profile/perfil2animal.png'),
      'perfil2flores.png': require('../img/profile/perfil2flores.png'),
      'perfil3animal.png': require('../img/profile/perfil3animal.png'),
      'perfil3flores.png': require('../img/profile/perfil3flores.png'),
      'perfil4animal.png': require('../img/profile/perfil4animal.png'),
      'perfil4flores.png': require('../img/profile/perfil4flores.png'),
      'perfil5animal.png': require('../img/profile/perfil5animal.png'),
      'perfil5flores.png': require('../img/profile/perfil5flores.png')
    };
    return imageMap[imageName] || require('../img/profile/perfil1animal.png');
  };

  // Función para seleccionar una imagen de perfil aleatoria
  const selectRandomProfileImage = () => {
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    const selectedImage = profileImages[randomIndex];
    setSelectedProfileImage(selectedImage);
    return selectedImage;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validación en tiempo real de contraseñas
    if (field === 'Password_Usuarios' || field === 'confirmPassword') {
      const newFormData = { ...formData, [field]: value };
      
      if (newFormData.confirmPassword && newFormData.Password_Usuarios !== newFormData.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError('');
      }
    }

    // Limpiar errores de validación cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRegister = () => {
    Alert.alert('Registro', 'Funcionalidad de registro temporalmente deshabilitada');
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

        {/* Imagen de perfil seleccionada (solo Sección 1) */}
        {currentStep === 1 && selectedProfileImage && (
          <LinearGradient
            colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
            style={styles.profileImageContainer}
          >
            <Text style={[styles.profileImageLabel, { color: themeColors.text }]}>Tu imagen de perfil será:</Text>
            <Image 
              source={getProfileImageSource(selectedProfileImage)}
              style={styles.selectedProfileImage}
              resizeMode="cover"
            />
            <Text style={[styles.profileImageName, { color: themeColors.textSecondary }]}>{selectedProfileImage}</Text>
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={() => {
                const now = new Date();
                const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                console.log(`[BUTTON] EL USUARIO CAMBIO LA IMAGEN DE PERFIL - ${time} ${date}`);
                selectRandomProfileImage();
              }}
            >
              <LinearGradient
                colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
                style={styles.changeImageButtonGradient}
              >
                <Text style={styles.changeImageButtonText}>Cambiar Imagen</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>Registro de Usuario</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Completa los datos para crear tu cuenta
          </Text>
        </View>

        {/* Formulario */}
        <LinearGradient
          colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
          style={styles.formCard}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{`Sección ${currentStep} de 3`}</Text>
          {currentStep === 1 && (
            <>
              {/* DNI */}
              <Text style={[styles.label, { color: themeColors.text }]}>DNI *</Text>
              <TextInput
                style={[
                  styles.input, 
                  validationErrors.DNI_Usuarios ? styles.inputError : null,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa tu DNI (7-8 dígitos)"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.DNI_Usuarios}
                onChangeText={(value) => {
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
              {validationErrors.DNI_Usuarios ? (
                <Text style={styles.errorText}>{validationErrors.DNI_Usuarios}</Text>
              ) : null}

              {/* Nombre */}
              <Text style={[styles.label, { color: themeColors.text }]}>Nombre/s *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa tu nombre"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Nombres_Usuarios}
                onChangeText={(value) => handleInputChange('Nombres_Usuarios', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO NOMBRE - ${time} ${date}`);
                }}
              />

              {/* Apellido */}
              <Text style={[styles.label, { color: themeColors.text }]}>Apellido/s *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa tu apellido"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Apellidos_Usuarios}
                onChangeText={(value) => handleInputChange('Apellidos_Usuarios', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO APELLIDO - ${time} ${date}`);
                }}
              />

              {/* Tipo de Usuario (fijo: Ciudadano) */}
              <Text style={[styles.label, { color: themeColors.text }]}>Tipo de Usuario *</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>Ciudadano</Text>
              </View>

              {/* Siguiente 1/3 */}
              <TouchableOpacity
                style={[styles.registerButton, styles.registerButtonSection1]}
                onPress={() => {
                  // Fija el rol como Ciudadano y avanza a la Sección 2
                  setFormData(prev => ({ ...prev, Roles_Usuarios: 1 }));
                  setCurrentStep(2);
                }}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
                  style={styles.registerButtonGradient}
                >
                  <Text style={styles.registerButtonText}>Siguiente 1/3</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {currentStep === 3 && (
            <>
          {/* Correo Electrónico */}
          <Text style={[styles.label, { color: themeColors.text }]}>Correo Electrónico *</Text>
          <TextInput
            style={[
              styles.input, 
              validationErrors.Email_Usuarios ? styles.inputError : null,
              { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }
            ]}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={themeColors.textSecondary}
            value={formData.Email_Usuarios}
            onChangeText={(value) => {
              handleInputChange('Email_Usuarios', value);
            }}
            onFocus={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO EMAIL - ${time} ${date}`);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          {validationErrors.Email_Usuarios ? (
            <Text style={styles.errorText}>{validationErrors.Email_Usuarios}</Text>
          ) : null}
          {/* Validar/Omitir Correo */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.registerButton, { flex: 1, marginRight: 8 }]}
              onPress={() => {
                setIsValidating(true);
                setTimeout(() => {
                  setIsValidating(false);
                  setEmailVerified(true);
                  Alert.alert('Verificación', 'Se envió un código a tu correo.');
                }, 800);
              }}
            >
              <LinearGradient
                colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>Validar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.registerButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setEmailVerified(true)}
            >
              <LinearGradient
                colors={isDarkMode ? ['#9E9E9E', '#757575'] : ['#757575', '#9E9E9E']}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>Omitir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Teléfono */}
          <Text style={[styles.label, { color: themeColors.text }]}>Teléfono *</Text>
          <TextInput
            style={[
              styles.input, 
              validationErrors.Telefono_Usuarios ? styles.inputError : null,
              { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }
            ]}
            placeholder="Ingresa tu teléfono (ej: 3764123456)"
            placeholderTextColor={themeColors.textSecondary}
            value={formData.Telefono_Usuarios}
            onChangeText={(value) => {
              // Solo permitir números y limitar a 15 caracteres
              const numericValue = value.replace(/[^0-9]/g, '').slice(0, 15);
              handleInputChange('Telefono_Usuarios', numericValue);

            }}
            onFocus={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO TELEFONO - ${time} ${date}`);
            }}
            keyboardType="phone-pad"
            maxLength={15}
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          {validationErrors.Telefono_Usuarios ? (
            <Text style={styles.errorText}>{validationErrors.Telefono_Usuarios}</Text>
          ) : null}
          {/* Validar/Omitir Teléfono */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.registerButton, { flex: 1, marginRight: 8 }]}
              onPress={() => {
                setIsValidating(true);
                setTimeout(() => {
                  setIsValidating(false);
                  setPhoneVerified(true);
                  Alert.alert('Verificación', 'Se envió un código a tu teléfono.');
                }, 800);
              }}
            >
              <LinearGradient
                colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>Validar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.registerButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setPhoneVerified(true)}
            >
              <LinearGradient
                colors={isDarkMode ? ['#9E9E9E', '#757575'] : ['#757575', '#9E9E9E']}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>Omitir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          </>
          )}

          {currentStep === 2 && (
            <>
              {/* Dirección */}
              <Text style={[styles.label, { color: themeColors.text }]}>Calle *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa tu calle"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Direccion_Usuarios}
                onChangeText={(value) => handleInputChange('Direccion_Usuarios', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO DIRECCION - ${time} ${date}`);
                }}
                autoComplete="street-address"
                textContentType="fullStreetAddress"
              />

              {/* Número de Calle */}
              <Text style={[styles.label, { color: themeColors.text }]}>Número *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Número de calle"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.NroCalle_Usuarios}
                onChangeText={(value) => handleInputChange('NroCalle_Usuarios', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO NUMERO DE CALLE - ${time} ${date}`);
                }}
                keyboardType="numeric"
                autoComplete="off"
              />

              {/* Piso (opcional) */}
              <Text style={[styles.label, { color: themeColors.text }]}>Piso (opcional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Piso"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Piso_Usuarios}
                onChangeText={(value) => handleInputChange('Piso_Usuarios', value)}
              />

              {/* Departamento (opcional) */}
              <Text style={[styles.label, { color: themeColors.text }]}>Departamento (opcional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Departamento"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Departamento_Usuarios}
                onChangeText={(value) => handleInputChange('Departamento_Usuarios', value)}
              />

              {/* Barrio */}
              <Text style={[styles.label, { color: themeColors.text }]}>Barrio *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa tu barrio"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Barrio_Usuarios}
                onChangeText={(value) => handleInputChange('Barrio_Usuarios', value)}
              />

              {/* Provincia */}
              <Text style={[styles.label, { color: themeColors.text }]}>Provincia *</Text>
              <View style={[styles.readOnlyInput, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <Text style={[styles.readOnlyText, { color: themeColors.textSecondary }]}>{formData.Provincia_Usuarios || 'Misiones'}</Text>
              </View>

              {/* Municipio */}
              <Text style={[styles.label, { color: themeColors.text }]}>Municipio *</Text>
              <View style={[styles.pickerContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <Picker
                  selectedValue={formData.Municipios_Usuarios}
                  onValueChange={(value) => handleInputChange('Municipios_Usuarios', value)}
                  style={[styles.picker, { color: themeColors.text }]}
                >
                  <Picker.Item label="Selecciona tu municipio..." value="" />
                  <Picker.Item label="25 de Mayo" value="25 de Mayo" />
              <Picker.Item label="Alba Posse" value="Alba Posse" />
              <Picker.Item label="Almafuerte" value="Almafuerte" />
              <Picker.Item label="Apostoles" value="Apostoles" />
              <Picker.Item label="Aristobulo del Valle" value="Aristobulo del Valle" />
              <Picker.Item label="Arroyo del Medio" value="Arroyo del Medio" />
              <Picker.Item label="Azara" value="Azara" />
              <Picker.Item label="Bernardo de Irigoyen" value="Bernardo de Irigoyen" />
              <Picker.Item label="Bonpland" value="Bonpland" />
              <Picker.Item label="Caa Yari" value="Caa Yari" />
              <Picker.Item label="Campo Grande" value="Campo Grande" />
              <Picker.Item label="Campo Ramon" value="Campo Ramon" />
              <Picker.Item label="Campo Viera" value="Campo Viera" />
              <Picker.Item label="Candelaria" value="Candelaria" />
              <Picker.Item label="Capiovi" value="Capiovi" />
              <Picker.Item label="Caraguatay" value="Caraguatay" />
              <Picker.Item label="Cerro Azul" value="Cerro Azul" />
              <Picker.Item label="Colonia Alberdi" value="Colonia Alberdi" />
              <Picker.Item label="Colonia Aurora" value="Colonia Aurora" />
              <Picker.Item label="Colonia Delicia" value="Colonia Delicia" />
              <Picker.Item label="Colonia Polana" value="Colonia Polana" />
              <Picker.Item label="Colonia Victoria" value="Colonia Victoria" />
              <Picker.Item label="Comandante Andresito" value="Comandante Andresito" />
              <Picker.Item label="Concepcion de la Sierra" value="Concepcion de la Sierra" />
              <Picker.Item label="Corpus" value="Corpus" />
              <Picker.Item label="Dos Arroyos" value="Dos Arroyos" />
              <Picker.Item label="Dos de Mayo" value="Dos de Mayo" />
              <Picker.Item label="El Alcazar" value="El Alcazar" />
              <Picker.Item label="El Soberbio" value="El Soberbio" />
              <Picker.Item label="Fachinal" value="Fachinal" />
              <Picker.Item label="Florentino Ameghino" value="Florentino Ameghino" />
              <Picker.Item label="Garuhape" value="Garuhape" />
              <Picker.Item label="Garupa" value="Garupa" />
              <Picker.Item label="General Alvear" value="General Alvear" />
              <Picker.Item label="General Urquiza" value="General Urquiza" />
              <Picker.Item label="Gobernador Lopez" value="Gobernador Lopez" />
              <Picker.Item label="Gobernador Roca" value="Gobernador Roca" />
              <Picker.Item label="Guarani" value="Guarani" />
              <Picker.Item label="Hipolito Yrigoyen" value="Hipolito Yrigoyen" />
              <Picker.Item label="Iguazu (Puerto Iguazu)" value="Iguazu (Puerto Iguazu)" />
              <Picker.Item label="Itacaruare" value="Itacaruare" />
              <Picker.Item label="Jardin America" value="Jardin America" />
              <Picker.Item label="Leandro N. Alem" value="Leandro N. Alem" />
              <Picker.Item label="Loreto" value="Loreto" />
              <Picker.Item label="Los Helechos" value="Los Helechos" />
              <Picker.Item label="Martires" value="Martires" />
              <Picker.Item label="Mojon Grande" value="Mojon Grande" />
              <Picker.Item label="Montecarlo" value="Montecarlo" />
              <Picker.Item label="Nueve de Julio" value="Nueve de Julio" />
              <Picker.Item label="Obera" value="Obera" />
              <Picker.Item label="Olegario V. Andrade" value="Olegario V. Andrade" />
              <Picker.Item label="Panambi" value="Panambi" />
              <Picker.Item label="Posadas" value="Posadas" />
              <Picker.Item label="Profundidad" value="Profundidad" />
              <Picker.Item label="Puerto Esperanza" value="Puerto Esperanza" />
              <Picker.Item label="Puerto Leoni" value="Puerto Leoni" />
              <Picker.Item label="Puerto Libertad" value="Puerto Libertad" />
              <Picker.Item label="Puerto Piray" value="Puerto Piray" />
              <Picker.Item label="Puerto Rico" value="Puerto Rico" />
              <Picker.Item label="Ruiz de Montoya" value="Ruiz de Montoya" />
              <Picker.Item label="San Antonio" value="San Antonio" />
              <Picker.Item label="San Ignacio" value="San Ignacio" />
              <Picker.Item label="San Javier" value="San Javier" />
              <Picker.Item label="San Jose" value="San Jose" />
              <Picker.Item label="San Martin" value="San Martin" />
              <Picker.Item label="San Pedro" value="San Pedro" />
              <Picker.Item label="San Vicente" value="San Vicente" />
              <Picker.Item label="Santa Ana" value="Santa Ana" />
              <Picker.Item label="Santiago de Liniers" value="Santiago de Liniers" />
              <Picker.Item label="Santo Pipo" value="Santo Pipo" />
              <Picker.Item label="Tres Capones" value="Tres Capones" />
              <Picker.Item label="Villa Libertad" value="Villa Libertad" />
              <Picker.Item label="Wanda" value="Wanda" />
            </Picker>
          </View>

          {/* Siguiente 2/3 */}
          <TouchableOpacity
            style={[styles.registerButton, styles.registerButtonSection2]}
            onPress={() => setCurrentStep(3)}
          >
            <LinearGradient
              colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
              style={styles.registerButtonGradient}
            >
              <Text style={styles.registerButtonText}>Siguiente 2/3</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
      {currentStep === 3 && (
        <>
          {/* Contraseña */}
          <Text style={[styles.label, { color: themeColors.text }]}>Contraseña *</Text>
          <View style={[styles.passwordContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: themeColors.text }]}
              placeholder="Mínimo 6 caracteres"
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
              autoComplete="new-password"
              textContentType="newPassword"
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
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Confirmar Contraseña */}
          <Text style={[styles.label, { color: themeColors.text }]}>Confirmar Contraseña *</Text>
          <View style={[
            styles.passwordContainer, 
            passwordError !== '' ? styles.passwordContainerError : null,
            { backgroundColor: themeColors.background, borderColor: themeColors.border }
          ]}>
            <TextInput
              style={[styles.passwordInput, { color: themeColors.text }]}
              placeholder="Repite tu contraseña"
              placeholderTextColor={themeColors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              onFocus={() => {
                const now = new Date();
                const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO CONFIRMAR CONTRASEÑA - ${time} ${date}`);
              }}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => {
                const now = new Date();
                const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                console.log(`[EYEBUTTON] EL USUARIO APRETO EL BOTON VER/OCULTAR CONFIRMAR CONTRASEÑA - ${time} ${date}`);
                setShowConfirmPassword(!showConfirmPassword);
              }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
          {passwordError !== '' ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          
        </LinearGradient>

        {/* Botón de registro */}
        {currentStep === 3 && (
          <>
        <TouchableOpacity 
          style={[
            styles.registerButton, 
            (isLoading || passwordError !== '' || isValidating || Object.values(validationErrors).some(error => error !== '')) && styles.registerButtonDisabled
          ]} 
          onPress={() => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[BUTTON] EL USUARIO ENTRO A REGISTRARSE - ${time} ${date}`);
            handleRegister();
          }}
          disabled={isLoading || passwordError !== '' || isValidating || Object.values(validationErrors).some(error => error !== '')}
        >
          <LinearGradient
            colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
            style={styles.registerButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isValidating ? (
              <Text style={styles.registerButtonText}>Validando...</Text>
            ) : (
              <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
          </>
        )}

        {/* Link a login */}
        <View style={styles.loginLinkContainer}>
          <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity 
            onPress={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[BUTTON] EL USUARIO ENTRO A INICIAR SESION - ${time} ${date}`);
              navigation.navigate('Login');
            }}
          >
            <Text style={[styles.loginLink, { color: themeColors.primary }]}>Iniciar Sesión</Text>
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
    // Reducimos el padding superior para acercar el título a la parte alta del card
    paddingTop: getResponsiveSize(12, 10, 8),
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
    marginBottom: getResponsiveSize(25, 20, 16),
  },
  label: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: 'bold',
    marginTop: getResponsiveSize(16, 12, 10),
    marginBottom: getResponsiveSize(12, 10, 8),
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: getResponsiveSize(15, 12, 10),
    fontSize: getResponsiveSize(16, 14, 12),
    minHeight: getResponsiveSize(54, 48, 42),
  },
  inputError: {
    borderColor: '#f44336',
  },
  passwordContainer: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
    minHeight: 54,
  },
  passwordContainerError: {
    borderColor: '#f44336',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // Movemos el título más arriba reduciendo el margen superior
    marginTop: getResponsiveSize(8, 6, 4),
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 5,
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 15,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
  },
  registerButton: {
    borderRadius: 16,
    marginBottom: getResponsiveSize(15, 12, 10),
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
  registerButtonGradient: {
    padding: getResponsiveSize(18, 16, 14),
    alignItems: 'center',
    minHeight: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
  },
  // Espaciado extra para el botón de Siguiente 2/3 en Sección 2
  registerButtonSection2: {
    marginTop: getResponsiveSize(24, 20, 16),
  },
  // Espaciado extra para el botón de Siguiente 1/3 en Sección 1
  registerButtonSection1: {
    marginTop: getResponsiveSize(24, 20, 16),
  },
  registerButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(18, 16, 14),
    fontWeight: 'bold',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(20, 15, 12),
    marginTop: 'auto',
    paddingTop: getResponsiveSize(20, 15, 12),
  },
  loginLinkText: {
    fontSize: getResponsiveSize(16, 14, 12),
  },
  loginLink: {
    fontSize: getResponsiveSize(16, 14, 12),
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImageLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  selectedProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  profileImageName: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  changeImageButton: {
    borderRadius: 20,
    marginTop: 10,
    overflow: 'hidden',
  },
  changeImageButtonGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  changeImageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});