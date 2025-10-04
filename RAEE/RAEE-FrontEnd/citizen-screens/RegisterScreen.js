import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

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
  const { signUp } = useAuth();

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
    return imageMap[imageName] || require('../img/perfil1animal.png');
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../logo-EcoRAEE.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>EcoRAEE</Text>
        </View>

        {/* Imagen de perfil seleccionada */}
        {selectedProfileImage && (
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImageLabel}>Tu imagen de perfil será:</Text>
            <Image 
              source={getProfileImageSource(selectedProfileImage)}
              style={styles.selectedProfileImage}
              resizeMode="cover"
            />
            <Text style={styles.profileImageName}>{selectedProfileImage}</Text>
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
              <Text style={styles.changeImageButtonText}>Cambiar Imagen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Título */}
        <Text style={styles.title}>Registro de Usuario</Text>
        <Text style={styles.subtitle}>Completa los datos para crear tu cuenta</Text>

        {/* Formulario */}
        <View style={styles.form}>
          {/* DNI */}
          <Text style={styles.label}>DNI *</Text>
          <TextInput
            style={[styles.input, validationErrors.DNI_Usuarios ? styles.inputError : null]}
            placeholder="Ingresa tu DNI (7-8 dígitos)"
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
          <Text style={styles.label}>Nombre/s *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre"
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
          <Text style={styles.label}>Apellido/s *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu apellido"
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
          <Text style={styles.label}>Tipos de Usuario *</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('Roles_Usuarios', value)}
              items={[
                { label: 'Ciudadano', value: 1 },
                { label: 'Tecnico', value: 3 },
                { label: 'Institucion', value: 2 },
              ]}
              style={pickerSelectStyles}
              value={formData.Roles_Usuarios}
              placeholder={{}}
            />
          </View>

          {/* Correo Electrónico */}
          <Text style={styles.label}>Correo Electrónico *</Text>
          <TextInput
            style={[styles.input, validationErrors.Email_Usuarios ? styles.inputError : null]}
            placeholder="ejemplo@correo.com"
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
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={[styles.input, validationErrors.Telefono_Usuarios ? styles.inputError : null]}
            placeholder="Ingresa tu teléfono (ej: 3764123456)"
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
          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu dirección completa"
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
          <Text style={styles.label}>Número de Calle</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de calle (opcional)"
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
          <Text style={styles.label}>Provincia *</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>Misiones</Text>
          </View>

          {/* Municipio */}
          <Text style={styles.label}>Municipio *</Text>
          <View style={styles.pickerContainer}>
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
              style={pickerSelectStyles}
              placeholder={{
                label: 'Selecciona tu municipio...',
                value: null,
              }}
              value={formData.Municipios_Usuarios}
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
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
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirmar Contraseña */}
          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <View style={[styles.passwordContainer, passwordError !== '' ? styles.passwordContainerError : null]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu contraseña"
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
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {passwordError !== '' ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Campos específicos para Instituciones */}
          {formData.Roles_Usuarios === 2 && (
            <>
              <Text style={styles.sectionTitle}>Datos de la Institución</Text>
              
              {/* Número de Legajo */}
              <Text style={styles.label}>Número de Legajo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el número de legajo"
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
              <Text style={styles.label}>Tipo de Institución *</Text>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  onValueChange={(value) => handleInputChange('Tipo_Institucion', value)}
                  items={[
                    { label: 'Educativa', value: 1 },
                    { label: 'Gubernamental', value: 2 },
                    { label: 'ONG', value: 3 },
                    { label: 'Empresa Privada', value: 4 },
                    { label: 'Otro', value: 5 },
                  ]}
                  style={pickerSelectStyles}
                  value={formData.Tipo_Institucion}
                  placeholder={{}}
                />
              </View>

              {/* Contacto */}
              <Text style={styles.label}>Contacto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Persona de contacto"
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
              <Text style={styles.label}>Registro/Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Número de registro o título"
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
              <Text style={styles.sectionTitle}>Datos del Técnico</Text>
              
              {/* Certificado Técnico */}
              <Text style={styles.label}>Certificado Técnico *</Text>
              <TextInput
                style={styles.input}
                placeholder="Número de certificado técnico"
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
        </View>

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
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isValidating ? (
            <Text style={styles.registerButtonText}>Validando...</Text>
          ) : (
            <Text style={styles.registerButtonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Link a login */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity 
            onPress={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[BUTTON] EL USUARIO ENTRO A INICIAR SESION - ${time} ${date}`);
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.loginLink}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  passwordContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
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
    color: '#2d5016',
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
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f8f0',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  profileImageLabel: {
    fontSize: 14,
    color: '#2d5016',
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
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  changeImageButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
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