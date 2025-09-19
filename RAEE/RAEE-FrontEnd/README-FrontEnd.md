# EcoRAEE - Frontend Mobile Application

## Descripción del Proyecto

EcoRAEE es una aplicación móvil desarrollada con React Native y Expo que conecta ciudadanos con técnicos especializados e instituciones educativas para promover el reciclaje responsable de residuos electrónicos (RAEE) y la economía circular.

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Framework**: React Native 0.81.4
- **Plataforma**: Expo SDK 54.0.0
- **Navegación**: React Navigation 6.x
- **Estado Global**: React Context API
- **Almacenamiento Local**: AsyncStorage
- **Comunicación API**: Fetch API nativo
- **UI/UX**: Componentes nativos de React Native

### Estructura del Proyecto

```
RAEE-FrontEnd/
├── screens/                 # Pantallas de la aplicación
│   ├── LoginScreen.js      # Pantalla de inicio de sesión
│   ├── RegisterScreen.js   # Pantalla de registro
│   ├── HomeScreen.js       # Pantalla principal/dashboard
│   ├── DonationScreen.js   # Pantalla de donación de RAEE
│   ├── ProfileScreen.js    # Pantalla de gestión de perfil
│   └── ForgotPasswordScreen.js # Pantalla de recuperación de contraseña
├── contexts/               # Contextos de React para estado global
│   └── AuthContext.js     # Contexto de autenticación
├── services/              # Servicios de comunicación con API
│   └── ApiService.js      # Servicio principal de API
├── img/                   # Imágenes de perfil predefinidas
│   ├── perfil1.png        # Avatar 1
│   ├── perfil2.png        # Avatar 2
│   ├── perfil3.png        # Avatar 3
│   ├── perfil4.png        # Avatar 4
│   └── ...                # Más avatares disponibles
├── App.js                 # Componente principal de la aplicación
├── app.json              # Configuración de Expo
├── package.json          # Dependencias y scripts
└── logo-EcoRAEE.png      # Logo de la aplicación
```

## Pantallas (Screens)

### 1. LoginScreen.js
**Funcionalidad**: Pantalla de autenticación de usuarios
- **Campos**: DNI y contraseña
- **Validaciones**: Formato de DNI y campos requeridos
- **Características**:
  - Integración con AuthContext para manejo de estado
  - Loading state durante autenticación
  - Navegación a registro y recuperación de contraseña
  - Diseño responsive con logo de EcoRAEE
  - Manejo de errores con alertas
  - **Icono de visibilidad de contraseña**: Toggle para mostrar/ocultar contraseña

### 2. RegisterScreen.js
**Funcionalidad**: Registro de nuevos usuarios ciudadanos
- **Campos**: DNI, nombre, apellido, email, teléfono, dirección, contraseña
- **Validaciones**: 
  - Formato de email y DNI
  - Confirmación de contraseña
  - Campos obligatorios
- **Características**:
  - Formulario completo con validación en tiempo real
  - Integración con ApiService para registro
  - Navegación automática tras registro exitoso
  - Diseño consistente con la aplicación

### 3. HomeScreen.js
**Funcionalidad**: Dashboard principal de la aplicación
- **Elementos**:
  - Header con logo y botón de cerrar sesión
  - Tarjeta de bienvenida con datos del usuario
  - Puntos acumulados del usuario
  - Acciones rápidas (botones de navegación)
  - Información sobre EcoRAEE
- **Acciones Disponibles**:
  - Donar dispositivos (navegación a DonationScreen)
  - Canjear puntos (próximamente)
  - Ver estadísticas (próximamente)
  - Mi perfil (próximamente)
- **Características**:
  - Carga automática del perfil del usuario
  - Confirmación para cerrar sesión
  - Diseño modular con tarjetas

### 4. DonationScreen.js
**Funcionalidad**: Registro de donaciones de RAEE
- **Campos del Formulario**:
  - Tipo de RAEE (selector con opciones predefinidas)
  - Marca del dispositivo
  - Modelo del dispositivo
  - Estado del dispositivo (funcional, parcialmente funcional, etc.)
  - Descripción adicional
  - Cantidad
  - Peso del dispositivo
- **Tipos de RAEE Soportados**:
  - Teléfono móvil, Computadora, Laptop, Tablet
  - Televisor, Monitor, Impresora
  - Electrodomésticos pequeños y grandes
  - Otros dispositivos
- **Características**:
  - Validación completa del formulario
  - Integración con ApiService para envío
  - Reseteo del formulario tras envío exitoso
  - Navegación automática de regreso
  - **Sistema de puntos dinámico**: Cálculo automático de puntos basado en:
    - Categoría del dispositivo
    - Estado del dispositivo (multiplicador)
    - Peso del dispositivo (bonus)
    - Cantidad de unidades
  - **Desglose de puntos en tiempo real**: Muestra cálculo detallado antes del envío

### 5. ProfileScreen.js
**Funcionalidad**: Gestión completa del perfil de usuario
- **Elementos Principales**:
  - Información personal del usuario (nombre, apellido, email, teléfono)
  - Puntos acumulados del usuario
  - Botones de verificación (correo y celular)
- **Características de Edición**:
  - **Selector de imagen de perfil**: Modal con galería de imágenes locales
  - **Edición de nombre y apellido**: Modal con campos editables
  - **Persistencia de datos**: Cambios guardados en AsyncStorage y base de datos
  - **Validación de formularios**: Validación en tiempo real
  - **Integración con API**: Sincronización automática con backend
- **Funcionalidades Avanzadas**:
  - **Galería de imágenes**: 10+ opciones de avatares predefinidos
  - **Edición inline**: Modales responsivos con manejo de teclado
  - **Feedback visual**: Alertas de confirmación y error
  - **Navegación intuitiva**: Botones de cancelar/guardar

### 6. ForgotPasswordScreen.js
**Funcionalidad**: Recuperación de contraseña
- **Campos**: Email del usuario
- **Validaciones**: Formato de email válido
- **Características**:
  - Interfaz simple y clara
  - Validación de formato de email
  - Simulación de envío de email de recuperación
  - Navegación de regreso al login
  - Enlaces a términos y condiciones

## Contextos (Contexts)

### AuthContext.js
**Propósito**: Manejo centralizado del estado de autenticación

#### Estado Manejado:
- `isLoading`: Estado de carga de la aplicación
- `isSignout`: Indicador de cierre de sesión
- `userToken`: Token JWT del usuario autenticado
- `user`: Datos del usuario actual

#### Acciones Disponibles:
- **signIn(credentials)**: Autenticación de usuario
  - Valida credenciales con el backend
  - Guarda token en AsyncStorage
  - Carga perfil del usuario
  - Actualiza estado global

- **signUp(userData)**: Registro de nuevo usuario
  - Envía datos al backend
  - Maneja respuesta de registro
  - No autentica automáticamente

- **signOut()**: Cierre de sesión
  - Limpia token del almacenamiento
  - Resetea estado de usuario
  - Notifica al backend (opcional)

- **updateUser(userData)**: Actualización de datos del usuario
  - Actualiza información en el estado local
  - Útil para cambios de perfil

- **refreshProfile()**: Recarga del perfil del usuario
  - Obtiene datos actualizados del backend
  - Actualiza estado local
  - Maneja errores de token expirado

#### Reducer Pattern:
Utiliza useReducer para manejo predecible del estado con acciones:
- `RESTORE_TOKEN`: Restaura sesión al iniciar app
- `SIGN_IN`: Establece usuario autenticado
- `SIGN_OUT`: Limpia estado de autenticación
- `SET_LOADING`: Controla estados de carga
- `UPDATE_USER`: Actualiza datos del usuario

## Servicios (Services)

### ApiService.js
**Propósito**: Comunicación centralizada con el backend de EcoRAEE

#### Configuración:
- **Base URL**: `http://192.168.0.9/EcoRAEE/RAEE/RAEE-BackEnd/public/api`
- **Headers**: Content-Type y Authorization automáticos
- **Token Management**: Carga, guardado y eliminación automática

#### Métodos de Autenticación:
- **register(userData)**: Registro de nuevos usuarios
- **login(credentials)**: Autenticación con DNI y contraseña
- **getProfile()**: Obtención del perfil del usuario autenticado
- **updateUserProfile(profileData)**: Actualización de datos del perfil
- **logout()**: Cierre de sesión (limpia token local)

#### Métodos de Donaciones:
- **createDonation(donationData)**: Crear nueva donación de RAEE
- **getAllDonations()**: Obtener todas las donaciones (admin)
- **getUserDonations()**: Obtener donaciones del usuario actual
- **getDonation(donationId)**: Obtener donación específica
- **updateDonationStatus(donationId, status)**: Actualizar estado de donación

#### Métodos de Entregas:
- **createDelivery(deliveryData)**: Programar nueva entrega
- **getAllDeliveries()**: Obtener todas las entregas
- **getUserDeliveries()**: Obtener entregas del usuario
- **getDelivery(deliveryId)**: Obtener entrega específica
- **updateDeliveryStatus(deliveryId, status)**: Actualizar estado de entrega
- **getAvailableTimeSlots()**: Obtener horarios disponibles

#### Métodos para Técnicos:
- **registerTechnician(technicianData)**: Registro de técnicos
- **getTechnicianProfile()**: Perfil del técnico
- **updateTechnicianProfile(profileData)**: Actualizar perfil técnico
- **getAllTechnicians()**: Listar todos los técnicos

#### Métodos para Instituciones:
- **registerInstitution(institutionData)**: Registro de instituciones
- **getInstitutionProfile()**: Perfil de la institución
- **updateInstitutionProfile(profileData)**: Actualizar perfil institucional

#### Características Técnicas:
- **Singleton Pattern**: Una instancia única del servicio
- **Error Handling**: Manejo robusto de errores HTTP y de red
- **Token Persistence**: Almacenamiento automático en AsyncStorage
- **Request Interceptor**: Headers automáticos y validación de respuestas
- **JSON Validation**: Verificación de respuestas JSON válidas

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
    "name": "EcoRAEE",                        // Nombre de la app
    "slug": "ecoraee",                        // Identificador único
    "version": "1.0.0",                       // Versión de la aplicación
    "sdkVersion": "54.0.0",                   // Versión del SDK de Expo
    "orientation": "portrait",                // Orientación fija vertical
    "icon": "./logo-EcoRAEE.png",            // Icono de la aplicación
    "userInterfaceStyle": "light",            // Tema claro
    "splash": {                               // Configuración de splash screen
      "image": "./logo-EcoRAEE.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
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
   - **Web**: `npm run web`

### Configuración del Backend:
Asegúrate de que el backend de EcoRAEE esté ejecutándose y accesible desde la red local. El frontend se conecta a:
- **URL Base**: `http://[IP_DEL_SERVIDOR]/EcoRAEE/RAEE/RAEE-BackEnd/public/api`
- **Endpoints Requeridos**: `/register`, `/login`, `/profile`, `/donations`, etc.

## Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo de Expo
npm run android    # Ejecuta en emulador/dispositivo Android
npm run ios        # Ejecuta en emulador/dispositivo iOS
npm run web        # Ejecuta en navegador web
```

## Flujo de Navegación

```
App.js (AuthProvider)
├── AuthContext verifica token
├── Si no autenticado:
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
└── Si autenticado:
    ├── HomeScreen (Dashboard)
    │   ├── DonationScreen
    │   └── ProfileScreen
    └── ProfileScreen (Gestión de perfil)
        ├── Edición de nombre/apellido
        ├── Selector de imagen de perfil
        └── Verificación de contacto
```

## Características de Seguridad

- **JWT Token**: Autenticación basada en tokens
- **AsyncStorage**: Almacenamiento seguro local
- **Validación de Formularios**: Validación client-side
- **Error Handling**: Manejo robusto de errores de red
- **Token Expiration**: Manejo automático de tokens expirados

## Estado Actual y Funcionalidades

### ✅ Implementado:
- Sistema de autenticación completo
- Registro de usuarios ciudadanos
- Dashboard principal con información del usuario
- Sistema de donaciones de RAEE con cálculo de puntos
- **Gestión completa de perfil de usuario**:
  - Edición de nombre y apellido
  - Selector de imagen de perfil
  - Persistencia de datos en AsyncStorage
  - Sincronización con base de datos
- **Sistema de puntos dinámico**:
  - Cálculo automático basado en categoría, estado y peso
  - Desglose detallado en tiempo real
  - Bonus por peso y multiplicadores por estado
- Navegación entre pantallas
- Integración completa con backend
- Manejo de estado global con Context API
- **UI/UX mejorada**:
  - Modales responsivos con manejo de teclado
  - Iconos de edición intuitivos
  - Galería de imágenes de perfil
  - Validación de formularios en tiempo real

### 🚧 En Desarrollo/Próximamente:
- **Sistema de verificación**:
  - Verificación de correo electrónico
  - Verificación de número de teléfono
  - Tabla de códigos de verificación optimizada
  - Generación y validación de códigos OTP
- Canje de puntos
- Visualización de estadísticas personales
- Historial de donaciones
- Sistema de notificaciones
- Modo offline

### 📊 **Base de Datos de Verificaciones**
La aplicación está preparada para implementar un sistema de verificación robusto con la siguiente estructura:

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
    
    -- Índices optimizados para consultas frecuentes
    INDEX idx_usuario_tipo (usuario_id, tipo_verificacion),
    INDEX idx_codigo_usado (codigo, usado),
    INDEX idx_expira_usado (expira_en, usado),
    INDEX idx_token (token_verificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Características de la tabla:**
- **Optimizada para rendimiento**: Tipos de datos eficientes y índices estratégicos
- **Seguridad**: Restricciones de integridad y validación de códigos
- **Escalabilidad**: Diseño preparado para alto volumen de verificaciones
- **Limpieza automática**: Índices para gestión de códigos expirados

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

## Funcionalidades Recientes Implementadas

### 🎨 **Sistema de Gestión de Perfil**
- **Edición de Datos Personales**: Modal responsivo para editar nombre y apellido
- **Selector de Avatar**: Galería con 10+ imágenes de perfil predefinidas
- **Persistencia Local**: AsyncStorage para mantener preferencias del usuario
- **Sincronización Backend**: Actualización automática en base de datos
- **UI/UX Optimizada**: Modales con manejo inteligente de teclado

### 🎯 **Sistema de Puntos Dinámico**
- **Cálculo Automático**: Puntos basados en categoría, estado y peso del dispositivo
- **Desglose Detallado**: Visualización en tiempo real del cálculo de puntos
- **Multiplicadores**: Sistema de bonificaciones por estado del dispositivo
- **Bonus por Peso**: Puntos adicionales según el peso del RAEE
- **Validación Visual**: Indicadores claros de suma/resta de puntos

### 🔧 **Mejoras de Usabilidad**
- **Icono de Visibilidad**: Toggle para mostrar/ocultar contraseña en login
- **Modales Responsivos**: Adaptación automática al teclado virtual
- **Validación en Tiempo Real**: Feedback inmediato en formularios
- **Navegación Intuitiva**: Botones de edición con iconos claros
- **Feedback Visual**: Alertas de confirmación y error mejoradas

### 📱 **Optimizaciones Técnicas**
- **Manejo de Estado**: Context API optimizado para perfil de usuario
- **AsyncStorage**: Persistencia eficiente de preferencias
- **API Integration**: Nuevos endpoints para actualización de perfil
- **Error Handling**: Manejo robusto de errores de red y validación
- **Performance**: Optimización de renders y carga de imágenes

## Notas Técnicas

- **Patrón de Diseño**: Context + Reducer para estado global
- **Comunicación API**: RESTful con JSON
- **Persistencia**: AsyncStorage para datos locales
- **UI/UX**: Diseño Material Design adaptado
- **Performance**: Lazy loading y optimización de renders
- **Compatibilidad**: iOS 11+, Android 6.0+

## Soporte y Mantenimiento

### Logs y Debugging:
- Utilizar `console.log` para debugging en desarrollo
- Expo DevTools para inspección en tiempo real
- React Native Debugger para debugging avanzado

### Actualizaciones:
- Seguir versionado semántico (SemVer)
- Actualizar dependencias regularmente
- Probar en múltiples dispositivos antes de release

### Monitoreo:
- Expo Analytics para métricas de uso
- Crash reporting con Expo
- Performance monitoring en producción

---

**Desarrollado para EcoRAEE - Plataforma de Reciclaje de Residuos Electrónicos**