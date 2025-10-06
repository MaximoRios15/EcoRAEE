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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

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
    Municipios_Usuarios: '',
    Password_Usuarios: '',
    confirmPassword: '',
    // Campos adicionales para instituciones
    NroLegajo_Institucion: '',
    Tipo_Institucion: 1,
    Contacto_Institucion: '',
    RegistroTitulo_Institucion: '',
    // Campos adicionales para técnicos
    Certificado_Tecnico: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { signUp } = useAuth();

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

  // Función para validar DNI
  const validateDNI = async (dni) => {
    if (!dni || dni.length < 7) return;
    
    setIsValidating(true);
    try {
      const response = await ApiService.validateDni(dni);
      
      if (response.success && !response.data.available) {
        setValidationErrors(prev => ({
          ...prev,
          DNI_Usuarios: 'Este DNI ya está registrado'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          DNI_Usuarios: ''
        }));
      }
    } catch (error) {
      console.error('Error validating DNI:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Función para validar Email
  const validateEmail = async (email) => {
    if (!email || !email.includes('@')) return;
    
    setIsValidating(true);
    try {
      const response = await ApiService.validateEmail(email);
      
      if (response.success && !response.data.available) {
        setValidationErrors(prev => ({
          ...prev,
          Email_Usuarios: 'Este email ya está registrado'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          Email_Usuarios: ''
        }));
      }
    } catch (error) {
      console.error('Error validating email:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Función para validar Teléfono
  const validateTelefono = async (telefono) => {
    if (!telefono || telefono.length < 10) return;
    
    setIsValidating(true);
    try {
      const response = await ApiService.validateTelefono(telefono);
      
      if (response.success && !response.data.available) {
        setValidationErrors(prev => ({
          ...prev,
          Telefono_Usuarios: 'Este teléfono ya está registrado'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          Telefono_Usuarios: ''
        }));
      }
    } catch (error) {
      console.error('Error validating telefono:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegister = async () => {
    // Validación básica
    if (!formData.DNI_Usuarios || !formData.Nombres_Usuarios || !formData.Apellidos_Usuarios || !formData.Email_Usuarios || 
        !formData.Telefono_Usuarios || !formData.Direccion_Usuarios || !formData.Municipios_Usuarios || !formData.Password_Usuarios) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Verificar si hay errores de validación
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasValidationErrors) {
      Alert.alert('Error', 'Por favor corrige los errores de validación antes de continuar');
      return;
    }

    // Verificar si está validando
    if (isValidating) {
      Alert.alert('Espera', 'Por favor espera mientras se validan los datos');
      return;
    }

    // Validar formato DNI
    if (!/^\d{7,8}$/.test(formData.DNI_Usuarios)) {
      Alert.alert('Error', 'El DNI debe contener entre 7 y 8 dígitos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email_Usuarios)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Validar confirmación de contraseña
    if (formData.Password_Usuarios !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (formData.Password_Usuarios.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validaciones específicas por tipo de usuario
    if (formData.Roles_Usuarios === 2) { // Institución
      if (!formData.NroLegajo_Institucion || !formData.Contacto_Institucion || !formData.RegistroTitulo_Institucion) {
        Alert.alert('Error', 'Para instituciones, completa los campos de número de legajo, contacto y registro');
        return;
      }
    } else if (formData.Roles_Usuarios === 3) { // Técnico
      if (!formData.Certificado_Tecnico) {
        Alert.alert('Error', 'Para técnicos, completa el campo de certificado');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Seleccionar imagen de perfil aleatoria
      const profileImage = selectRandomProfileImage();
      
      // Preparar datos para enviar al backend
      const registrationData = {
        DNI_Usuarios: formData.DNI_Usuarios,
        Nombres_Usuarios: formData.Nombres_Usuarios,
        Apellidos_Usuarios: formData.Apellidos_Usuarios,
        Roles_Usuarios: formData.Roles_Usuarios,
        Email_Usuarios: formData.Email_Usuarios,
        Telefono_Usuarios: formData.Telefono_Usuarios,
        Direccion_Usuarios: formData.Direccion_Usuarios,
        NroCalle_Usuarios: formData.NroCalle_Usuarios,
        Provincia_Usuarios: 'Misiones',
        Municipios_Usuarios: formData.Municipios_Usuarios,
        Password_Usuarios: formData.Password_Usuarios,
        ImagenPerfil_Usuarios: profileImage,
      };

      // Agregar campos específicos según el tipo de usuario
      if (formData.Roles_Usuarios === 2) { // Institución
        registrationData.NroLegajo_Institucion = formData.NroLegajo_Institucion;
        registrationData.Tipo_Institucion = formData.Tipo_Institucion;
        registrationData.Contacto_Institucion = formData.Contacto_Institucion;
        registrationData.RegistroTitulo_Institucion = formData.RegistroTitulo_Institucion;
      } else if (formData.Roles_Usuarios === 3) { // Técnico
        registrationData.Certificado_Tecnico = formData.Certificado_Tecnico;
      }

      const result = await signUp(registrationData);

      if (result.success) {
        Alert.alert('Éxito', result.message || 'Usuario registrado correctamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Error al registrar usuario');
      }
    } catch (error) {
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

      <ScrollView style={styles.scrollContainer}>
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

        {/* Imagen de perfil seleccionada */}
        {selectedProfileImage && (
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
              // Solo permitir números y limitar a 8 dígitos
              const numericValue = value.replace(/[^0-9]/g, '').slice(0, 8);
              handleInputChange('DNI_Usuarios', numericValue);
              
              // Validar DNI después de un pequeño delay
              if (numericValue.length >= 7) {
                setTimeout(() => validateDNI(numericValue), 1000);
              }
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

          {/* Tipo de Usuario */}
          <Text style={[styles.label, { color: themeColors.text }]}>Tipos de Usuario *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('Roles_Usuarios', value)}
              items={[
                { label: 'Ciudadano', value: 1 },
                { label: 'Tecnico', value: 3 },
                { label: 'Institucion', value: 2 },
              ]}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                placeholder: {
                  color: themeColors.textSecondary,
                  fontSize: 16,
                },
              }}
              value={formData.Roles_Usuarios}
              placeholder={{}}
            />
          </View>

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
              
              // Validar email después de un pequeño delay
              if (value.includes('@') && value.includes('.')) {
                setTimeout(() => validateEmail(value), 1000);
              }
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
              
              // Validar teléfono después de un pequeño delay
              if (numericValue.length >= 10) {
                setTimeout(() => validateTelefono(numericValue), 1000);
              }
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

          {/* Dirección */}
          <Text style={[styles.label, { color: themeColors.text }]}>Dirección *</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }
            ]}
            placeholder="Ingresa tu dirección completa"
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
          <Text style={[styles.label, { color: themeColors.text }]}>Número de Calle</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text 
              }
            ]}
            placeholder="Número de calle (opcional)"
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

          {/* Provincia */}
          <Text style={[styles.label, { color: themeColors.text }]}>Provincia *</Text>
          <View style={[styles.readOnlyInput, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <Text style={[styles.readOnlyText, { color: themeColors.textSecondary }]}>Misiones</Text>
          </View>

          {/* Municipio */}
          <Text style={[styles.label, { color: themeColors.text }]}>Municipio *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('Municipios_Usuarios', value)}
              items={[
                { label: '25 de Mayo', value: '25 de Mayo' },
                { label: 'Alba Posse', value: 'Alba Posse' },
                { label: 'Almafuerte', value: 'Almafuerte' },
                { label: 'Apostoles', value: 'Apostoles' },
                { label: 'Aristobulo del Valle', value: 'Aristobulo del Valle' },
                { label: 'Arroyo del Medio', value: 'Arroyo del Medio' },
                { label: 'Azara', value: 'Azara' },
                { label: 'Bernardo de Irigoyen', value: 'Bernardo de Irigoyen' },
                { label: 'Bonpland', value: 'Bonpland' },
                { label: 'Caa Yari', value: 'Caa Yari' },
                { label: 'Campo Grande', value: 'Campo Grande' },
                { label: 'Campo Ramon', value: 'Campo Ramon' },
                { label: 'Campo Viera', value: 'Campo Viera' },
                { label: 'Candelaria', value: 'Candelaria' },
                { label: 'Capiovi', value: 'Capiovi' },
                { label: 'Caraguatay', value: 'Caraguatay' },
                { label: 'Cerro Azul', value: 'Cerro Azul' },
                { label: 'Colonia Alberdi', value: 'Colonia Alberdi' },
                { label: 'Colonia Aurora', value: 'Colonia Aurora' },
                { label: 'Colonia Delicia', value: 'Colonia Delicia' },
                { label: 'Colonia Polana', value: 'Colonia Polana' },
                { label: 'Colonia Victoria', value: 'Colonia Victoria' },
                { label: 'Comandante Andresito', value: 'Comandante Andresito' },
                { label: 'Concepcion de la Sierra', value: 'Concepcion de la Sierra' },
                { label: 'Corpus', value: 'Corpus' },
                { label: 'Dos Arroyos', value: 'Dos Arroyos' },
                { label: 'Dos de Mayo', value: 'Dos de Mayo' },
                { label: 'El Alcazar', value: 'El Alcazar' },
                { label: 'El Soberbio', value: 'El Soberbio' },
                { label: 'Fachinal', value: 'Fachinal' },
                { label: 'Florentino Ameghino', value: 'Florentino Ameghino' },
                { label: 'Garuhape', value: 'Garuhape' },
                { label: 'Garupa', value: 'Garupa' },
                { label: 'General Alvear', value: 'General Alvear' },
                { label: 'General Urquiza', value: 'General Urquiza' },
                { label: 'Gobernador Lopez', value: 'Gobernador Lopez' },
                { label: 'Gobernador Roca', value: 'Gobernador Roca' },
                { label: 'Guarani', value: 'Guarani' },
                { label: 'Hipolito Yrigoyen', value: 'Hipolito Yrigoyen' },
                { label: 'Iguazu (Puerto Iguazu)', value: 'Iguazu (Puerto Iguazu)' },
                { label: 'Itacaruare', value: 'Itacaruare' },
                { label: 'Jardin America', value: 'Jardin America' },
                { label: 'Leandro N. Alem', value: 'Leandro N. Alem' },
                { label: 'Loreto', value: 'Loreto' },
                { label: 'Los Helechos', value: 'Los Helechos' },
                { label: 'Martires', value: 'Martires' },
                { label: 'Mojon Grande', value: 'Mojon Grande' },
                { label: 'Montecarlo', value: 'Montecarlo' },
                { label: 'Nueve de Julio', value: 'Nueve de Julio' },
                { label: 'Obera', value: 'Obera' },
                { label: 'Olegario V. Andrade', value: 'Olegario V. Andrade' },
                { label: 'Panambi', value: 'Panambi' },
                { label: 'Posadas', value: 'Posadas' },
                { label: 'Profundidad', value: 'Profundidad' },
                { label: 'Puerto Esperanza', value: 'Puerto Esperanza' },
                { label: 'Puerto Leoni', value: 'Puerto Leoni' },
                { label: 'Puerto Libertad', value: 'Puerto Libertad' },
                { label: 'Puerto Piray', value: 'Puerto Piray' },
                { label: 'Puerto Rico', value: 'Puerto Rico' },
                { label: 'Ruiz de Montoya', value: 'Ruiz de Montoya' },
                { label: 'San Antonio', value: 'San Antonio' },
                { label: 'San Ignacio', value: 'San Ignacio' },
                { label: 'San Javier', value: 'San Javier' },
                { label: 'San Jose', value: 'San Jose' },
                { label: 'San Martin', value: 'San Martin' },
                { label: 'San Pedro', value: 'San Pedro' },
                { label: 'San Vicente', value: 'San Vicente' },
                { label: 'Santa Ana', value: 'Santa Ana' },
                { label: 'Santiago de Liniers', value: 'Santiago de Liniers' },
                { label: 'Santo Pipo', value: 'Santo Pipo' },
                { label: 'Tres Capones', value: 'Tres Capones' },
                { label: 'Villa Libertad', value: 'Villa Libertad' },
                { label: 'Wanda', value: 'Wanda' },
              ]}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                placeholder: {
                  color: themeColors.textSecondary,
                  fontSize: 16,
                },
              }}
              placeholder={{
                label: 'Selecciona tu municipio...',
                value: null,
              }}
              value={formData.Municipios_Usuarios}
            />
          </View>

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
          {passwordError !== '' ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Campos específicos para Instituciones */}
          {formData.Roles_Usuarios === 2 && (
            <>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Datos de la Institución</Text>
              
              {/* Número de Legajo */}
              <Text style={[styles.label, { color: themeColors.text }]}>Número de Legajo *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Ingresa el número de legajo"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.NroLegajo_Institucion}
                onChangeText={(value) => handleInputChange('NroLegajo_Institucion', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO LEGAJO - ${time} ${date}`);
                }}
              />

              {/* Tipo de Institución */}
              <Text style={[styles.label, { color: themeColors.text }]}>Tipo de Institución *</Text>
              <View style={[styles.pickerContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <RNPickerSelect
                  onValueChange={(value) => handleInputChange('Tipo_Institucion', value)}
                  items={[
                    { label: 'Educativa', value: 1 },
                    { label: 'Gubernamental', value: 2 },
                    { label: 'ONG', value: 3 },
                    { label: 'Empresa Privada', value: 4 },
                    { label: 'Otro', value: 5 },
                  ]}
                  style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  color: themeColors.text,
                  backgroundColor: 'transparent',
                },
                placeholder: {
                  color: themeColors.textSecondary,
                  fontSize: 16,
                },
              }}
                  value={formData.Tipo_Institucion}
                  placeholder={{}}
                />
              </View>

              {/* Contacto */}
              <Text style={[styles.label, { color: themeColors.text }]}>Contacto *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Persona de contacto"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Contacto_Institucion}
                onChangeText={(value) => handleInputChange('Contacto_Institucion', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO CONTACTO - ${time} ${date}`);
                }}
              />

              {/* Registro/Título */}
              <Text style={[styles.label, { color: themeColors.text }]}>Registro/Título *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Número de registro o título"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.RegistroTitulo_Institucion}
                onChangeText={(value) => handleInputChange('RegistroTitulo_Institucion', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO REGISTRO - ${time} ${date}`);
                }}
              />
            </>
          )}

          {/* Campos específicos para Técnicos */}
          {formData.Roles_Usuarios === 3 && (
            <>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Datos del Técnico</Text>
              
              {/* Certificado Técnico */}
              <Text style={[styles.label, { color: themeColors.text }]}>Certificado Técnico *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }
                ]}
                placeholder="Número de certificado técnico"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.Certificado_Tecnico}
                onChangeText={(value) => handleInputChange('Certificado_Tecnico', value)}
                onFocus={() => {
                  const now = new Date();
                  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO CERTIFICADO - ${time} ${date}`);
                }}
              />
            </>
          )}
        </LinearGradient>

        {/* Botón de registro */}
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
    marginBottom: 7.5,
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
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
    marginTop: 20,
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
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  registerButton: {
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
  registerButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: '#333',
    backgroundColor: '#fff',
  },
  placeholder: {
    color: '#333',
    fontSize: 16,
  },
});