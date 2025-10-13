# EcoRAEE - Frontend Mobile Application

## Descripción del Proyecto

EcoRAEE es una aplicación móvil desarrollada con React Native y Expo que conecta ciudadanos con técnicos especializados e instituciones educativas para promover el reciclaje responsable de residuos electrónicos (RAEE) y la economía circular. La aplicación permite a los usuarios donar dispositivos electrónicos, ganar puntos por sus contribuciones y acceder a un sistema de canjes.

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Framework**: React Native 0.81.4
- **Plataforma**: Expo SDK 54.0.0
- **Navegación**: React Navigation 6.x
- **Estado Global**: React Context API
- **Almacenamiento Local**: AsyncStorage
- **Comunicación API**: Fetch API nativo
- **UI/UX**: Componentes nativos de React Native
- **Animaciones**: React Native Animated API
- **Gradientes**: Expo Linear Gradient
- **Iconos**: Expo Vector Icons

### Estructura del Proyecto

```
RAEE-FrontEnd/
├── login-screens/           # Pantallas de autenticación
│   ├── LoginScreen.js       # Pantalla de inicio de sesión
│   ├── RegisterScreen.js    # Pantalla de registro de usuarios
│   └── ForgotPasswordScreen.js # Pantalla de recuperación de contraseña
├── reception-screens/       # Pantallas principales de la aplicación
│   ├── HomeScreen.js        # Pantalla principal/dashboard
│   ├── DonationScreen.js    # Pantalla de donación de RAEE
│   ├── ProfileScreen.js     # Pantalla de gestión de perfil
│   ├── ExchangeShopScreen.js # Pantalla de tienda de canjes
│   └── StatisticsScreen.js  # Pantalla de estadísticas
├── contexts/                # Contextos de React para estado global
│   └── AuthContext.js       # Contexto de autenticación
├── services/               # Servicios de comunicación con API
│   └── ApiService.js       # Servicio principal de API
├── img/                    # Recursos de imagen
│   ├── logo-EcoRAEE.png    # Logo principal de la aplicación
│   ├── profile/            # Imágenes de perfil predefinidas
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
│   └── ubication/          # Imágenes de ubicaciones
│       ├── EcoPunto_AvUrquiza.png
│       └── EcoPunto_ItaembeMini.png
├── App.js                  # Componente principal de la aplicación
├── app.json               # Configuración de Expo
├── package.json           # Dependencias y scripts
└── README-FrontEnd.md     # Documentación del proyecto
```

## Pantallas (Screens)

### 1. LoginScreen.js
**Ubicación**: `/login-screens/LoginScreen.js`  
**Funcionalidad**: Pantalla de autenticación de usuarios

#### Características Principales:
- **Campos de entrada**: DNI y contraseña
- **Validaciones**: Formato de DNI y campos requeridos
- **Tema dinámico**: Soporte completo para modo oscuro/claro
- **Animación Rainbow**: Efecto animado en el nombre "EcoRAEE"
- **Navegación**: Enlaces a registro y recuperación de contraseña

#### Componentes Especiales:
- **RainbowText**: Componente personalizado con animación de colores
  - Colores: `['#066c34', '#319417', '#51b003', '#319417', '#066c34']`
  - Animación horizontal de izquierda a derecha
  - Duración: 1500ms con reinicio automático
- **LinearGradient**: Fondos degradados para botones y formularios
- **Tema Toggle**: Botón para cambiar entre modo oscuro y claro

#### Integraciones:
- **AuthContext**: Manejo de estado de autenticación
- **AsyncStorage**: Persistencia de preferencias de tema
- **ApiService**: Comunicación con backend para login
- **Manejo de errores**: Alertas específicas para credenciales incorrectas

### 2. RegisterScreen.js
**Ubicación**: `/login-screens/RegisterScreen.js`  
**Funcionalidad**: Registro de nuevos usuarios

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

#### Campos Específicos por Tipo:
- **Instituciones**: Número de legajo, tipo de institución, contacto, registro/título
- **Técnicos**: Certificado técnico

#### Características Especiales:
- **Selección de avatar**: 10 imágenes de perfil predefinidas (5 personajes × 2 temas)
- **Validación en tiempo real**: Verificación de disponibilidad de DNI, email y teléfono
- **Tema dinámico**: Todos los campos adaptados al tema actual
- **Municipios de Misiones**: Lista completa de 78 municipios
- **Estados de carga**: Indicadores visuales durante validaciones

### 3. ForgotPasswordScreen.js
**Ubicación**: `/login-screens/ForgotPasswordScreen.js`  
**Funcionalidad**: Recuperación de contraseña

#### Características:
- **Campo único**: Email del usuario
- **Validación**: Formato de email válido
- **Tema dinámico**: Adaptado al tema actual
- **Navegación**: Enlace de regreso al login
- **Diseño consistente**: Mismo estilo que LoginScreen

### 4. HomeScreen.js
**Ubicación**: `/reception-screens/HomeScreen.js`  
**Funcionalidad**: Dashboard principal de la aplicación

#### Elementos Principales:
- **Header**: Logo EcoRAEE, toggle de tema, botón de cerrar sesión
- **Tarjeta de bienvenida**: Información personal del usuario
- **Puntos del usuario**: Visualización de puntos acumulados
- **Carrusel de ubicaciones**: ScrollView horizontal con ecopuntos disponibles
- **Acciones principales**: Botones para donar y canjear
- **Información**: Tarjeta "Sobre EcoRAEE"

#### Características Técnicas:
- **Carrusel infinito**: Animación automática con pausa al tocar
- **Sidebar**: Menú lateral con opciones de navegación
- **Tema dinámico**: Colores adaptativos
- **Sombras verdes**: Efectos visuales consistentes
- **Responsive**: Adaptación a diferentes tamaños de pantalla

#### Animaciones:
- **Carrusel**: Scroll automático con control de usuario
- **Sombras**: Efectos de elevación con colores temáticos
- **Transiciones**: Animaciones suaves entre estados

### 5. DonationScreen.js
**Ubicación**: `/reception-screens/DonationScreen.js`  
**Funcionalidad**: Registro de donaciones de RAEE

#### Formulario de Donación:
- **Categoría**: Tipo de dispositivo (teléfono, computadora, etc.)
- **Detalles**: Marca, modelo, estado, descripción
- **Cantidad y peso**: Información cuantitativa
- **Ubicación**: Selector de municipios de Misiones

#### Sistema de Puntos:
- **Cálculo dinámico**: Basado en categoría, estado y peso
- **Multiplicadores**: Por estado del dispositivo
- **Bonus por peso**: Puntos adicionales según peso
- **Desglose visual**: Cálculo detallado en tiempo real

#### Características:
- **Validación completa**: Todos los campos requeridos
- **Loading states**: Indicadores durante envío
- **Tema dinámico**: Adaptación completa al tema
- **Sidebar**: Menú lateral con navegación
- **Logo en header**: Consistencia visual

### 6. ProfileScreen.js
**Ubicación**: `/reception-screens/ProfileScreen.js`  
**Funcionalidad**: Gestión completa del perfil de usuario

#### Información Mostrada:
- **Datos personales**: Nombre, apellido, email, teléfono
- **Avatar**: Imagen de perfil seleccionada
- **Puntos**: Total de puntos acumulados
- **Estado de verificación**: Correo y teléfono

#### Funcionalidades de Edición:
- **Modal de edición de nombre**: Formulario con validación
- **Selector de avatar**: Galería con 10 opciones predefinidas
- **Botones de verificación**: Para correo y teléfono (preparados para implementación)

#### Características Técnicas:
- **Modales responsivos**: Manejo de teclado virtual
- **Persistencia**: Guardado en AsyncStorage y base de datos
- **Validación en tiempo real**: Feedback inmediato
- **Tema dinámico**: Todos los elementos adaptativos
- **Sombras verdes**: Efectos visuales consistentes

### 7. ExchangeShopScreen.js
**Ubicación**: `/reception-screens/ExchangeShopScreen.js`  
**Funcionalidad**: Tienda de canjes de puntos

#### Características Actuales:
- **Estructura base**: Diseño consistente con HomeScreen
- **Sidebar**: Menú lateral con navegación
- **Header**: Logo EcoRAEE y toggle de tema
- **Tema dinámico**: Colores adaptativos
- **Preparado para**: Implementación de catálogo de productos

### 8. StatisticsScreen.js
**Ubicación**: `/reception-screens/StatisticsScreen.js`  
**Funcionalidad**: Visualización de estadísticas del usuario

#### Características:
- **Diseño consistente**: Mismo estilo que HomeScreen
- **Sidebar**: Menú lateral sin botones de donación/canje
- **Tema dinámico**: Adaptación completa al tema
- **Preparado para**: Gráficos y estadísticas detalladas

## Contextos (Contexts)

### AuthContext.js
**Ubicación**: `/contexts/AuthContext.js`  
**Propósito**: Manejo centralizado del estado de autenticación

#### Estado Manejado:
```javascript
{
  isLoading: boolean,      // Estado de carga
  isSignout: boolean,      // Indicador de cierre de sesión
  userToken: string|null,  // Token de sesión (prototipo)
  user: object|null        // Datos del usuario
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

#### Reducer Actions:
- `RESTORE_TOKEN`: Restaura sesión al iniciar
- `SIGN_IN`: Establece usuario autenticado
- `SIGN_OUT`: Limpia estado de autenticación
- `SET_LOADING`: Controla estados de carga
- `UPDATE_USER`: Actualiza datos del usuario

## Servicios (Services)

### ApiService.js
**Ubicación**: `/services/ApiService.js`  
**Propósito**: Comunicación centralizada con el backend

#### Configuración:
- **Base URL**: `http://192.168.0.9/EcoRAEE/RAEE/RAEE-BackEnd/public/api`
- **Headers**: Content-Type y Authorization automáticos
- **Session Management**: Gestión automática de sesiones

#### Métodos de Autenticación:
- **register(userData)**: Registro de usuarios con validación
- **login(credentials)**: Autenticación con manejo de errores específicos
- **getProfile(userId)**: Obtención del perfil del usuario
- **updateUserProfile(profileData)**: Actualización de datos del perfil

#### Métodos de Validación:
- **validateDni(dni)**: Verificación de disponibilidad de DNI
- **validateEmail(email)**: Verificación de disponibilidad de email
- **validateTelefono(telefono)**: Verificación de disponibilidad de teléfono

#### Métodos de Donaciones:
- **createDonation(donationData)**: Crear nueva donación
- **getAllDonations()**: Obtener todas las donaciones
- **getUserDonations()**: Obtener donaciones del usuario
- **getDonation(donationId)**: Obtener donación específica

#### Métodos de Datos Maestros:
- **getCategories()**: Obtener categorías de RAEE
- **getStates()**: Obtener estados de dispositivos
- **getLocations()**: Obtener ubicaciones disponibles

#### Características Técnicas:
- **Singleton Pattern**: Una instancia única del servicio
- **Error Handling**: Manejo específico por código HTTP (401, 403, 404, 500+)
- **Session Persistence**: Almacenamiento automático en AsyncStorage
- **Request Interceptor**: Headers automáticos y validación de respuestas
- **JSON Validation**: Verificación de respuestas JSON válidas
- **Network Error Handling**: Manejo de errores de conexión y timeout

## Sistema de Temas

### Implementación de Tema Dinámico
Todos los componentes principales implementan un sistema de tema dinámico que permite alternar entre modo oscuro y claro.

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

#### Persistencia:
- **AsyncStorage**: Preferencia guardada en `theme_mode`
- **Estado local**: Cada pantalla maneja su propio estado de tema
- **Sincronización**: Cambios aplicados inmediatamente

## Animaciones y Efectos Visuales

### RainbowText Component
Componente personalizado para el efecto rainbow en el nombre "EcoRAEE":

```javascript
const RainbowText = ({ children, style }) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  
  const colors = ['#066c34', '#319417', '#51b003', '#319417', '#066c34'];
  
  // Animación continua de izquierda a derecha
  useEffect(() => {
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
  }, []);
  
  // Interpolación de colores por carácter
  // ... lógica de animación
};
```

### Efectos de Sombra
Todos los componentes principales implementan sombras verdes consistentes:

```javascript
shadowColor: '#4CAF50',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
```

### Carrusel Animado
El carrusel en HomeScreen implementa:
- **Scroll automático**: Animación continua
- **Control de usuario**: Pausa al tocar, reanuda al soltar
- **Posición persistente**: Mantiene la posición al reanudar
- **Loop infinito**: Reinicio automático al final

## Dependencias Principales

### Dependencias de Producción:
```json
{
  "@expo/vector-icons": "^15.0.2",           // Iconos vectoriales
  "@react-native-async-storage/async-storage": "^2.2.0", // Almacenamiento local
  "@react-navigation/native": "^6.1.18",     // Navegación base
  "@react-navigation/stack": "^6.4.1",       // Navegación stack
  "expo": "~54.0.5",                         // Framework Expo
  "expo-font": "~14.0.8",                    // Gestión de fuentes
  "expo-linear-gradient": "~15.0.7",         // Gradientes lineales
  "expo-splash-screen": "~31.0.10",          // Pantalla de carga
  "expo-status-bar": "~3.0.8",               // Barra de estado
  "react": "19.1.0",                         // React core
  "react-native": "0.81.4",                  // React Native
  "react-native-gesture-handler": "~2.28.0", // Gestos táctiles
  "react-native-picker-select": "^9.3.1",    // Selectores/Pickers
  "react-native-safe-area-context": "~5.6.0", // Área segura
  "react-native-screens": "~4.16.0"          // Optimización de pantallas
}
```

### Dependencias de Desarrollo:
```json
{
  "@babel/core": "^7.25.2"                   // Transpilador JavaScript
}
```

## Configuración de la Aplicación

### app.json - Configuración de Expo:
```json
{
  "expo": {
    "name": "EcoRAEE",
    "slug": "ecoraee",
    "version": "1.0.0",
    "sdkVersion": "54.0.0",
    "orientation": "portrait",
    "icon": "./img/logo-EcoRAEE.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./img/logo-EcoRAEE.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### App.js - Configuración de Navegación:
```javascript
// Importaciones actualizadas para nueva estructura
import LoginScreen from './login-screens/LoginScreen';
import RegisterScreen from './login-screens/RegisterScreen';
import ForgotPasswordScreen from './login-screens/ForgotPasswordScreen';
import HomeScreen from './reception-screens/HomeScreen';
// ... resto de imports
```

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

### Configuración del Backend:
Asegúrate de que el backend de EcoRAEE esté ejecutándose y accesible desde la red local. El frontend se conecta a:
- **URL Base**: `http://[IP_DEL_SERVIDOR]/EcoRAEE/RAEE/RAEE-BackEnd/public/api`
- **Endpoints Requeridos**: `/register`, `/login`, `/profile`, `/donations`, etc.

## Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo de Expo
npm run android    # Ejecuta en emulador/dispositivo Android
npm run ios        # Ejecuta en emulador/dispositivo iOS
```

## Flujo de Navegación

```
App.js (AuthProvider)
├── AuthContext verifica sesión y limpia datos automáticamente
├── Si no autenticado:
│   ├── LoginScreen (/login-screens/)
│   ├── RegisterScreen (/login-screens/)
│   └── ForgotPasswordScreen (/login-screens/)
└── Si autenticado:
    ├── HomeScreen (/reception-screens/)
    │   ├── DonationScreen (/reception-screens/)
    │   ├── ExchangeShopScreen (/reception-screens/)
    │   ├── StatisticsScreen (/reception-screens/)
    │   └── ProfileScreen (/reception-screens/)
    └── ProfileScreen (Gestión de perfil)
        ├── Modal de edición de nombre/apellido
        ├── Modal selector de imagen de perfil
        └── Botones de verificación (preparados)
```

## Características de Seguridad

- **Autenticación Simple**: Sistema de autenticación básico para prototipo
- **AsyncStorage**: Almacenamiento seguro local
- **Validación de Formularios**: Validación client-side y server-side
- **Error Handling**: Manejo robusto de errores de red
- **Auto-logout**: Cierre automático de sesión al abrir la app (prototipo)
- **Limpieza de datos**: Eliminación completa de datos al cerrar sesión

## Estado Actual y Funcionalidades

### ✅ Implementado y Funcionando:

#### Sistema de Autenticación Completo:
- **Login**: Con validación de credenciales y manejo de errores específicos
- **Registro**: Con validación en tiempo real de DNI, email y teléfono
- **Recuperación de contraseña**: Interfaz implementada
- **Auto-logout**: Cierre automático al abrir la app

#### Pantallas Principales:
- **HomeScreen**: Dashboard con carrusel animado y sidebar
- **DonationScreen**: Formulario completo de donación con cálculo de puntos
- **ProfileScreen**: Gestión completa de perfil con edición de datos y avatar
- **ExchangeShopScreen**: Estructura base preparada para implementación
- **StatisticsScreen**: Estructura base preparada para implementación

#### Sistema de Temas:
- **Tema dinámico**: Modo oscuro/claro en todas las pantallas
- **Persistencia**: Preferencias guardadas en AsyncStorage
- **Consistencia**: Colores y estilos unificados

#### Animaciones y Efectos:
- **RainbowText**: Animación del nombre "EcoRAEE"
- **Carrusel infinito**: En HomeScreen con control de usuario
- **Sombras verdes**: Efectos visuales consistentes
- **Gradientes**: LinearGradient en botones y formularios

#### Gestión de Perfil:
- **Edición de datos**: Modal para cambiar nombre y apellido
- **Selector de avatar**: 10 imágenes predefinidas (5 personajes × 2 temas)
- **Persistencia**: Guardado en AsyncStorage y base de datos
- **Validación**: En tiempo real con feedback visual

#### Sistema de Donaciones:
- **Formulario completo**: Todos los campos necesarios
- **Cálculo de puntos**: Dinámico basado en categoría, estado y peso
- **Validación**: Completa con mensajes de error específicos
- **Integración**: Con backend para guardado de datos

#### Validaciones en Tiempo Real:
- **DNI**: Verificación de disponibilidad y formato
- **Email**: Verificación de disponibilidad y formato
- **Teléfono**: Verificación de disponibilidad y formato
- **Contraseñas**: Validación de coincidencia y longitud

### 🚧 Preparado para Implementación:

#### Sistema de Verificación:
- **Estructura base**: Botones implementados en ProfileScreen
- **Backend preparado**: Tabla de verificaciones diseñada
- **UI lista**: Modales y flujos preparados
- **Pendiente**: Implementación de códigos OTP

#### Tienda de Canjes:
- **Estructura base**: Pantalla y navegación implementadas
- **Sidebar**: Menú lateral funcional
- **Pendiente**: Catálogo de productos y sistema de canjes

#### Estadísticas:
- **Estructura base**: Pantalla implementada
- **Navegación**: Funcional
- **Pendiente**: Gráficos y datos estadísticos

### 📊 Base de Datos de Verificaciones
La aplicación está preparada para implementar un sistema de verificación robusto:

```sql
CREATE TABLE verificaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    tipo_verificacion ENUM('email', 'telefono') NOT NULL,
    codigo CHAR(6) NOT NULL,
    token_verificacion CHAR(32) UNIQUE NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    intentos TINYINT UNSIGNED DEFAULT 0,
    max_intentos TINYINT UNSIGNED DEFAULT 3,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usado_en TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuarios) ON DELETE CASCADE,
    
    INDEX idx_usuario_tipo (usuario_id, tipo_verificacion),
    INDEX idx_codigo_usado (codigo, usado),
    INDEX idx_expira_usado (expira_en, usado),
    INDEX idx_token (token_verificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

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

## Funcionalidades Técnicas Avanzadas

### Manejo de Estado:
- **Context API**: Estado global de autenticación
- **useReducer**: Manejo predecible de acciones
- **Local State**: Estado local en cada componente
- **AsyncStorage**: Persistencia de datos

### Optimizaciones de Performance:
- **Lazy Loading**: Carga bajo demanda de componentes
- **Memoización**: Optimización de renders
- **Efficient Animations**: useNativeDriver donde sea posible
- **Image Optimization**: Compresión y cache de imágenes

### Manejo de Errores:
- **Try-Catch**: En todas las operaciones async
- **Error Boundaries**: Para errores de componentes
- **User Feedback**: Alertas y mensajes informativos
- **Fallback UI**: Estados de error con opciones de recuperación

### Accesibilidad:
- **Screen Reader**: Etiquetas y descripciones
- **Touch Targets**: Tamaños apropiados para dedos
- **Color Contrast**: Cumplimiento de estándares
- **Keyboard Navigation**: Soporte para teclado virtual

## Notas Técnicas para Desarrolladores

### Estructura de Carpetas:
- **`/login-screens/`**: Todas las pantallas de autenticación
- **`/reception-screens/`**: Pantallas principales de la aplicación
- **`/contexts/`**: Contextos de React para estado global
- **`/services/`**: Servicios de comunicación con API
- **`/img/`**: Todos los recursos de imagen organizados por tipo

### Convenciones de Código:
- **Naming**: camelCase para variables, PascalCase para componentes
- **Imports**: Ordenados por tipo (React, librerías, locales)
- **Comments**: Documentación en español para funcionalidades complejas
- **Error Handling**: Siempre con try-catch y feedback al usuario

### Patrones de Diseño:
- **Singleton**: ApiService como instancia única
- **Observer**: Context API para estado global
- **Factory**: Creación de componentes de tema
- **Strategy**: Diferentes validaciones por tipo de campo

### Testing:
- **Unit Tests**: Para funciones utilitarias
- **Integration Tests**: Para flujos de autenticación
- **E2E Tests**: Para flujos completos de usuario
- **Performance Tests**: Para animaciones y cargas

## Logs y Debugging

### Sistema de Logs Implementado:
```javascript
// Ejemplo de log implementado
const now = new Date();
const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
console.log(`[LOGIN] LOGIN EXITOSO - Usuario: ${dni} - ${time} ${date}`);
```

### Herramientas de Debugging:
- **Expo DevTools**: Para inspección en tiempo real
- **React Native Debugger**: Para debugging avanzado
- **Console Logs**: Para seguimiento de flujos
- **Network Inspector**: Para monitoreo de API calls

## Actualizaciones y Mantenimiento

### Versionado:
- **Semantic Versioning**: Seguimiento de cambios
- **Changelog**: Registro de nuevas funcionalidades
- **Migration Guide**: Guías para actualizaciones

### Dependencias:
- **Audit Regular**: Verificación de vulnerabilidades
- **Updates**: Actualizaciones periódicas
- **Compatibility**: Verificación de compatibilidad

### Performance Monitoring:
- **Bundle Size**: Monitoreo del tamaño de la app
- **Load Times**: Tiempos de carga de pantallas
- **Memory Usage**: Uso de memoria en dispositivos
- **Crash Reports**: Reportes de errores en producción

---

**Desarrollado para EcoRAEE - Plataforma de Reciclaje de Residuos Electrónicos**

*Última actualización: Octubre 2025*
*Versión del Frontend: 1.4.1*
*Estado: Desarrollo*
