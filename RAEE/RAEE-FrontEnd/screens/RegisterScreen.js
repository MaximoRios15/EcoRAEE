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

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    DNI_Usuarios: '',
    Nombres_Usuarios: '',
    Apellidos_Usuarios: '',
    Roles_Usuarios: 1, // 1=ciudadano, 2=institucion, 3=tecnico
    Email_Usuarios: '',
    Telefono_Usuarios: '',
    Provincia_Usuarios: 'Misiones',
    Municipios_Usuarios: '',
    Password_Usuarios: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

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
  };

  const handleRegister = async () => {
    // Validación básica
    if (!formData.DNI_Usuarios || !formData.Nombres_Usuarios || !formData.Apellidos_Usuarios || !formData.Email_Usuarios || 
        !formData.Telefono_Usuarios || !formData.Provincia_Usuarios || !formData.Municipios_Usuarios || !formData.Password_Usuarios) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
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

    setIsLoading(true);

    try {
      // Preparar datos para enviar al backend
      const registrationData = {
        DNI_Usuarios: formData.DNI_Usuarios,
        Nombres_Usuarios: formData.Nombres_Usuarios,
        Apellidos_Usuarios: formData.Apellidos_Usuarios,
        Roles_Usuarios: formData.Roles_Usuarios,
        Email_Usuarios: formData.Email_Usuarios,
        Telefono_Usuarios: formData.Telefono_Usuarios,
        Provincia_Usuarios: formData.Provincia_Usuarios,
        Municipios_Usuarios: formData.Municipios_Usuarios,
        Password_Usuarios: formData.Password_Usuarios,
      };

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

        {/* Título */}
        <Text style={styles.title}>Registro de Usuario</Text>
        <Text style={styles.subtitle}>Completa los datos para crear tu cuenta</Text>

        {/* Formulario */}
        <View style={styles.form}>
          {/* DNI */}
          <Text style={styles.label}>DNI *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu DNI"
            value={formData.DNI_Usuarios}
            onChangeText={(value) => handleInputChange('DNI_Usuarios', value)}
            onFocus={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO DNI - ${time} ${date}`);
            }}
            keyboardType="numeric"
          />

          {/* Nombre */}
          <Text style={styles.label}>Nombre *</Text>
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
          <Text style={styles.label}>Apellido *</Text>
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
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={formData.Email_Usuarios}
            onChangeText={(value) => handleInputChange('Email_Usuarios', value)}
            onFocus={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO EMAIL - ${time} ${date}`);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Teléfono */}
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu teléfono"
            value={formData.Telefono_Usuarios}
            onChangeText={(value) => handleInputChange('Telefono_Usuarios', value)}
            onFocus={() => {
              const now = new Date();
              const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              console.log(`[TEXTINPUT] EL USUARIO APRETO EN EL CAMPO TELEFONO - ${time} ${date}`);
            }}
            keyboardType="phone-pad"
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
        </View>

        {/* Botón de registro */}
        <TouchableOpacity 
          style={[styles.registerButton, (isLoading || passwordError !== '') && styles.registerButtonDisabled]} 
          onPress={() => {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            console.log(`[BUTTON] EL USUARIO ENTRO A REGISTRARSE - ${time} ${date}`);
            handleRegister();
          }}
          disabled={isLoading || passwordError !== ''}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
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