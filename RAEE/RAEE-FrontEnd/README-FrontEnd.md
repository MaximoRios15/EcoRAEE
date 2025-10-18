# EcoRAEE - Frontend Mobile Application

## Descripción del Proyecto

EcoRAEE es una aplicación móvil desarrollada con React Native y Expo que conecta ciudadanos con técnicos especializados e instituciones educativas para promover el reciclaje responsable de residuos electrónicos (RAEE) y la economía circular. La aplicación permite a los usuarios donar dispositivos electrónicos, ganar puntos por sus contribuciones y acceder a un sistema de canjes, con interfaces diferenciadas para ciudadanos, personal de recepción y administradores.

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Framework**: React Native 0.81.4
- **Plataforma**: Expo SDK 54.0.0
- **Navegación**: React Navigation 6.x
- **Estado Global**: React Context API (AuthContext, ThemeContext)
- **Almacenamiento Local**: AsyncStorage
- **Comunicación API**: Fetch API nativo
- **UI/UX**: Componentes nativos de React Native
- **Animaciones**: React Native Animated API
- **Gradientes**: Expo Linear Gradient
- **Iconos**: Expo Vector Icons (Ionicons)

### Estructura del Proyecto

```
RAEE-FrontEnd/
├── login-screens/                    # Pantallas de autenticación
│   ├── LoginScreen.js               # Pantalla de inicio de sesión
│   ├── RegisterScreen.js            # Pantalla de registro de usuarios
│   └── ForgotPasswordScreen.js      # Pantalla de recuperación de contraseña
├── citizen-screens/                 # Pantallas para usuarios ciudadanos
│   ├── CitizenHomeScreen.js         # Dashboard principal para ciudadanos
│   ├── ProfileCitizenScreen.js      # Gestión de perfil ciudadano
│   ├── ExchangeShopCitizenScreen.js # Tienda de canjes para ciudadanos
│   ├── StatisticsCitizenScreen.js   # Estadísticas del ciudadano
│   └── ScanQRCitizen.js            # Escáner QR para ciudadanos
├── reception-screens/               # Pantallas para personal de recepción
│   ├── ReceptionHomeScreen.js       # Dashboard para personal de recepción
│   ├── DeviceUploadSelectionScreen.js # Selección de tipo de carga de dispositivos
│   ├── singledevicereceptionscreen.js  # Carga de dispositivo individual
│   ├── multipledevicereceptionscreen.js # Carga de múltiples dispositivos
│   └── ProfileReceptionScreen.js    # Perfil del personal de recepción
├── administration-screens/          # Pantallas para administradores
│   ├── AdminHomeScreen.js           # Dashboard administrativo
│   ├── CategoriesAdminScreen.js     # Gestión de categorías
│   ├── StatesAdminScreen.js         # Gestión de estados de dispositivos
│   ├── UsersAdminScreen.js          # Gestión de usuarios
│   └── LocationsAdminScreen.js      # Gestión de ubicaciones
├── contexts/                        # Contextos de React para estado global
│   ├── AuthContext.js               # Contexto de autenticación
│   └── ThemeContext.js              # Contexto de gestión de temas
├── services/                        # Servicios de comunicación con API
│   └── ApiService.js                # Servicio principal de API
├── img/                            # Recursos de imagen
│   ├── logo-EcoRAEE.png            # Logo principal de la aplicación
│   ├── profile/                    # Imágenes de perfil predefinidas
│   │   ├── perfil1animal.png
│   │   ├── perfil1flores.png
│   │   ├── perfil2animal.png
│   │   ├── perfil2flores.png
│   │   ├── perfil3animal.png
│   │   ├── perfil3flores.png
│   │   ├── perfil4animal.png
│   │   ├── perfil4flores.png
│   │   ├── perfil5animal.png
│   │   └── perfil5flores.png
│   └── ubication/                  # Imágenes de ubicaciones
│       ├── EcoPunto_AvUrquiza.png
│       └── EcoPunto_ItaembeMini.png
├── App.js                          # Componente principal de la aplicación
├── app.json                        # Configuración de Expo
├── package.json                    # Dependencias y scripts
└── README-FrontEnd.md              # Documentación del proyecto
```

## Sistema de Roles y Navegación

La aplicación implementa un sistema de navegación basado en roles que determina qué pantallas puede acceder cada tipo de usuario:

### Roles de Usuario:
- **Rol 1**: Administrador - Acceso completo a pantallas administrativas
- **Rol 2**: Personal de Recepción - Acceso a pantallas de gestión de dispositivos
- **Rol 3**: Ciudadano - Acceso a pantallas de donación y canjes

### Navegación por Roles:
```javascript
const getInitialRouteName = (user) => {
  if (!user || !user.Roles_Usuarios) {
    return "Login";
  }
  
  switch (user.Roles_Usuarios.toString()) {
    case '1': return "AdminHome";      // Administrador
    case '2': return "ReceptionHome";  // Personal de Recepción
    case '3': return "CitizenHome";    // Ciudadano
    default: return "Login";
  }
};
```

## Pantallas de Autenticación (login-screens)

### 1. LoginScreen.js
**Ubicación**: `/login-screens/LoginScreen.js`  
**Funcionalidad**: Pantalla de autenticación de usuarios

#### Características Principales:
- **Campos de entrada**: DNI y contraseña
- **Validaciones**: Formato de DNI y campos requeridos
- **Tema dinámico**: Soporte completo para modo oscuro/claro
- **Animación Rainbow**: Efecto animado en el nombre "EcoRAEE"
- **Navegación**: Enlaces a registro y recuperación de contraseña
- **Redirección por rol**: Automática según el tipo de usuario

#### Componentes Especiales:
- **RainbowText**: Componente personalizado con animación de colores
  - Colores: `['#066c34', '#319417', '#51b003', '#319417', '#066c34']`
  - Animación horizontal de izquierda a derecha
  - Duración: 1500ms con reinicio automático
- **LinearGradient**: Fondos degradados para botones y formularios
- **Tema Toggle**: Botón para cambiar entre modo oscuro y claro

### 2. RegisterScreen.js
**Ubicación**: `/login-screens/RegisterScreen.js`  
**Funcionalidad**: Registro de nuevos usuarios con validación en tiempo real

#### Campos del Formulario:
- **Datos básicos**: DNI, nombre, apellido, email, teléfono
- **Ubicación**: Dirección, número de calle, provincia (Misiones), municipio
- **Seguridad**: Contraseña y confirmación
- **Tipo de usuario**: Ciudadano, Técnico, Institución

#### Validaciones Implementadas:
- **DNI**: Formato numérico 7-8 dígitos, verificación de disponibilidad
- **Email**: Formato válido, verificación de disponibilidad
- **Teléfono**: Solo números, verificación de disponibilidad
- **Contraseña**: Mínimo 6 caracteres, confirmación obligatoria

### 3. ForgotPasswordScreen.js
**Ubicación**: `/login-screens/ForgotPasswordScreen.js`  
**Funcionalidad**: Recuperación de contraseña

## Pantallas para Ciudadanos (citizen-screens)

### 1. CitizenHomeScreen.js
**Ubicación**: `/citizen-screens/CitizenHomeScreen.js`  
**Funcionalidad**: Dashboard principal para usuarios ciudadanos

#### Elementos Principales:
- **Header**: Logo EcoRAEE, toggle de sidebar
- **Tarjeta de bienvenida**: Información personal del usuario con avatar
- **Puntos del usuario**: Visualización de puntos acumulados
- **Carrusel de ubicaciones**: ScrollView horizontal con ecopuntos disponibles
- **Acciones principales**: Botones para donar y canjear
- **Información**: Tarjeta "Sobre EcoRAEE"
- **Sidebar**: Menú lateral con navegación completa

#### Características Técnicas:
- **Carrusel infinito**: Animación automática con pausa al tocar
- **Control de usuario**: Pausa al interactuar, reanuda automáticamente
- **Tema dinámico**: Colores adaptativos
- **Sombras verdes**: Efectos visuales consistentes
- **Responsive**: Adaptación a diferentes tamaños de pantalla
- **Gestión de estado**: Integración con AuthContext para datos del usuario

#### Animaciones Avanzadas:
- **Carrusel**: Scroll automático con control de usuario
- **PanResponder**: Detección de gestos táctiles
- **Animated.Value**: Control preciso de animaciones
- **Auto-scroll**: Reinicio automático después de interacción

### 2. ProfileCitizenScreen.js
**Ubicación**: `/citizen-screens/ProfileCitizenScreen.js`  
**Funcionalidad**: Gestión completa del perfil de usuario ciudadano

### 3. ExchangeShopCitizenScreen.js
**Ubicación**: `/citizen-screens/ExchangeShopCitizenScreen.js`  
**Funcionalidad**: Tienda de canjes específica para ciudadanos

### 4. StatisticsCitizenScreen.js
**Ubicación**: `/citizen-screens/StatisticsCitizenScreen.js`  
**Funcionalidad**: Visualización de estadísticas del ciudadano

### 5. ScanQRCitizen.js
**Ubicación**: `/citizen-screens/ScanQRCitizen.js`  
**Funcionalidad**: Escáner QR para ciudadanos

## Pantallas de Recepción (reception-screens)

### 1. ReceptionHomeScreen.js
**Ubicación**: `/reception-screens/ReceptionHomeScreen.js`  
**Funcionalidad**: Dashboard principal para personal de recepción

#### Elementos Principales:
- **Header**: Logo EcoRAEE y controles de navegación
- **Información del usuario**: Datos del personal de recepción
- **Acciones principales**: Botones para gestión de dispositivos
- **Estadísticas**: Resumen de actividades de recepción
- **Navegación**: Enlaces a pantallas de carga de dispositivos

### 2. DeviceUploadSelectionScreen.js
**Ubicación**: `/reception-screens/DeviceUploadSelectionScreen.js`  
**Funcionalidad**: Pantalla de selección del tipo de carga de dispositivos

#### Características:
- **Dos opciones principales**:
  - **Dispositivo Individual**: Navegación a `SingleDeviceScreen`
  - **Múltiples Dispositivos**: Navegación a `MultipleDeviceScreen`
- **Diseño intuitivo**: Botones grandes con iconografía clara
- **Tema dinámico**: Adaptación completa al tema actual
- **Navegación**: Integrada con el stack de navegación

### 3. singledevicereceptionscreen.js (Renombrado)
**Ubicación**: `/reception-screens/singledevicereceptionscreen.js`  
**Funcionalidad**: Carga de un dispositivo individual

#### Cambios Realizados:
- **Archivo renombrado**: De `SingleDeviceReceptionScreen.js` a `singledevicereceptionscreen.js`
- **Función exportada**: Actualizada de `SingleDeviceScreen` a `SingleDeviceReceptionScreen`
- **Importaciones**: Corregidas en `App.js`
- **Navegación**: Rutas actualizadas correctamente

#### Características:
- **Formulario completo**: Todos los campos necesarios para un dispositivo
- **Validación**: Completa con mensajes de error específicos
- **Tema dinámico**: Adaptación al tema actual
- **Integración**: Con backend para guardado de datos

### 4. multipledevicereceptionscreen.js (Renombrado)
**Ubicación**: `/reception-screens/multipledevicereceptionscreen.js`  
**Funcionalidad**: Carga de múltiples dispositivos

#### Cambios Realizados:
- **Archivo renombrado**: De `MultipleDeviceReceptionScreen.js` a `multipledevicereceptionscreen.js`
- **Función exportada**: Actualizada de `MultipleDeviceScreen` a `MultipleDeviceReceptionScreen`
- **Importaciones**: Corregidas en `App.js`
- **Navegación**: Rutas actualizadas correctamente

#### Características:
- **Carga masiva**: Formulario optimizado para múltiples dispositivos
- **Validación**: Sistema de validación para lotes
- **Eficiencia**: Optimizado para procesamiento rápido
- **Tema dinámico**: Adaptación completa al tema

### 5. ProfileReceptionScreen.js
**Ubicación**: `/reception-screens/ProfileReceptionScreen.js`  
**Funcionalidad**: Gestión del perfil del personal de recepción

## Pantallas Administrativas (administration-screens)

### 1. AdminHomeScreen.js
**Ubicación**: `/administration-screens/AdminHomeScreen.js`  
**Funcionalidad**: Dashboard principal para administradores

#### Elementos Principales:
- **Header**: Logo EcoRAEE, toggle de sidebar
- **Estadísticas del sistema**: Tarjetas con métricas importantes
  - **Total de usuarios**: Contador dinámico
  - **Total de categorías**: Gestión de categorías RAEE
  - **Total de estados**: Estados de dispositivos
  - **Total de ubicaciones**: Ecopuntos registrados
- **Acciones administrativas**: Botones para gestión del sistema
- **Sidebar**: Menú lateral con navegación administrativa

#### Características Técnicas:
- **Carga de estadísticas**: Datos en tiempo real desde el backend
- **Estados de carga**: Indicadores visuales durante la carga
- **Tema dinámico**: Adaptación completa al tema
- **Navegación**: Enlaces a todas las pantallas administrativas
- **Responsive**: Diseño adaptativo para diferentes pantallas

#### Estadísticas Implementadas:
```javascript
const [stats, setStats] = useState({
  totalUsers: 0,
  totalCategories: 0,
  totalStates: 0,
  totalLocations: 0
});
```

### 2. CategoriesAdminScreen.js
**Ubicación**: `/administration-screens/CategoriesAdminScreen.js`  
**Funcionalidad**: Gestión de categorías de dispositivos RAEE

### 3. StatesAdminScreen.js
**Ubicación**: `/administration-screens/StatesAdminScreen.js`  
**Funcionalidad**: Gestión de estados de dispositivos

### 4. UsersAdminScreen.js
**Ubicación**: `/administration-screens/UsersAdminScreen.js`  
**Funcionalidad**: Gestión de usuarios del sistema

### 5. LocationsAdminScreen.js
**Ubicación**: `/administration-screens/LocationsAdminScreen.js`  
**Funcionalidad**: Gestión de ubicaciones y ecopuntos

## Contextos (Contexts)

### 1. AuthContext.js
**Ubicación**: `/contexts/AuthContext.js`  
**Propósito**: Manejo centralizado del estado de autenticación

#### Estado Manejado:
```javascript
{
  isLoading: boolean,      // Estado de carga
  isSignout: boolean,      // Indicador de cierre de sesión
  user: object|null        // Datos del usuario completos
}
```

#### Acciones Disponibles:
- **signIn(credentials)**: Autenticación con DNI y contraseña
- **signUp(userData)**: Registro de nuevos usuarios
- **signOut()**: Cierre de sesión completo
- **updateUser(userData)**: Actualización de datos del usuario
- **refreshProfile()**: Recarga del perfil desde el backend

#### Características Especiales:
- **Auto-logout**: Cierre automático de sesión al abrir la app
- **Limpieza de datos**: Eliminación completa de AsyncStorage al cerrar sesión
- **Persistencia de tema**: Mantiene preferencias de modo oscuro/claro
- **Manejo de errores**: Gestión robusta de errores de autenticación

### 2. ThemeContext.js (Nuevo)
**Ubicación**: `/contexts/ThemeContext.js`  
**Propósito**: Gestión centralizada del sistema de temas

#### Funcionalidades:
- **Estado del tema**: Modo oscuro/claro global
- **Persistencia**: Guardado automático en AsyncStorage
- **Colores dinámicos**: Paleta de colores adaptativa
- **Toggle theme**: Función para cambiar tema
- **Loading state**: Estado de carga durante inicialización

#### Colores del Tema:
```javascript
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
  overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
};
```

#### Hook personalizado:
```javascript
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## Servicios (Services)

### ApiService.js
**Ubicación**: `/services/ApiService.js`  
**Propósito**: Comunicación centralizada con el backend

#### Configuración:
- **Base URL**: `http://192.168.0.12/EcoRAEE/RAEE/RAEE-BackEnd/public/api`
- **Headers**: Content-Type y Accept automáticos
- **Error Handling**: Manejo específico por código HTTP

#### Métodos Principales:

##### Autenticación:
- **register(userData)**: Registro de usuarios con validación
- **login(credentials)**: Autenticación con manejo de errores específicos
- **logout()**: Cierre de sesión

##### Gestión de Usuarios:
- **getProfile(userId)**: Obtención del perfil del usuario
- **updateUserProfile(profileData)**: Actualización de datos del perfil
- **getAllUsers()**: Obtener todos los usuarios (admin)
- **updateUser(userId, userData)**: Actualizar usuario específico
- **deleteUser(userId)**: Eliminar usuario

##### Validaciones:
- **validateDni(dni)**: Verificación de disponibilidad de DNI
- **validateEmail(email)**: Verificación de disponibilidad de email
- **validateTelefono(telefono)**: Verificación de disponibilidad de teléfono

##### Equipos/Dispositivos:
- **createEquipment(equipmentData)**: Crear nuevo equipo
- **getAllEquipment()**: Obtener todos los equipos
- **getUserEquipment()**: Obtener equipos del usuario
- **getEquipment(equipmentId)**: Obtener equipo específico
- **updateEquipmentStatus(equipmentId, status)**: Actualizar estado

##### Datos Maestros:
- **getCategories()**: Obtener categorías de RAEE
- **createCategory(categoryData)**: Crear nueva categoría
- **updateCategory(categoryId, categoryData)**: Actualizar categoría
- **deleteCategory(categoryId)**: Eliminar categoría
- **getStates()**: Obtener estados de dispositivos
- **createState(stateData)**: Crear nuevo estado
- **updateState(stateId, stateData)**: Actualizar estado
- **deleteState(stateId)**: Eliminar estado
- **getCollectionLocations()**: Obtener ubicaciones de recolección
- **createLocation(locationData)**: Crear nueva ubicación
- **updateLocation(locationId, locationData)**: Actualizar ubicación
- **deleteLocation(locationId)**: Eliminar ubicación

##### Puntos y Estadísticas:
- **getUserPoints(userId)**: Obtener puntos del usuario
- **getUserStatistics(userId)**: Obtener estadísticas del usuario
- **getUserPointsHistory(userId)**: Historial de puntos

##### Imágenes:
- **uploadEquipmentImages(images)**: Subir imágenes de equipos
- **getImageUrl(filename)**: Obtener URL de imagen
- **deleteImage(filename)**: Eliminar imagen

#### Características Técnicas:
- **Singleton Pattern**: Una instancia única del servicio
- **Error Handling**: Manejo específico por código HTTP (401, 403, 404, 500+)
- **JSON Validation**: Verificación de respuestas JSON válidas
- **Network Error Handling**: Manejo de errores de conexión y timeout
- **Server Connection Check**: Verificación de conectividad

## App.js - Configuración Principal

### Importaciones Actualizadas:
```javascript
// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import citizen screens
import CitizenHomeScreen from './citizen-screens/CitizenHomeScreen';
import ProfileCitizenScreen from './citizen-screens/ProfileCitizenScreen';
import ExchangeShopCitizenScreen from './citizen-screens/ExchangeShopCitizenScreen';
import StatisticsCitizenScreen from './citizen-screens/StatisticsCitizenScreen';
import ScanQRCitizenScreen from './citizen-screens/ScanQRCitizen';

// Import reception screens (nombres actualizados)
import ReceptionHomeScreen from './reception-screens/ReceptionHomeScreen';
import DeviceUploadSelectionScreen from './reception-screens/DeviceUploadSelectionScreen';
import SingleDeviceReceptionScreen from './reception-screens/singledevicereceptionscreen';
import MultipleDeviceReceptionScreen from './reception-screens/multipledevicereceptionscreen';
import ProfileReceptionScreen from './reception-screens/ProfileReceptionScreen';

// Import admin screens
import AdminHomeScreen from './administration-screens/AdminHomeScreen';
import CategoriesAdminScreen from './administration-screens/CategoriesAdminScreen';
import StatesAdminScreen from './administration-screens/StatesAdminScreen';
import UsersAdminScreen from './administration-screens/UsersAdminScreen';
import LocationsAdminScreen from './administration-screens/LocationsAdminScreen';
```

### Configuración de Rutas:
```javascript
// Rutas para todos los roles
<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

// Rutas para ciudadanos (Rol 3)
<Stack.Screen name="CitizenHome" component={CitizenHomeScreen} />
<Stack.Screen name="ProfileCitizen" component={ProfileCitizenScreen} />
<Stack.Screen name="ExchangeShopCitizen" component={ExchangeShopCitizenScreen} />
<Stack.Screen name="StatisticsCitizen" component={StatisticsCitizenScreen} />
<Stack.Screen name="ScanQRCitizen" component={ScanQRCitizenScreen} />

// Rutas para personal de recepción (Rol 2)
<Stack.Screen name="ReceptionHome" component={ReceptionHomeScreen} />
<Stack.Screen name="DeviceUploadSelection" component={DeviceUploadSelectionScreen} />
<Stack.Screen name="SingleDeviceScreen" component={SingleDeviceReceptionScreen} />
<Stack.Screen name="MultipleDeviceScreen" component={MultipleDeviceReceptionScreen} />
<Stack.Screen name="ProfileReception" component={ProfileReceptionScreen} />

// Rutas para administradores (Rol 1)
<Stack.Screen name="AdminHome" component={AdminHomeScreen} />
<Stack.Screen name="CategoriesAdmin" component={CategoriesAdminScreen} />
<Stack.Screen name="StatesAdmin" component={StatesAdminScreen} />
<Stack.Screen name="UsersAdmin" component={UsersAdminScreen} />
<Stack.Screen name="LocationsAdmin" component={LocationsAdminScreen} />
```

### Providers Anidados:
```javascript
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

## Cambios y Actualizaciones Recientes

### Renombramiento de Archivos:
1. **SingleDeviceReceptionScreen.js** → **singledevicereceptionscreen.js**
2. **MultipleDeviceReceptionScreen.js** → **multipledevicereceptionscreen.js**

### Correcciones de Importaciones:
- Actualizadas todas las importaciones en `App.js`
- Corregidos los nombres de las funciones exportadas
- Mantenidas las rutas de navegación existentes

### Nuevas Funcionalidades:
1. **Sistema de roles**: Navegación diferenciada por tipo de usuario
2. **ThemeContext**: Gestión centralizada de temas
3. **Pantallas administrativas**: Dashboard y gestión completa
4. **Pantallas de ciudadanos**: Interfaz específica para usuarios finales
5. **Carrusel animado**: En CitizenHomeScreen con control avanzado
6. **Sidebar mejorado**: En todas las pantallas principales

### Mejoras Técnicas:
1. **Gestión de estado**: Contextos separados para auth y theme
2. **Animaciones avanzadas**: PanResponder y Animated.Value
3. **Responsive design**: Adaptación a diferentes tamaños
4. **Error handling**: Manejo robusto de errores
5. **Performance**: Optimizaciones de renderizado

## Instalación y Configuración

### Requisitos del Sistema:
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Expo CLI**: Instalado globalmente
- **Android Studio** (para desarrollo Android)
- **Xcode** (para desarrollo iOS - solo macOS)

### Pasos de Instalación:

1. **Clonar el Repositorio**:
```bash
git clone [URL_DEL_REPOSITORIO]
cd RAEE-FrontEnd
```

2. **Instalar Dependencias**:
```bash
npm install
```

3. **Configurar Variables de Entorno**:
   - Editar `services/ApiService.js`
   - Actualizar `baseURL` con la dirección IP correcta del backend:
   ```javascript
   this.baseURL = 'http://[TU_IP]/EcoRAEE/RAEE/RAEE-BackEnd/public/api';
   ```

4. **Iniciar el Servidor de Desarrollo**:
```bash
npm start
# o
expo start
```

5. **Ejecutar en Dispositivo/Emulador**:
   - **Android**: `npm run android` o escanear QR con Expo Go
   - **iOS**: `npm run ios` o escanear QR con Expo Go

## Dependencias Principales

### Dependencias de Producción:
```json
{
  "@expo/vector-icons": "^15.0.2",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/stack": "^6.4.1",
  "expo": "~54.0.5",
  "expo-font": "~14.0.8",
  "expo-linear-gradient": "~15.0.7",
  "expo-splash-screen": "~31.0.10",
  "expo-status-bar": "~3.0.8",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-picker-select": "^9.3.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
}
```

## Flujo de Navegación por Roles

```
App.js (ThemeProvider > AuthProvider)
├── AuthContext verifica sesión y determina rol
├── Si no autenticado:
│   ├── LoginScreen (/login-screens/)
│   ├── RegisterScreen (/login-screens/)
│   └── ForgotPasswordScreen (/login-screens/)
└── Si autenticado:
    ├── Rol 1 (Administrador):
    │   ├── AdminHomeScreen (/administration-screens/)
    │   ├── CategoriesAdminScreen
    │   ├── StatesAdminScreen
    │   ├── UsersAdminScreen
    │   └── LocationsAdminScreen
    ├── Rol 2 (Personal de Recepción):
    │   ├── ReceptionHomeScreen (/reception-screens/)
    │   ├── DeviceUploadSelectionScreen
    │   ├── singledevicereceptionscreen
    │   ├── multipledevicereceptionscreen
    │   └── ProfileReceptionScreen
    └── Rol 3 (Ciudadano):
        ├── CitizenHomeScreen (/citizen-screens/)
        ├── ProfileCitizenScreen
        ├── ExchangeShopCitizenScreen
        ├── StatisticsCitizenScreen
        └── ScanQRCitizenScreen
```

## Estado Actual y Funcionalidades

### ✅ Implementado y Funcionando:

#### Sistema de Autenticación Completo:
- **Login**: Con validación de credenciales y redirección por rol
- **Registro**: Con validación en tiempo real de DNI, email y teléfono
- **Recuperación de contraseña**: Interfaz implementada
- **Auto-logout**: Cierre automático al abrir la app

#### Sistema de Roles:
- **Navegación diferenciada**: Pantallas específicas por tipo de usuario
- **Control de acceso**: Rutas protegidas según rol
- **Interfaces adaptadas**: UI específica para cada tipo de usuario

#### Pantallas Principales por Rol:
- **Ciudadanos**: Dashboard con carrusel animado, perfil, estadísticas
- **Personal de Recepción**: Gestión de dispositivos individuales y múltiples
- **Administradores**: Dashboard con estadísticas del sistema

#### Sistema de Temas Avanzado:
- **ThemeContext**: Gestión centralizada de temas
- **Persistencia**: Preferencias guardadas en AsyncStorage
- **Consistencia**: Colores y estilos unificados en todas las pantallas

#### Animaciones y Efectos:
- **RainbowText**: Animación del nombre "EcoRAEE"
- **Carrusel infinito**: En CitizenHomeScreen con PanResponder
- **Sombras verdes**: Efectos visuales consistentes
- **Gradientes**: LinearGradient en botones y formularios

#### Gestión de Archivos:
- **Renombramiento**: Archivos de recepción actualizados
- **Importaciones**: Corregidas en App.js
- **Navegación**: Rutas actualizadas correctamente

### 🚧 Preparado para Implementación:

#### Funcionalidades Administrativas:
- **Gestión de categorías**: CRUD completo
- **Gestión de estados**: CRUD completo
- **Gestión de usuarios**: CRUD completo
- **Gestión de ubicaciones**: CRUD completo

#### Sistema de Canjes:
- **Estructura base**: Pantallas implementadas
- **Navegación**: Funcional
- **Pendiente**: Catálogo de productos y sistema de canjes

#### Estadísticas Avanzadas:
- **Estructura base**: Pantallas implementadas
- **Navegación**: Funcional
- **Pendiente**: Gráficos y datos estadísticos

## Arquitectura de Comunicación

```
Frontend (React Native)
    ↓ HTTP Requests
ApiService.js
    ↓ REST API
Backend (CodeIgniter 4)
    ↓ SQL Queries
Base de Datos (MySQL)
```

## Notas Técnicas para Desarrolladores

### Estructura de Carpetas por Funcionalidad:
- **`/login-screens/`**: Autenticación y registro
- **`/citizen-screens/`**: Interfaz para usuarios finales
- **`/reception-screens/`**: Gestión de dispositivos
- **`/administration-screens/`**: Panel administrativo
- **`/contexts/`**: Estado global (Auth y Theme)
- **`/services/`**: Comunicación con API

### Convenciones de Nomenclatura:
- **Archivos**: camelCase para archivos renombrados
- **Componentes**: PascalCase para componentes React
- **Funciones**: camelCase para funciones y métodos
- **Constantes**: UPPER_CASE para constantes

### Patrones de Diseño Implementados:
- **Singleton**: ApiService como instancia única
- **Observer**: Context API para estado global
- **Factory**: Creación de componentes de tema
- **Strategy**: Diferentes validaciones por tipo de campo
- **Provider**: Contextos anidados para funcionalidades

### Performance y Optimizaciones:
- **Lazy Loading**: Carga bajo demanda de componentes
- **Memoización**: Optimización de renders
- **useNativeDriver**: Para animaciones nativas
- **Image Optimization**: Compresión y cache de imágenes

---

**Desarrollado para EcoRAEE - Plataforma de Reciclaje de Residuos Electrónicos**

*Última actualización: Enero 2025*
*Versión del Frontend: 2.0.0*
*Estado: Desarrollo Activo*

### Changelog Reciente:
- **v2.0.0**: Sistema de roles implementado, nuevas pantallas por tipo de usuario
- **v1.9.0**: ThemeContext agregado, gestión centralizada de temas
- **v1.8.0**: Renombramiento de archivos de recepción, corrección de importaciones
- **v1.7.0**: Pantallas administrativas implementadas
- **v1.6.0**: Carrusel animado con PanResponder en CitizenHomeScreen
- **v1.5.0**: Sidebar mejorado en todas las pantallas principales
