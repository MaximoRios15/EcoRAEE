# EcoRAEE - Backend API REST

## Descripción del Proyecto

EcoRAEE-BackEnd es la API REST del sistema EcoRAEE, desarrollada con CodeIgniter 4. Este backend gestiona el sistema completo de donaciones y reciclaje de Residuos de Aparatos Eléctricos y Electrónicos (RAEE), proporcionando servicios robustos para usuarios ciudadanos, instituciones educativas y técnicos especializados. La API implementa un sistema de autenticación, validaciones en tiempo real, gestión de usuarios y datos maestros para el funcionamiento del sistema.

## Arquitectura del Sistema

El proyecto está basado en el patrón MVC (Modelo-Vista-Controlador) de CodeIgniter 4 y utiliza:
- **Framework**: CodeIgniter 4
- **Base de Datos**: MySQL (`ecoraee-db`)
- **Arquitectura**: API REST
- **Formato de Respuesta**: JSON
- **Configuración CORS**: Habilitada para frontend React Native

## Stack Tecnológico

### Dependencias Principales
- **PHP**: ^8.1
- **CodeIgniter 4**: ^4.0 (Framework principal)

### Dependencias de Desarrollo
- **PHPUnit**: ^10.5.16 (Testing)
- **Faker**: ^1.9 (Datos de prueba)
- **VfsStream**: ^1.6 (Sistema de archivos virtual para tests)

## Estructura del Proyecto

```
RAEE-BackEnd/
├── app/
│   ├── Config/                      # Configuraciones del sistema
│   │   ├── App.php                  # Configuración principal de la aplicación
│   │   ├── Database.php             # Configuración de base de datos MySQL
│   │   ├── Routes.php               # Definición completa de rutas API
│   │   ├── Cors.php                 # Configuración de CORS para frontend
│   │   ├── Security.php             # Configuraciones de seguridad
│   │   ├── Validation.php           # Reglas de validación globales
│   │   └── [Otros archivos de configuración]
│   ├── Controllers/                 # Controladores de la API
│   │   ├── AuthController.php       # Autenticación y registro de usuarios
│   │   ├── UserController.php       # Gestión de perfiles y estadísticas
│   │   ├── CategoriesController.php # Gestión de categorías de dispositivos
│   │   ├── StatesController.php     # Gestión de estados de dispositivos
│   │   ├── BrandsController.php     # Gestión de marcas de equipos
│   │   ├── MunicipiosController.php # Gestión de municipios
│   │   ├── PuntosEntregaController.php # Gestión de puntos de entrega
│   │   ├── PublicationsController.php # Gestión de publicaciones
│   │   └── BaseController.php       # Controlador base
│   ├── Models/                      # Modelos de base de datos
│   │   ├── UsuariosModel.php        # Modelo de usuarios con validaciones
│   │   ├── MunicipiosModel.php      # Modelo de municipios
│   │   ├── DireccionesModel.php     # Modelo de direcciones
│   │   └── PublicacionesModel.php   # Modelo de publicaciones
│   ├── Database/                    # Base de datos
│   │   ├── Migrations/              # Migraciones de base de datos
│   │   └── Seeds/                   # Datos de prueba
│   ├── Filters/                     # Filtros de seguridad
│   ├── Helpers/                     # Funciones auxiliares
│   ├── Language/                    # Archivos de idioma
│   ├── Libraries/                   # Librerías personalizadas
│   ├── ThirdParty/                  # Librerías de terceros
│   └── Views/                       # Vistas (para errores y debugging)
├── public/                          # Punto de entrada web
│   ├── index.php                    # Punto de entrada principal
│   ├── .htaccess                    # Configuración Apache
│   ├── favicon.ico                  # Icono de la aplicación
│   └── robots.txt                   # Configuración para motores de búsqueda
├── vendor/                          # Dependencias de Composer
│   ├── codeigniter4/framework/      # Framework CodeIgniter 4
│   ├── fakerphp/faker/              # Librería para datos de prueba
│   ├── laminas/laminas-escaper/     # Escapado seguro de datos
│   └── phpunit/phpunit/             # Framework de testing
├── writable/                        # Directorios de escritura
│   ├── cache/                       # Cache de la aplicación
│   ├── logs/                        # Logs del sistema
│   ├── session/                     # Archivos de sesión
│   └── debugbar/                    # Debug bar
├── tests/                           # Tests unitarios y de integración
│   ├── _support/                    # Clases de soporte para tests
│   ├── database/                    # Tests de base de datos
│   ├── session/                     # Tests de sesión
│   └── unit/                        # Tests unitarios
├── composer.json                    # Configuración de dependencias
├── composer.lock                    # Versiones exactas de dependencias
├── preload.php                      # Precarga de clases para optimización
├── spark                            # CLI de CodeIgniter
├── .env                             # Variables de entorno (no incluido en repo)
└── README-BackEnd.md                # Esta documentación
```

## Controladores (Controllers)

### 1. AuthController.php
**Ubicación**: `app/Controllers/AuthController.php`  
**Propósito**: Gestión de autenticación y registro de usuarios

#### Métodos Implementados:

##### **health()** - Health Check
- **Endpoint**: `GET /api/health`
- **Funcionalidad**: Verificación del estado del servidor
- **Respuesta**: `{"status": "ok"}`

##### **register()** - Registro de Usuarios
- **Endpoint**: `POST /api/register`
- **Funcionalidad**: Registro completo de nuevos usuarios con validación exhaustiva
- **Campos Requeridos**:
  - `DNI_Usuarios`: Documento de identidad (7-8 dígitos)
  - `Nombres_Usuarios`: Nombre del usuario
  - `Apellidos_Usuarios`: Apellido del usuario
  - `Roles_Usuarios`: Tipo de usuario (1=ciudadano, 2=institución, 3=técnico)
  - `Password_Usuarios`: Contraseña (mínimo 6 caracteres)
- **Campos Opcionales**:
  - `Email_Usuarios`: Correo electrónico
  - `Telefono_Usuarios`: Número de teléfono
  - `direccion`: Objeto con datos de dirección
- **Validaciones**:
  - Unicidad de DNI y email
  - Formato de campos requeridos
  - Encriptación de contraseña con `password_hash()`
- **Características Especiales**:
  - Soporte para direcciones anidadas
  - Transacciones de base de datos para integridad
  - Validación en tiempo real

##### **login()** - Autenticación
- **Endpoint**: `POST /api/login`
- **Funcionalidad**: Autenticación de usuarios con DNI y contraseña
- **Campos Requeridos**:
  - `DNI_Usuarios`: Documento de identidad
  - `Password_Usuarios`: Contraseña
- **Validaciones**:
  - Verificación de credenciales en base de datos
  - Validación de contraseña con `password_verify()`
- **Respuesta**: Datos del usuario autenticado (sin contraseña)

##### **validateDni()** - Validación de DNI
- **Endpoint**: `POST /api/validate-dni`
- **Funcionalidad**: Verificación en tiempo real de disponibilidad de DNI
- **Respuesta**: JSON con estado de disponibilidad

#### Características Técnicas:
- **Password Security**: Encriptación con `password_hash()` y `password_verify()`
- **CORS Support**: Headers configurados para frontend React Native
- **Error Handling**: Respuestas HTTP apropiadas (200, 201, 400, 401, 500)
- **Database Transactions**: Operaciones atómicas para integridad de datos
- **Input Sanitization**: Limpieza y validación de todos los datos de entrada

### 2. UserController.php
**Ubicación**: `app/Controllers/UserController.php`  
**Propósito**: Gestión de perfiles de usuario y estadísticas

#### Métodos Implementados:

##### **profile()** - Perfil de Usuario
- **Endpoint**: `GET /api/profile?user_id={id}`
- **Funcionalidad**: Obtiene perfil completo del usuario
- **Parámetros Aceptados**:
  - `user_id`: ID del usuario
  - `idUsuarios`: ID del usuario (alternativo)
  - `id`: ID del usuario (alternativo)
- **Datos Incluidos**:
  - Información personal básica
  - Puntos acumulados
  - Tipo de usuario
  - Datos de contacto
- **Seguridad**: No expone hash de contraseña

##### **statistics()** - Estadísticas del Usuario
- **Endpoint**: `GET /api/user/statistics?user_id={id}`
- **Funcionalidad**: Estadísticas básicas del usuario
- **Nota**: Implementación base para futuras expansiones

##### **points()** - Puntos del Usuario
- **Endpoint**: `GET /api/user/points?user_id={id}`
- **Funcionalidad**: Obtiene puntos actuales del usuario
- **Nota**: Implementación base para sistema de puntos

##### **pointsHistory()** - Historial de Puntos
- **Endpoint**: `GET /api/user/points/history?user_id={id}`
- **Funcionalidad**: Historial de transacciones de puntos
- **Nota**: Implementación base para historial detallado

### 3. CategoriesController.php
**Ubicación**: `app/Controllers/CategoriesController.php`  
**Propósito**: Gestión de categorías de dispositivos RAEE

#### Métodos Implementados:

##### **index()** - Listar Categorías
- **Endpoint**: `GET /api/categories`
- **Funcionalidad**: Listado de categorías disponibles desde `categorias_equipos`
- **Datos Incluidos**:
  - `idCategorias`: ID único de la categoría
  - `Nombres_Categorias`: Nombre de la categoría
  - `PuntosBase_Categorias`: Puntos base asociados
- **Uso**: Para formularios de donación y filtros

### 4. StatesController.php
**Ubicación**: `app/Controllers/StatesController.php`  
**Propósito**: Gestión de estados de dispositivos

#### Métodos Implementados:

##### **index()** - Listar Estados
- **Endpoint**: `GET /api/states`
- **Funcionalidad**: Listado de estados disponibles desde `estados_equipos`
- **Datos Incluidos**:
  - `idEstadosEquipos`: ID único del estado
  - `Nombres_EstadosEquipos`: Nombre del estado
  - `MultiplicadorPuntos_EstadosEquipos`: Multiplicador de puntos
- **Estados Típicos**: Funcional, Parcialmente funcional, No funcional, Dañado

### 5. BrandsController.php
**Ubicación**: `app/Controllers/BrandsController.php`  
**Propósito**: Gestión de marcas de equipos

#### Métodos Implementados:

##### **index()** - Listar Marcas
- **Endpoint**: `GET /api/brands`
- **Funcionalidad**: Listado de marcas disponibles desde `marcas_equipos`
- **Datos Incluidos**:
  - `idMarcas`: ID único de la marca
  - `idCategorias_Marcas`: Categoría asociada
  - `Nombres_Marcas`: Nombre de la marca
  - `PuntosBase_Marcas`: Puntos base de la marca

### 6. MunicipiosController.php
**Ubicación**: `app/Controllers/MunicipiosController.php`  
**Propósito**: Gestión de municipios

#### Métodos Implementados:

##### **index()** - Listar Municipios
- **Endpoint**: `GET /api/municipios?id_provincia={id}`
- **Funcionalidad**: Listado de municipios, opcionalmente filtrado por provincia
- **Parámetros**:
  - `id_provincia` (opcional): ID de la provincia para filtrar
- **Ordenamiento**: Alfabético por nombre

### 7. PuntosEntregaController.php
**Ubicación**: `app/Controllers/PuntosEntregaController.php`  
**Propósito**: Gestión de puntos de entrega (ecopuntos)

#### Métodos Implementados:

##### **index()** - Listar Puntos de Entrega
- **Endpoint**: `GET /api/puntos-entrega`
- **Funcionalidad**: Listado completo de ecopuntos con información detallada
- **Datos Incluidos**:
  - Información del punto de entrega
  - Dirección completa con coordenadas
  - Municipio asociado
- **Joins**: Con tablas `direcciones` y `municipios`

### 8. PublicationsController.php
**Ubicación**: `app/Controllers/PublicationsController.php`  
**Propósito**: Gestión de publicaciones del sistema

#### Métodos Implementados:

##### **index()** - Listar Publicaciones
- **Endpoint**: `GET /api/publications`
- **Funcionalidad**: Listado de publicaciones desde tabla `publicacion`
- **Datos Incluidos**:
  - Título y descripción
  - Puntos donados
  - Fecha de ingreso
  - ID de donación asociada

## Modelos (Models)

### 1. UsuariosModel.php
**Ubicación**: `app/Models/UsuariosModel.php`  
**Tabla**: `usuarios`

#### Campos Principales:
- `idUsuarios`: ID único del usuario (clave primaria)
- `DNI_Usuarios`: Documento de identidad único (7-8 dígitos)
- `Nombres_Usuarios`: Nombre del usuario
- `Apellidos_Usuarios`: Apellido del usuario
- `Roles_Usuarios`: Tipo de usuario (1=ciudadano, 2=institución, 3=técnico)
- `Email_Usuarios`: Correo electrónico (opcional)
- `Telefono_Usuarios`: Número de contacto (opcional)
- `Password_Usuarios`: Contraseña encriptada
- `Puntos_Usuarios`: Puntos acumulados del usuario
- `idDirecciones_Usuarios`: ID de dirección asociada
- `ImagenPerfil_Usuarios`: Nombre del archivo de imagen de perfil
- `FechaRegistro_Usuarios`: Fecha de registro
- `Activo_Usuarios`: Estado del usuario (0=inactivo, 1=activo)

#### Validaciones Implementadas:
- DNI único y formato válido (7-8 caracteres numéricos)
- Email formato válido (opcional)
- Contraseña mínimo 6 caracteres
- Teléfono mínimo 6 caracteres (opcional)
- Rol válido (1, 2, o 3)

#### Métodos Personalizados:
- `findByDni(string $dni)`: Busca usuario por DNI
- `findByEmail(string $email)`: Busca usuario por email

### 2. MunicipiosModel.php
**Ubicación**: `app/Models/MunicipiosModel.php`  
**Tabla**: `municipios`

#### Campos Principales:
- `idMunicipios`: ID único del municipio
- `Nombres_Municipios`: Nombre del municipio
- `CodigoPostal_Municipios`: Código postal
- `idProvincias_Municipios`: ID de la provincia

#### Métodos Personalizados:
- `listByProvince(?int $provinceId)`: Lista municipios por provincia

### 3. DireccionesModel.php
**Ubicación**: `app/Models/DireccionesModel.php`  
**Tabla**: `direcciones`

#### Campos Principales:
- `idDirecciones`: ID único de la dirección
- `Calle_Direcciones`: Nombre de la calle
- `Numero_Direcciones`: Número de la dirección
- `Piso_Direcciones`: Piso (opcional)
- `Departamento_Direcciones`: Departamento (opcional)
- `Barrio_Direcciones`: Barrio
- `Longitud_Ubicaciones`: Coordenada de longitud
- `Latitud_Ubicaciones`: Coordenada de latitud
- `idMunicipios_Direcciones`: ID del municipio

### 4. PublicacionesModel.php
**Ubicación**: `app/Models/PublicacionesModel.php`  
**Tabla**: `publicacion`

#### Campos Principales:
- `idPublicacion`: ID único de la publicación
- `Titulo_Publicacion`: Título de la publicación
- `Descripcion_Publicacion`: Descripción detallada
- `PuntosDonados_Publicacion`: Puntos asociados
- `FechaIngreso_Publicacion`: Fecha de creación
- `idDonacion_Publicacion`: ID de donación asociada

## Configuración del Sistema

### 1. Base de Datos (Database.php)
**Ubicación**: `app/Config/Database.php`

#### Configuración Principal:
- **Servidor**: localhost
- **Usuario**: root
- **Contraseña**: (vacía)
- **Base de Datos**: `ecoraee-db`
- **Driver**: MySQLi
- **Puerto**: 3306
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

### 2. CORS (Cors.php)
**Ubicación**: `app/Config/Cors.php`

#### Configuración:
- **Orígenes Permitidos**: `['*']` (todos los orígenes)
- **Métodos Permitidos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers Permitidos**: Configurados para React Native
- **Credenciales**: Soportadas

### 3. Rutas (Routes.php)
**Ubicación**: `app/Config/Routes.php`

#### Rutas API Implementadas:

##### Autenticación y Usuarios
- `GET /api/health` - Health check del servidor
- `POST /api/register` - Registro de usuarios
- `POST /api/login` - Autenticación de usuarios
- `POST /api/validate-dni` - Validación de DNI
- `GET /api/profile` - Perfil de usuario

##### Estadísticas y Puntos
- `GET /api/user/statistics` - Estadísticas del usuario
- `GET /api/user/points` - Puntos del usuario
- `GET /api/user/points/history` - Historial de puntos

##### Datos Maestros
- `GET /api/categories` - Categorías de dispositivos
- `GET /api/states` - Estados de dispositivos
- `GET /api/brands` - Marcas de equipos
- `GET /api/municipios` - Municipios

##### Ubicaciones y Publicaciones
- `GET /api/puntos-entrega` - Puntos de entrega (ecopuntos)
- `GET /api/publications` - Publicaciones del sistema

## Características Técnicas

### Seguridad
- **Encriptación de Contraseñas**: `password_hash()` con algoritmo seguro
- **Validación de Entrada**: Sanitización de todos los datos de entrada
- **CORS Configurado**: Para comunicación segura con frontend
- **Validaciones de Modelo**: Reglas estrictas en cada modelo

### Base de Datos
- **Transacciones**: Operaciones atómicas para integridad de datos
- **Relaciones**: Modelos con relaciones bien definidas
- **Índices**: Optimización de consultas frecuentes
- **Validaciones**: A nivel de modelo y base de datos

### API REST
- **Formato JSON**: Todas las respuestas en formato JSON
- **Códigos HTTP**: Uso apropiado de códigos de estado
- **Estructura Consistente**: Respuestas con formato estándar
- **Error Handling**: Manejo robusto de errores

### Desarrollo y Testing
- **PHPUnit**: Framework de testing configurado
- **Faker**: Generación de datos de prueba
- **Debug Bar**: Herramientas de debugging
- **Logs**: Sistema de logging configurado

## Instalación y Configuración

### Requisitos del Sistema
- PHP 8.1 o superior
- MySQL 5.7 o superior
- Composer
- Servidor web (Apache/Nginx)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [repository-url]
   cd RAEE-BackEnd
   ```

2. **Instalar dependencias**
   ```bash
   composer install
   ```

3. **Configurar base de datos**
   - Crear base de datos `ecoraee-db`
   - Configurar credenciales en `.env`
   - Ejecutar migraciones si están disponibles

4. **Configurar servidor web**
   - Apuntar document root a `public/`
   - Configurar mod_rewrite (Apache)

5. **Verificar instalación**
   ```
   GET /api/health
   ```

### Variables de Entorno (.env)
```env
# Base de datos
database.default.hostname = localhost
database.default.database = ecoraee-db
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi

# Aplicación
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'
```

## Scripts Disponibles

### Composer Scripts
- `composer test` - Ejecutar tests con PHPUnit
- `composer install` - Instalar dependencias
- `composer update` - Actualizar dependencias

### CLI de CodeIgniter (Spark)
- `php spark serve` - Servidor de desarrollo
- `php spark migrate` - Ejecutar migraciones
- `php spark db:seed` - Ejecutar seeders

## Estado Actual del Proyecto

### Funcionalidades Implementadas ✅
- **Autenticación completa**: Registro y login de usuarios
- **Gestión de usuarios**: Perfiles y validaciones
- **Datos maestros**: Categorías, estados, marcas, municipios
- **Puntos de entrega**: Listado de ecopuntos
- **Publicaciones**: Sistema básico de publicaciones
- **Validaciones en tiempo real**: DNI, email, teléfono
- **CORS configurado**: Para frontend React Native
- **Base de datos**: Estructura y modelos definidos

### Funcionalidades Preparadas 🔄
- **Sistema de puntos**: Estructura base implementada
- **Estadísticas**: Endpoints base creados
- **Historial**: Preparado para expansión
- **Testing**: Framework configurado
- **Migraciones**: Sistema preparado

### Próximas Implementaciones 📋
- **Sistema de donaciones**: Controlador y modelo completo
- **Cálculo de puntos**: Algoritmo dinámico
- **Gestión de imágenes**: Upload y almacenamiento
- **Carrito de canjes**: Sistema completo
- **Notificaciones**: Sistema de alertas
- **Reportes**: Estadísticas avanzadas

## Arquitectura de Comunicación

### Frontend ↔ Backend
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: Basada en sesión/token
- **CORS**: Configurado para React Native

### Base de Datos
- **ORM**: CodeIgniter 4 Models
- **Migraciones**: Sistema de versionado
- **Seeders**: Datos de prueba
- **Relaciones**: Definidas en modelos

## Notas Técnicas para Desarrolladores

### Convenciones de Código
- **PSR-4**: Autoloading estándar
- **Naming**: CamelCase para clases, snake_case para métodos
- **Documentación**: PHPDoc en todos los métodos públicos
- **Validaciones**: Siempre a nivel de modelo

### Estructura de Respuestas API
```json
{
    "success": true,
    "data": {},
    "message": "Descripción de la operación",
    "errors": []
}
```

### Manejo de Errores
- **Validación**: Códigos 400 con detalles específicos
- **Autenticación**: Códigos 401 para acceso no autorizado
- **No encontrado**: Códigos 404 para recursos inexistentes
- **Servidor**: Códigos 500 para errores internos

## Logs y Debugging

### Logs del Sistema
- **Ubicación**: `writable/logs/`
- **Formato**: Estándar de CodeIgniter
- **Niveles**: Error, Warning, Info, Debug

### Debug Bar
- **Activación**: En modo desarrollo
- **Información**: Queries, performance, variables
- **Ubicación**: `writable/debugbar/`

## Actualizaciones y Mantenimiento

### Changelog Reciente
- ✅ Implementación completa de AuthController
- ✅ Configuración de CORS para React Native
- ✅ Modelos de usuarios con validaciones robustas
- ✅ Sistema de rutas API REST
- ✅ Controladores de datos maestros
- ✅ Configuración de base de datos MySQL
- ✅ Estructura de testing con PHPUnit

### Próximas Actualizaciones
- 🔄 Sistema completo de donaciones
- 🔄 Implementación de JWT para autenticación
- 🔄 Sistema de puntos dinámico
- 🔄 Gestión de imágenes y archivos
- 🔄 Tests unitarios completos

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Desarrollado con**: CodeIgniter 4 + MySQL  
**Licencia**: MIT