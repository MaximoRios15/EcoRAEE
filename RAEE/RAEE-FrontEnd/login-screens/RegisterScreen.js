import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isVerySmallScreen = screenHeight < 600;

const getResponsiveSize = (baseSize, smallScreenMultiplier = 0.8, verySmallScreenMultiplier = 0.7) => {
  if (isVerySmallScreen) return Math.round(baseSize * verySmallScreenMultiplier);
  if (isSmallScreen) return Math.round(baseSize * smallScreenMultiplier);
  return baseSize;
};

// Componente RainbowText replicado de LoginScreen para el nombre de la app
const RainbowText = ({ children, style }) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  const colors = ['#066c34', '#319417', '#51b003', '#319417', '#066c34'];
  const text = children;

  useEffect(() => {
    let animationLoop;
    const animateColors = () => {
      animationLoop = Animated.loop(
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
      );
      animationLoop.start();
    };
    animateColors();
    
    // Cleanup function para detener la animación
    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [animationValue]);

  return (
    <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
      {String(text).split('').map((char, index) => {
        const wavePosition = animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-0.2, 1.2],
        });
        const charPosition = index / (String(text).length - 1 || 1);
        const colorIndex = wavePosition.interpolate({
          inputRange: [charPosition - 0.2, charPosition + 0.2],
          outputRange: [0, colors.length - 1],
        });
        const interpolatedColor = colorIndex.interpolate({
          inputRange: colors.map((_, i) => i),
          outputRange: colors,
          extrapolate: 'clamp',
        });
        return (
          <Animated.Text key={`${char}-${index}`} style={[style, { color: interpolatedColor }]}>
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default function RegisterScreen({ navigation }) {
  const { isDarkMode, toggleTheme, themeColors } = useTheme();

  const [formData, setFormData] = useState({
    DNI_Usuarios: '',
    Nombres_Usuarios: '',
    Apellidos_Usuarios: '',
    Roles_Usuarios: '1',
    Email_Usuarios: '',
    Telefono_Usuarios: '',
    Calle_Direcciones: '',
    Numero_Direcciones: '',
    Piso_Direcciones: '',
    Departamento_Direcciones: '',
    Barrio_Direcciones: '',
    Provincia_Usuarios: 'Misiones',
    idMunicipios_Direcciones: '',
    Password_Usuarios: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(true);

  // Coincidencia y validez de contraseña en tiempo real
  const passwordsMatch = formData.Password_Usuarios === confirmPassword;
  const isPasswordValid = (formData.Password_Usuarios || '').length >= 6;

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      DNI_Usuarios: '',
      Nombres_Usuarios: '',
      Apellidos_Usuarios: '',
      Roles_Usuarios: '1',
      Email_Usuarios: '',
      Telefono_Usuarios: '',
      Calle_Direcciones: '',
      Numero_Direcciones: '',
      Piso_Direcciones: '',
      Departamento_Direcciones: '',
      Barrio_Direcciones: '',
      Provincia_Usuarios: 'Misiones',
      idMunicipios_Direcciones: '',
      Password_Usuarios: '',
    });
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    const loadMunicipios = async () => {
      try {
        const list = await ApiService.getMunicipios();
        setMunicipios(Array.isArray(list) ? list : []);
      } catch (err) {
        setMunicipios([]);
      } finally {
        setIsLoadingMunicipios(false);
      }
    };
    loadMunicipios();
  }, []);

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    // Validaciones básicas
    if (!formData.DNI_Usuarios?.trim() || !/^\d{7,8}$/.test(formData.DNI_Usuarios.trim())) {
      Alert.alert('Error', 'DNI inválido (7-8 dígitos)');
      return false;
    }
    if (!formData.Nombres_Usuarios?.trim()) {
      Alert.alert('Error', 'Nombre requerido');
      return false;
    }
    if (!formData.Apellidos_Usuarios?.trim()) {
      Alert.alert('Error', 'Apellido requerido');
      return false;
    }
    if (!formData.Email_Usuarios?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email_Usuarios)) {
      Alert.alert('Error', 'Email inválido');
      return false;
    }
    if (!formData.Telefono_Usuarios?.trim() || formData.Telefono_Usuarios.replace(/\D/g, '').length < 6) {
      Alert.alert('Error', 'Teléfono inválido');
      return false;
    }
    if (!formData.Calle_Direcciones?.trim()) {
      Alert.alert('Error', 'Calle requerida');
      return false;
    }
    if (!formData.Numero_Direcciones?.trim() || !/^\d+$/.test(formData.Numero_Direcciones)) {
      Alert.alert('Error', 'Número de calle inválido');
      return false;
    }
    if (!formData.Barrio_Direcciones?.trim()) {
      Alert.alert('Error', 'Barrio requerido');
      return false;
    }
    if (!formData.idMunicipios_Direcciones || formData.idMunicipios_Direcciones === '' || formData.idMunicipios_Direcciones === null) {
      Alert.alert('Error', 'Debe seleccionar un municipio');
      return false;
    }
    // Verificar que el municipio sea un número válido
    const municipioId = Number(formData.idMunicipios_Direcciones);
    if (isNaN(municipioId) || municipioId <= 0) {
      Alert.alert('Error', 'Debe seleccionar un municipio válido');
      return false;
    }
    if (!formData.Password_Usuarios || formData.Password_Usuarios.length < 6) {
      Alert.alert('Error', 'Contraseña mínimo 6 caracteres');
      return false;
    }
    if (formData.Password_Usuarios !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Validación server-side limitada a endpoints disponibles

      const direccion = {
        Calle_Direcciones: formData.Calle_Direcciones,
        Numero_Direcciones: formData.Numero_Direcciones,
        Piso_Direcciones: formData.Piso_Direcciones || null,
        Departamento_Direcciones: formData.Departamento_Direcciones || null,
        Barrio_Direcciones: formData.Barrio_Direcciones,
        idMunicipios_Direcciones: Number(formData.idMunicipios_Direcciones),
      };
      const payload = {
        DNI_Usuarios: formData.DNI_Usuarios,
        Nombres_Usuarios: formData.Nombres_Usuarios,
        Apellidos_Usuarios: formData.Apellidos_Usuarios,
        Roles_Usuarios: formData.Roles_Usuarios,
        Email_Usuarios: formData.Email_Usuarios,
        Telefono_Usuarios: formData.Telefono_Usuarios,
        Password_Usuarios: formData.Password_Usuarios,
        direccion,
      };
      
      const res = await ApiService.register(payload);
      if (res && (res.success === true || res.status === 'success')) {
        Alert.alert('Registro exitoso', 'Tu cuenta fue creada correctamente.', [
          { 
            text: 'Ir a Login', 
            onPress: () => {
              resetForm();
              navigation.navigate('Login');
            }
          },
        ]);
      } else {
        const msg = res?.message || 'No se pudo completar el registro.';
        Alert.alert('Error', msg);
      }
    } catch (err) {
      console.error('Error en registro:', err);
      Alert.alert('Error', 'Ocurrió un problema al registrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
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

      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView style={[styles.scrollView, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Logo y nombre de la app */}
            <View style={styles.logoContainer}>
              <Image source={require('../img/logo-EcoRAEE.png')} style={styles.logoImageLarge} resizeMode="contain" />
              <RainbowText style={styles.appNameLarge}>EcoRAEE</RainbowText>
            </View>

            {/* Título */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: themeColors.text }]}>Crear cuenta</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Completa tus datos para registrarte</Text>
            </View>

            {/* Formulario con gradient como en LoginScreen */}
            <LinearGradient
              colors={isDarkMode ? ['#2C2C3E', '#1A1A2E'] : ['#F8F9FA', '#E9ECEF']}
              style={styles.formCard}
            >
              {/* DNI */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>DNI *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Ej: 12345678"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.DNI_Usuarios}
                  onChangeText={(t) => updateField('DNI_Usuarios', t)}
                  maxLength={8}
                />
              </View>

              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Nombre/s *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Tu nombre"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.Nombres_Usuarios}
                  onChangeText={(t) => updateField('Nombres_Usuarios', t)}
                  maxLength={50}
                />
              </View>

              {/* Apellido */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Apellido/s *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Tu apellido"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.Apellidos_Usuarios}
                  onChangeText={(t) => updateField('Apellidos_Usuarios', t)}
                  maxLength={50}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Email *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.Email_Usuarios}
                  onChangeText={(t) => updateField('Email_Usuarios', t)}
                  maxLength={100}
                />
              </View>

              {/* Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Teléfono *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Ej: 3704 123456"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="phone-pad"
                  value={formData.Telefono_Usuarios}
                  onChangeText={(t) => updateField('Telefono_Usuarios', t)}
                  maxLength={14}
                />
              </View>

              {/* Calle */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Calle *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Calle"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.Calle_Direcciones}
                  onChangeText={(t) => updateField('Calle_Direcciones', t)}
                  maxLength={50}
                />
              </View>

              {/* Número de calle */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Número Calle *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Ej: 1234"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.Numero_Direcciones}
                  onChangeText={(t) => updateField('Numero_Direcciones', t)}
                  maxLength={10}
                />
              </View>

              {/* Piso (opcional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Piso (opcional)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Ej: 3"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.Piso_Direcciones}
                  onChangeText={(t) => updateField('Piso_Direcciones', t)}
                  maxLength={10}
                />
              </View>

              {/* Departamento (opcional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Departamento (opcional)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Ej: A"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.Departamento_Direcciones}
                  onChangeText={(t) => updateField('Departamento_Direcciones', t)}
                  maxLength={10}
                />
              </View>

              {/* Barrio */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Barrio *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }]}
                  placeholder="Tu barrio"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.Barrio_Direcciones}
                  onChangeText={(t) => updateField('Barrio_Direcciones', t)}
                  maxLength={50}
                />
              </View>

              {/* Provincia (fija Misiones) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Provincia *</Text>
                <TextInput
                  editable={false}
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#2E2E3E' : '#E9ECEF',
                    borderColor: isDarkMode ? '#3A3A4A' : '#CFD3D8',
                    color: isDarkMode ? '#B0B3B8' : '#495057' 
                  }]}
                  value={formData.Provincia_Usuarios}
                />
              </View>

              {/* Municipio */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Municipio *</Text>
                {isLoadingMunicipios ? (
                  <View style={[styles.input, styles.pickerLoading, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}>
                    <ActivityIndicator size="small" color={themeColors.textSecondary} />
                    <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Cargando municipios...</Text>
                  </View>
                ) : (
                  <View style={[styles.pickerInput, { 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border 
                  }]}>
                    <Picker
                      selectedValue={formData.idMunicipios_Direcciones}
                      onValueChange={(value) => updateField('idMunicipios_Direcciones', String(value || ''))}
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: themeColors.text,
                        flex: 1
                      }}
                      dropdownIconColor={themeColors.text}
                      itemStyle={{ color: '#000000' }}
                    >
                      <Picker.Item
                        label="Selecciona un municipio"
                        value=""
                        color={themeColors.textSecondary}
                      />
                      {municipios
                        .filter(m => m && (m.Nombres_Municipios || m.nombre)) // Filtrar elementos válidos
                        .map((m) => {
                          const label = m.Nombres_Municipios || m.nombre || 'Municipio sin nombre';
                          const value = String(m.idMunicipios || m.id || '');
                          return (
                            <Picker.Item
                              key={value}
                              label={label}
                              value={value}
                              color="#000000"
                            />
                          );
                        })}
                    </Picker>
                  </View>
                )}
              </View>

              {/* Tipo de Rol (predeterminado) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Tipo de Rol *</Text>
                <TextInput
                  editable={false}
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#2E2E3E' : '#E9ECEF',
                    borderColor: isDarkMode ? '#3A3A4A' : '#CFD3D8',
                    color: isDarkMode ? '#B0B3B8' : '#495057' 
                  }]}
                  value="Ciudadano"
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Contraseña *</Text>
                <View style={[styles.passwordContainer, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: themeColors.text }]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry={!showPassword}
                    value={formData.Password_Usuarios}
                    onChangeText={(t) => updateField('Password_Usuarios', t)}
                    maxLength={255}
                  />
                  <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(prev => !prev)}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmación de contraseña */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text }]}>Confirmar Contraseña *</Text>
                <View style={[styles.passwordContainer, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}> 
                  <TextInput
                    style={[styles.passwordInput, { color: themeColors.text }]} 
                    placeholder="Repetir contraseña"
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    maxLength={255}
                  />
                  <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(prev => !prev)}>
                    <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <Text style={[styles.errorText, { color: isDarkMode ? '#ff6b6b' : '#d32f2f' }]}>Las contraseñas no coinciden.</Text>
                )}
              </View>

              {/* Botón de registro */}
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  (isSubmitting || !passwordsMatch || !isPasswordValid) && styles.loginButtonDisabled,
                ]} 
                onPress={handleRegister}
                disabled={isSubmitting || !passwordsMatch || !isPasswordValid}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#4CAF50', '#2E7D32'] : ['#2E7D32', '#4CAF50']}
                  style={styles.loginButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Registrarse</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            {/* Link a login */}
            <View style={styles.loginLinkContainer}>
              <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: themeColors.primary }]}> Inicia sesión</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: themeColors.textSecondary }]}>Términos y Condiciones</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: themeColors.textSecondary }]}>Política de Privacidad</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
  logoImageLarge: {
    width: getResponsiveSize(125, 100, 80),
    height: getResponsiveSize(125, 100, 80),
    marginBottom: getResponsiveSize(5, 3, 2),
  },
  appNameLarge: {
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
    shadowOffset: { width: 0, height: 4 },
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
  errorText: {
    fontSize: getResponsiveSize(12, 11, 10),
    marginTop: getResponsiveSize(6, 5, 4),
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: getResponsiveSize(20, 15, 12),
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: getResponsiveSize(16, 14, 12),
  },
  loginLink: {
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
  pickerLoading: {
    height: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: getResponsiveSize(14, 12, 10),
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
  },
  picker: {
    height: getResponsiveSize(54, 48, 42),
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: getResponsiveSize(15, 12, 10),
    fontSize: getResponsiveSize(16, 14, 12),
  },
  pickerInput: {
    borderWidth: 1,
    borderRadius: 12,
    height: getResponsiveSize(54, 48, 42),
    paddingLeft: getResponsiveSize(8, 6, 4),
    paddingRight: getResponsiveSize(8, 6, 4),
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});