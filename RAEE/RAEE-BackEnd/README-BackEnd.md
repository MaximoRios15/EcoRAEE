# EcoRAEE - Backend API REST

## Descripción del Proyecto

EcoRAEE-BackEnd es la API REST del sistema EcoRAEE, desarrollada con CodeIgniter 4. Este backend gestiona el sistema completo de donaciones y reciclaje de Residuos de Aparatos Eléctricos y Electrónicos (RAEE), proporcionando servicios robustos para usuarios ciudadanos, instituciones educativas y técnicos especializados. La API implementa un sistema de puntos dinámico, autenticación JWT, validaciones en tiempo real y gestión completa de donaciones con cálculo automático de recompensas.

## Arquitectura del Sistema

El proyecto está basado en el patrón MVC (Modelo-Vista-Controlador) de CodeIgniter 4 y utiliza:
- **Framework**: CodeIgniter 4
- **Base de Datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Arquitectura**: API REST

## Estructura del Proyecto

```
RAEE-BackEnd/
├── app/
│   ├── Config/                      # Configuraciones del sistema
│   │   ├── App.php                  # Configuración principal de la aplicación
│   │   ├── Database.php             # Configuración de base de datos MySQL
│   │   ├── Routes.php               # Definición completa de rutas API
│   │   ├── CORS.php                 # Configuración de CORS para frontend
│   │   ├── Security.php             # Configuraciones de seguridad
│   │   ├── Validation.php           # Reglas de validación globales
│   │   └── [Otros archivos de configuración]
│   ├── Controllers/                 # Controladores de la API
│   │   ├── AuthController.php       # Autenticación JWT y gestión de usuarios
│   │   ├── DonationController.php   # Gestión completa de donaciones RAEE
│   │   ├── InstitutionController.php # Gestión de instituciones educativas
│   │   ├── TechnicianController.php # Gestión de técnicos especializados
│   │   ├── CategoryController.php   # Gestión de categorías de dispositivos
│   │   ├── StateController.php      # Gestión de estados de dispositivos
│   │   ├── UbicacionController.php  # Gestión de ubicaciones y ecopuntos
│   │   ├── ImageController.php      # Gestión de imágenes y uploads
│   │   ├── CartController.php       # Gestión de carrito de canjes
│   │   ├── PublicacionController.php # Gestión de publicaciones
│   │   └── UserEquiposController.php # Gestión de equipos de usuarios
│   ├── Models/                      # Modelos de base de datos
│   │   ├── UserModel.php            # Modelo de usuarios con validaciones
│   │   ├── DonationModel.php        # Modelo de donaciones con relaciones
│   │   ├── InstitucionModel.php     # Modelo de instituciones
│   │   ├── TecnicoModel.php         # Modelo de técnicos
│   │   ├── CategoryModel.php        # Modelo de categorías
│   │   ├── StateModel.php           # Modelo de estados
│   │   ├── UbicacionModel.php       # Modelo de ubicaciones
│   │   ├── CartModel.php            # Modelo de carrito
│   │   ├── EquiposModel.php         # Modelo de equipos
│   │   ├── HistorialPuntosModel.php # Modelo de historial de puntos
│   │   └── PublicacionModel.php     # Modelo de publicaciones
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
│   ├── favicon.ico                  # Icono de la aplicación
│   └── robots.txt                   # Configuración para motores de búsqueda
├── vendor/                          # Dependencias de Composer
│   ├── codeigniter4/framework/      # Framework CodeIgniter 4
│   ├── firebase/php-jwt/            # Librería JWT para autenticación
│   ├── laminas/laminas-escaper/     # Escapado seguro de datos
│   └── psr/log/                     # Interfaz de logging
├── writable/                        # Directorios de escritura
│   ├── cache/                       # Cache de la aplicación
│   ├── logs/                        # Logs del sistema
│   ├── session/                     # Archivos de sesión
│   ├── debugbar/                    # Debug bar
│   └── uploads/                     # Archivos subidos
│       └── equipment/               # Imágenes de equipos
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
**Propósito**: Gestión completa de autenticación y usuarios del sistema

#### Métodos Implementados:

##### **register()** - Registro de Usuarios
- **Endpoint**: `POST /api/register`
- **Funcionalidad**: Registro completo de nuevos usuarios con validación exhaustiva
- **Validaciones**:
  - Campos obligatorios: DNI, nombre, apellido, email, contraseña, teléfono, rol
  - Formato DNI: 7-8 dígitos numéricos
  - Formato email: Validación RFC
  - Contraseña: Mínimo 6 caracteres, encriptada con `password_hash()`
  - Unicidad: DNI, email y teléfono únicos en el sistema
- **Tipos de Usuario Soportados**:
  - Ciudadano (rol 1)
  - Institución (rol 2) - Requiere campos adicionales
  - Técnico (rol 3) - Requiere certificado técnico
- **Respuesta**: Token JWT y datos del usuario registrado

##### **login()** - Autenticación
- **Endpoint**: `POST /api/login`
- **Funcionalidad**: Autenticación segura con DNI y contraseña
- **Validaciones**:
  - Verificación de credenciales en base de datos
  - Validación de contraseña con `password_verify()`
  - Verificación de usuario activo
- **Respuesta**: Token JWT válido por 24 horas

##### **profile()** - Perfil de Usuario
- **Endpoint**: `GET /api/profile`
- **Funcionalidad**: Obtiene perfil completo del usuario autenticado
- **Autenticación**: Requiere token JWT válido
- **Datos Incluidos**:
  - Información personal básica
  - Puntos acumulados
  - Tipo de usuario
  - Ubicación geográfica
  - Imagen de perfil

##### **updateProfile()** - Actualización de Perfil
- **Endpoint**: `PUT /api/usuarios/update-profile`
- **Funcionalidad**: Actualización de datos personales del usuario
- **Campos Actualizables**:
  - Nombre y apellido
  - Teléfono
  - Email (con validación de unicidad)
  - Imagen de perfil
- **Validaciones**: Campos requeridos y formatos válidos

##### **getUserPoints()** - Puntos del Usuario
- **Endpoint**: `GET /api/user/points`
- **Funcionalidad**: Obtiene puntos actuales del usuario
- **Incluye**: Puntos totales y historial de transacciones

##### **getUserStatistics()** - Estadísticas del Usuario
- **Endpoint**: `GET /api/user/statistics`
- **Funcionalidad**: Estadísticas detalladas de donaciones y puntos
- **Datos Incluidos**:
  - Total de donaciones realizadas
  - Puntos ganados por categoría
  - Historial de transacciones
  - Tendencias mensuales

##### **getUserPointsHistory()** - Historial de Puntos
- **Endpoint**: `GET /api/user/points/history`
- **Funcionalidad**: Historial completo de transacciones de puntos
- **Filtros**: Por fecha, tipo de transacción, cantidad

##### **validateEmail()** - Validación de Email
- **Endpoint**: `POST /api/validate-email`
- **Funcionalidad**: Verificación en tiempo real de disponibilidad de email
- **Respuesta**: JSON con estado de disponibilidad

##### **validateDni()** - Validación de DNI
- **Endpoint**: `POST /api/validate-dni`
- **Funcionalidad**: Verificación en tiempo real de disponibilidad de DNI
- **Respuesta**: JSON con estado de disponibilidad

##### **validateTelefono()** - Validación de Teléfono
- **Endpoint**: `POST /api/validate-telefono`
- **Funcionalidad**: Verificación en tiempo real de disponibilidad de teléfono
- **Respuesta**: JSON con estado de disponibilidad

#### Características Técnicas:
- **JWT Integration**: Tokens seguros con expiración configurable
- **Password Security**: Encriptación con `password_hash()` y `password_verify()`
- **CORS Support**: Headers configurados para frontend React Native
- **Error Handling**: Respuestas HTTP apropiadas (200, 201, 400, 401, 500)
- **Database Transactions**: Operaciones atómicas para integridad de datos
- **Input Sanitization**: Limpieza y validación de todos los datos de entrada

### 2. DonationController.php
**Ubicación**: `app/Controllers/DonationController.php`  
**Propósito**: Gestión completa del sistema de donaciones RAEE con cálculo dinámico de puntos

#### Métodos Implementados:

##### **create()** - Crear Donación
- **Endpoint**: `POST /api/donations`
- **Funcionalidad**: Creación de nuevas donaciones con cálculo automático de puntos
- **Campos Requeridos**:
  - `tipo_dispositivo`: Categoría del dispositivo RAEE
  - `marca`: Marca del dispositivo
  - `modelo`: Modelo específico
  - `estado_dispositivo`: Condición física (funcional, parcialmente funcional, etc.)
  - `peso`: Peso en kilogramos (obligatorio para cálculo de puntos)
  - `cantidad`: Número de unidades
  - `descripcion`: Descripción detallada del dispositivo
  - `ubicacion_donacion`: Ubicación donde se realizará la donación
- **Sistema de Puntos Dinámico**:
  ```php
  // Fórmula implementada
  $puntosFinales = ($puntosBase * $multiplicadorEstado + $bonusPeso) * $cantidad;
  ```
- **Categorías y Puntos Base**:
  - Teléfonos móviles: 60 puntos
  - Computadoras: 80 puntos
  - Laptops: 70 puntos
  - Tablets: 50 puntos
  - Televisores: 100 puntos
  - Monitores: 60 puntos
  - Impresoras: 40 puntos
  - Electrodomésticos pequeños: 30 puntos
  - Electrodomésticos grandes: 120 puntos
  - Otros dispositivos: 25 puntos
- **Multiplicadores por Estado**:
  - Funcional: 1.0x (sin penalización)
  - Parcialmente funcional: 0.7x (-30%)
  - No funcional: 0.5x (-50%)
  - Dañado: 0.3x (-70%)
- **Bonus por Peso**:
  - 1-2kg: +5 puntos
  - 3-5kg: +15 puntos
  - 6-10kg: +25 puntos
  - 11-20kg: +40 puntos
  - 21kg+: +60 puntos
- **Respuesta**: Donación creada con puntos calculados y actualización automática del total del usuario

##### **index()** - Listar Donaciones
- **Endpoint**: `GET /api/donations`
- **Funcionalidad**: Listado paginado de donaciones con filtros avanzados
- **Parámetros de Consulta**:
  - `user_id`: ID del usuario (obligatorio)
  - `user_role`: Rol del usuario para control de acceso
  - `page`: Número de página (default: 1)
  - `per_page`: Elementos por página (default: 20)
  - `categoria`: Filtro por categoría de dispositivo
  - `estado`: Filtro por estado del dispositivo
  - `estado_publicacion`: Filtro por estado de publicación
  - `fecha_desde`: Filtro desde fecha específica
  - `fecha_hasta`: Filtro hasta fecha específica
- **Control de Acceso**: Basado en rol de usuario
- **Respuesta**: Lista paginada con metadatos de paginación

##### **getUserDonations()** - Donaciones del Usuario
- **Endpoint**: `GET /api/donations/user`
- **Funcionalidad**: Obtiene donaciones específicas del usuario autenticado
- **Autenticación**: Requiere token JWT válido
- **Filtros**: Disponibles por fecha, estado y categoría
- **Respuesta**: Lista de donaciones del usuario con detalles completos

##### **show()** - Detalles de Donación
- **Endpoint**: `GET /api/donations/{id}`
- **Funcionalidad**: Obtiene detalles completos de una donación específica
- **Validaciones**: Verificación de existencia y permisos de acceso
- **Datos Incluidos**:
  - Información completa del dispositivo
  - Cálculo detallado de puntos
  - Estado actual de la donación
  - Historial de cambios de estado
  - Información del usuario donante

##### **updateStatus()** - Actualizar Estado
- **Endpoint**: `PUT /api/donations/{id}/status`
- **Funcionalidad**: Actualización del estado de una donación
- **Estados Disponibles**:
  - `pendiente`: Donación recibida, en proceso
  - `procesada`: Donación verificada y procesada
  - `completada`: Donación finalizada exitosamente
  - `rechazada`: Donación rechazada por algún motivo
- **Control de Acceso**: Solo administradores y técnicos autorizados
- **Auditoría**: Registro de cambios con timestamp y usuario responsable

#### Características Técnicas:
- **Cálculo Automático**: Sistema de puntos implementado con fórmulas matemáticas precisas
- **Transacciones de Base de Datos**: Operaciones atómicas para integridad de datos
- **Validación Robusta**: Verificación de todos los campos y formatos
- **Control de Acceso**: Sistema de permisos basado en roles
- **Auditoría Completa**: Registro de todos los cambios y operaciones
- **Optimización de Consultas**: Índices de base de datos para consultas eficientes
- **Manejo de Errores**: Respuestas HTTP apropiadas y mensajes descriptivos

### 3. InstitutionController.php
**Ubicación**: `app/Controllers/InstitutionController.php`  
**Propósito**: Gestión de instituciones educativas y organizaciones

#### Métodos Implementados:
- **register()**: `POST /api/institution/register` - Registro de instituciones
- **profile()**: `GET /api/institution/profile` - Perfil de institución
- **updateProfile()**: `PUT /api/institution/profile` - Actualización de perfil

#### Características:
- Validación de datos institucionales específicos
- Gestión de tipos de institución (educativa, gubernamental, ONG, empresa privada)
- Vinculación con usuarios del sistema
- Control de acceso basado en roles

### 4. TechnicianController.php
**Ubicación**: `app/Controllers/TechnicianController.php`  
**Propósito**: Gestión de técnicos especializados en RAEE

#### Métodos Implementados:
- **register()**: `POST /api/technician/register` - Registro de técnicos
- **profile()**: `GET /api/technician/profile` - Perfil de técnico
- **updateProfile()**: `PUT /api/technician/profile` - Actualización de perfil
- **index()**: `GET /api/technicians` - Listado público de técnicos

#### Características:
- Gestión de especialidades y certificaciones técnicas
- Información de talleres y servicios ofrecidos
- Horarios de atención y disponibilidad
- Listado público para selección de técnicos por usuarios

### 5. CategoryController.php
**Ubicación**: `app/Controllers/CategoryController.php`  
**Propósito**: Gestión de categorías de dispositivos RAEE

#### Métodos Implementados:
- **index()**: `GET /api/categories` - Listado de categorías disponibles

#### Características:
- Categorías predefinidas de dispositivos RAEE
- Puntos base asociados a cada categoría
- Soporte para nuevos tipos de dispositivos

### 6. StateController.php
**Ubicación**: `app/Controllers/StateController.php`  
**Propósito**: Gestión de estados de dispositivos

#### Métodos Implementados:
- **index()**: `GET /api/states` - Listado de estados disponibles

#### Características:
- Estados predefinidos (funcional, parcialmente funcional, no funcional, dañado)
- Multiplicadores de puntos asociados a cada estado
- Validación de estados en donaciones

### 7. UbicacionController.php
**Ubicación**: `app/Controllers/UbicacionController.php`  
**Propósito**: Gestión de ubicaciones y ecopuntos

#### Métodos Implementados:
- **index()**: `GET /api/locations` - Listado de ubicaciones disponibles
- **show()**: `GET /api/locations/{id}` - Detalles de ubicación específica
- **getByMunicipality()**: `GET /api/locations/municipality/{municipio}` - Ubicaciones por municipio

#### Características:
- Gestión de ecopuntos disponibles en Misiones
- Filtrado por municipio
- Información detallada de cada ubicación

### 8. ImageController.php
**Ubicación**: `app/Controllers/ImageController.php`  
**Propósito**: Gestión de imágenes y archivos

#### Métodos Implementados:
- **uploadEquipmentImages()**: `POST /api/images/upload` - Subida de imágenes de equipos
- **getImage()**: `GET /api/images/{filename}` - Obtención de imágenes
- **deleteImage()**: `DELETE /api/images/{filename}` - Eliminación de imágenes

#### Características:
- Subida segura de imágenes de equipos
- Validación de tipos de archivo
- Almacenamiento en directorio `writable/uploads/equipment/`
- Generación de nombres únicos para archivos

### 9. CartController.php
**Ubicación**: `app/Controllers/CartController.php`  
**Propósito**: Gestión del carrito de canjes

#### Métodos Implementados:
- **index()**: `GET /api/cart` - Obtener carrito del usuario
- **add()**: `POST /api/cart` - Agregar producto al carrito
- **update()**: `PUT /api/cart/{id}` - Actualizar cantidad en carrito
- **remove()**: `DELETE /api/cart/{id}` - Remover producto del carrito
- **clear()**: `DELETE /api/cart/clear` - Limpiar carrito completo

#### Características:
- Gestión de carrito de compras para canje de puntos
- Validación de disponibilidad de productos
- Cálculo automático de totales
- Persistencia de carrito por usuario

### 10. PublicacionController.php
**Ubicación**: `app/Controllers/PublicacionController.php`  
**Propósito**: Gestión de publicaciones del sistema

#### Métodos Implementados:
- **getAllPublications()**: `GET /api/publications` - Todas las publicaciones
- **getUserPublications()**: `GET /api/publications/user` - Publicaciones del usuario
- **show()**: `GET /api/publications/{id}` - Detalles de publicación

#### Características:
- Gestión de publicaciones y anuncios
- Filtrado por usuario
- Estados de publicación

### 11. UserEquiposController.php
**Ubicación**: `app/Controllers/UserEquiposController.php`  
**Propósito**: Gestión de equipos de usuarios

#### Métodos Implementados:
- **index()**: `GET /api/user-equipos` - Listado de equipos del usuario

#### Características:
- Gestión de equipos asociados a usuarios
- Historial de equipos donados
- Estados de equipos

## Modelos (Models)

### 1. UserModel.php
**Ubicación**: `app/Models/UserModel.php`  
**Tabla**: `usuarios`

#### Campos Principales:
- `idUsuarios`: ID único del usuario (clave primaria)
- `DNI_Usuarios`: Documento de identidad único (7-8 dígitos)
- `Nombres_Usuarios`: Nombre del usuario
- `Apellidos_Usuarios`: Apellido del usuario
- `Email_Usuarios`: Correo electrónico único
- `Password_Usuarios`: Contraseña encriptada con `password_hash()`
- `Telefono_Usuarios`: Número de contacto
- `Roles_Usuarios`: Tipo de usuario (1=ciudadano, 2=institución, 3=técnico)
- `FechaRegistro_Usuarios`: Fecha de registro
- `Activo_Usuarios`: Estado del usuario (0=inactivo, 1=activo)
- `ubicaciones_Usuarios`: ID de ubicación asignada
- `ImagenPerfil_Usuarios`: Nombre del archivo de imagen de perfil
- `Puntos_Usuarios`: Puntos acumulados del usuario
- `Provincia_Usuarios`: Provincia de residencia
- `Municipios_Usuarios`: Municipio de residencia

#### Validaciones Implementadas:
- DNI único y formato válido (7-10 caracteres)
- Email único y formato válido
- Contraseña mínimo 6 caracteres
- Teléfono mínimo 7 caracteres
- Campos requeridos validados

#### Relaciones:
- **One-to-One**: Con InstitucionModel y TecnicoModel
- **One-to-Many**: Con DonationModel (usuario puede tener múltiples donaciones)

### 2. DonationModel.php
**Ubicación**: `app/Models/DonationModel.php`  
**Tabla**: `raee`

#### Campos Principales:
- `id`: ID único de la donación (clave primaria)
- `usuario_id`: ID del usuario donante (clave foránea)
- `tipo_usuario`: Tipo de usuario que realiza la donación
- `tipo_dispositivo`: Categoría del dispositivo RAEE
- `marca`: Marca del dispositivo
- `modelo`: Modelo específico del dispositivo
- `estado_dispositivo`: Condición física del dispositivo
- `peso`: Peso en kilogramos (obligatorio para cálculo de puntos)
- `cantidad`: Número de unidades donadas
- `descripcion`: Descripción detallada del dispositivo
- `descripcion_adicional`: Información adicional
- `ubicacion_donacion`: Ubicación donde se realizará la donación
- `fecha_estimada_donacion`: Fecha programada para la donación
- `estado_donacion`: Estado actual (pendiente, procesada, completada, rechazada)
- `fecha_donacion`: Fecha real de la donación
- `fecha_compra`: Fecha de compra del dispositivo (opcional)
- `preferencias`: Preferencias del usuario para la donación
- `informacion_dispositivo`: Información técnica del dispositivo
- `procesado_por_id`: ID del técnico/administrador que procesó la donación
- `procesado_por_tipo`: Tipo de usuario que procesó la donación
- `fecha_procesamiento`: Fecha de procesamiento
- `notas_procesamiento`: Notas del procesamiento
- `direccion_entrega`: Dirección de entrega a domicilio
- `ciudad_entrega`: Ciudad de entrega
- `codigo_postal_entrega`: Código postal de entrega
- `telefono_entrega`: Teléfono de contacto para entrega
- `fecha_entrega_solicitada`: Fecha solicitada para entrega
- `hora_entrega_solicitada`: Hora solicitada para entrega
- `instrucciones_entrega`: Instrucciones especiales para entrega
- `estado_entrega`: Estado de la entrega
- `fecha_solicitud`: Fecha de solicitud de donación
- `tipo_solicitud`: Tipo de solicitud (entrega a domicilio, recogida, etc.)
- `notas_entrega`: Notas sobre la entrega
- `tecnico_asignado_id`: ID del técnico asignado
- `fecha_entrega_real`: Fecha real de entrega

#### Relaciones:
- **Many-to-One**: Con UserModel (múltiples donaciones por usuario)
- **Many-to-One**: Con TecnicoModel (múltiples donaciones por técnico)

### 3. InstitucionModel.php
**Ubicación**: `app/Models/InstitucionModel.php`  
**Tabla**: `institucions`

#### Campos Principales:
- `id`: ID único de la institución (clave primaria)
- `user_id`: ID del usuario asociado (clave foránea)
- `nombre_institucion`: Nombre oficial de la institución
- `tipo_institucion`: Categoría (educativa, gubernamental, ONG, empresa privada)
- `direccion`: Dirección física de la institución
- `codigo_postal`: Código postal
- `telefono_contacto`: Teléfono de contacto
- `email_contacto`: Email de contacto
- `nombre_responsable`: Nombre de la persona responsable
- `descripcion_programas`: Descripción de programas relacionados con RAEE

#### Relaciones:
- **One-to-One**: Con UserModel (una institución por usuario)

### 4. TecnicoModel.php
**Ubicación**: `app/Models/TecnicoModel.php`  
**Tabla**: `tecnicos`

#### Campos Principales:
- `id`: ID único del técnico (clave primaria)
- `user_id`: ID del usuario asociado (clave foránea)
- `direccion_taller`: Dirección del taller o lugar de trabajo
- `especialidades`: Áreas de especialización en RAEE
- `certificaciones`: Certificaciones profesionales
- `horario_atencion`: Horarios de atención al público
- `servicios_ofrecidos`: Lista de servicios ofrecidos
- `descripcion_servicios`: Descripción detallada de servicios

#### Relaciones:
- **One-to-One**: Con UserModel (un técnico por usuario)
- **One-to-Many**: Con DonationModel (técnico puede procesar múltiples donaciones)

### 5. CategoryModel.php
**Ubicación**: `app/Models/CategoryModel.php`  
**Tabla**: `categories`

#### Campos Principales:
- `id`: ID único de la categoría
- `nombre`: Nombre de la categoría
- `descripcion`: Descripción de la categoría
- `puntos_base`: Puntos base otorgados por esta categoría
- `activo`: Estado de la categoría

### 6. StateModel.php
**Ubicación**: `app/Models/StateModel.php`  
**Tabla**: `states`

#### Campos Principales:
- `id`: ID único del estado
- `nombre`: Nombre del estado
- `descripcion`: Descripción del estado
- `multiplicador`: Multiplicador de puntos para este estado
- `activo`: Estado del registro

### 7. UbicacionModel.php
**Ubicación**: `app/Models/UbicacionModel.php`  
**Tabla**: `ubicaciones`

#### Campos Principales:
- `id`: ID único de la ubicación
- `nombre`: Nombre del ecopunto
- `direccion`: Dirección física
- `municipio`: Municipio donde se encuentra
- `telefono`: Teléfono de contacto
- `horarios`: Horarios de atención
- `servicios`: Servicios ofrecidos
- `imagen`: Imagen del ecopunto
- `activo`: Estado de la ubicación

### 8. CartModel.php
**Ubicación**: `app/Models/CartModel.php`  
**Tabla**: `cart`

#### Campos Principales:
- `id`: ID único del item del carrito
- `usuario_id`: ID del usuario propietario del carrito
- `producto_id`: ID del producto
- `cantidad`: Cantidad del producto
- `precio_unitario`: Precio por unidad
- `fecha_agregado`: Fecha de agregado al carrito

### 9. EquiposModel.php
**Ubicación**: `app/Models/EquiposModel.php`  
**Tabla**: `equipos`

#### Campos Principales:
- `id`: ID único del equipo
- `usuario_id`: ID del usuario propietario
- `categoria_id`: ID de la categoría
- `estado_id`: ID del estado
- `marca`: Marca del equipo
- `modelo`: Modelo del equipo
- `descripcion`: Descripción del equipo
- `imagen`: Imagen del equipo
- `fecha_registro`: Fecha de registro

### 10. HistorialPuntosModel.php
**Ubicación**: `app/Models/HistorialPuntosModel.php`  
**Tabla**: `historial_puntos`

#### Campos Principales:
- `id`: ID único del registro
- `usuario_id`: ID del usuario
- `donacion_id`: ID de la donación (opcional)
- `tipo_transaccion`: Tipo (donacion, canje, ajuste)
- `puntos`: Cantidad de puntos
- `descripcion`: Descripción de la transacción
- `fecha`: Fecha de la transacción

### 11. PublicacionModel.php
**Ubicación**: `app/Models/PublicacionModel.php`  
**Tabla**: `publicaciones`

#### Campos Principales:
- `id`: ID único de la publicación
- `titulo`: Título de la publicación
- `contenido`: Contenido de la publicación
- `autor_id`: ID del autor
- `fecha_publicacion`: Fecha de publicación
- `estado`: Estado de la publicación
- `tipo`: Tipo de publicación

## API Endpoints Completos

### 🔐 Autenticación y Usuarios
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/register` | Registro completo de usuarios | No |
| `POST` | `/api/login` | Autenticación con DNI y contraseña | No |
| `GET` | `/api/profile` | Perfil completo del usuario | JWT |
| `PUT` | `/api/usuarios/update-profile` | Actualización de datos personales | JWT |
| `GET` | `/api/user/points` | Puntos actuales del usuario | JWT |
| `GET` | `/api/user/statistics` | Estadísticas detalladas del usuario | JWT |
| `GET` | `/api/user/points/history` | Historial completo de transacciones | JWT |
| `POST` | `/api/validate-email` | Validación de disponibilidad de email | No |
| `POST` | `/api/validate-dni` | Validación de disponibilidad de DNI | No |
| `POST` | `/api/validate-telefono` | Validación de disponibilidad de teléfono | No |
| `POST` | `/api/logout` | Cierre de sesión | JWT |

### 🏢 Instituciones
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/institution/register` | Registro de instituciones | JWT |
| `GET` | `/api/institution/profile` | Perfil de institución | JWT |
| `PUT` | `/api/institution/profile` | Actualización de perfil institucional | JWT |

### 🔧 Técnicos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/technician/register` | Registro de técnicos especializados | JWT |
| `GET` | `/api/technician/profile` | Perfil de técnico | JWT |
| `PUT` | `/api/technician/profile` | Actualización de perfil técnico | JWT |
| `GET` | `/api/technicians` | Listado público de técnicos | No |

### 📱 Donaciones RAEE
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/donations` | Crear donación con cálculo automático de puntos | JWT |
| `GET` | `/api/donations` | Listado paginado con filtros avanzados | JWT |
| `GET` | `/api/donations/user` | Donaciones del usuario autenticado | JWT |
| `GET` | `/api/donations/{id}` | Detalles completos de donación específica | JWT |
| `PUT` | `/api/donations/{id}/status` | Actualización de estado de donación | JWT |

### 🏪 Carrito de Canjes
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/cart` | Obtener carrito del usuario | JWT |
| `POST` | `/api/cart` | Agregar producto al carrito | JWT |
| `PUT` | `/api/cart/{id}` | Actualizar cantidad en carrito | JWT |
| `DELETE` | `/api/cart/{id}` | Remover producto del carrito | JWT |
| `DELETE` | `/api/cart/clear` | Limpiar carrito completo | JWT |

### 📍 Ubicaciones y Ecopuntos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/locations` | Listado de ecopuntos disponibles | No |
| `GET` | `/api/locations/{id}` | Detalles de ubicación específica | No |
| `GET` | `/api/locations/municipality/{municipio}` | Ubicaciones por municipio | No |
| `GET` | `/api/ubicaciones` | Alias para listado de ubicaciones | No |

### 📂 Datos Maestros
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/categories` | Categorías de dispositivos RAEE | No |
| `GET` | `/api/states` | Estados de dispositivos | No |

### 🖼️ Gestión de Imágenes
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/images/upload` | Subida de imágenes de equipos | JWT |
| `GET` | `/api/images/{filename}` | Obtención de imágenes | No |
| `DELETE` | `/api/images/{filename}` | Eliminación de imágenes | JWT |

### 📰 Publicaciones
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/publications` | Todas las publicaciones del sistema | No |
| `GET` | `/api/publications/user` | Publicaciones del usuario | JWT |
| `GET` | `/api/publications/{id}` | Detalles de publicación específica | No |

### ⚙️ Equipos de Usuario
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/user-equipos` | Listado de equipos del usuario | JWT |

### 🎯 Sistema de Puntos Dinámico
- **Cálculo Automático**: Los puntos se calculan automáticamente al crear donaciones
- **Fórmula Implementada**: 
  ```php
  $puntosFinales = ($puntosBase * $multiplicadorEstado + $bonusPeso) * $cantidad;
  ```
- **Categorías y Puntos Base**:
  - Teléfonos móviles: 60 puntos
  - Computadoras: 80 puntos
  - Laptops: 70 puntos
  - Tablets: 50 puntos
  - Televisores: 100 puntos
  - Monitores: 60 puntos
  - Impresoras: 40 puntos
  - Electrodomésticos pequeños: 30 puntos
  - Electrodomésticos grandes: 120 puntos
  - Otros dispositivos: 25 puntos
- **Multiplicadores por Estado**:
  - Funcional: 1.0x (sin penalización)
  - Parcialmente funcional: 0.7x (-30%)
  - No funcional: 0.5x (-50%)
  - Dañado: 0.3x (-70%)
- **Bonus por Peso**:
  - 1-2kg: +5 puntos
  - 3-5kg: +15 puntos
  - 6-10kg: +25 puntos
  - 11-20kg: +40 puntos
  - 21kg+: +60 puntos

## Dependencias Principales

### Composer Dependencies (Producción)
```json
{
  "php": "^8.1",
  "codeigniter4/framework": "^4.0"
}
```

### Dependencias de Desarrollo
```json
{
  "fakerphp/faker": "^1.9",
  "mikey179/vfsstream": "^1.6",
  "phpunit/phpunit": "^10.5.16"
}
```

### Librerías Incluidas:
- **CodeIgniter 4**: Framework MVC completo
- **Laminas Escaper**: Escapado seguro de datos
- **PSR Log**: Interfaz estándar de logging
- **PHPUnit**: Framework de testing
- **Faker**: Generación de datos de prueba

## Estructura de Base de Datos

El sistema utiliza MySQL como base de datos principal con el esquema `EcoRAEE-db`. La configuración se encuentra en:
- **Archivo**: `app/Config/Database.php`
- **Driver**: MySQLi
- **Charset**: utf8mb4
- **Puerto**: 3306 (por defecto)
- **Base de Datos**: `EcoRAEE-db`

### Tablas de la Base de Datos:

#### 1. **`usuarios`** - Tabla Principal de Usuarios
- `idUsuarios` (INT(11), PK) - ID único del usuario
- `DNI_Usuarios` (VARCHAR(10)) - Documento de identidad único
- `Nombres_Usuarios` (VARCHAR(50)) - Nombre del usuario
- `Apellidos_Usuarios` (VARCHAR(50)) - Apellido del usuario
- `Password_Usuarios` (VARCHAR(255)) - Contraseña encriptada
- `Telefono_Usuarios` (VARCHAR(14)) - Número de teléfono
- `Email_Usuarios` (VARCHAR(100)) - Correo electrónico único
- `Roles_Usuarios` (INT(11), FK a roles) - Tipo de usuario
- `Puntos_Usuarios` (INT(11)) - Puntos acumulados
- `ImagenPerfil_Usuarios` (VARCHAR(255)) - Imagen de perfil
- `FechaRegistro_Usuarios` (DATETIME) - Fecha de registro
- `Activo_Usuarios` (TINYINT(4)) - Estado del usuario
- `ubicaciones_Usuarios` (INT(11), FK a ubicaciones) - Ubicación del usuario

#### 2. **`roles`** - Roles del Sistema
- `idRoles` (INT(11), PK) - ID del rol
- `Descripcion_Roles` (VARCHAR(50)) - Descripción del rol

#### 3. **`equipos`** - Dispositivos RAEE
- `idEquipos` (INT(11), PK) - ID único del equipo
- `idClientes_Equipos` (INT(11), FK a usuarios) - Propietario del equipo
- `idCategorias_Equipos` (INT(11), FK a categorias_equipos) - Categoría del equipo
- `Marca_Equipos` (VARCHAR(50)) - Marca del dispositivo
- `Modelo_Equipos` (VARCHAR(100)) - Modelo del dispositivo
- `idEstados_Equipos` (INT(11), FK a estados) - Estado del dispositivo
- `Cantidad_Equipos` (INT(11)) - Cantidad de unidades
- `Descripcion_Equipos` (VARCHAR(255)) - Descripción detallada
- `Fotos_Equipos` (TEXT) - Fotos del equipo
- `PesoKG_Equipos` (DOUBLE) - Peso en kilogramos
- `DimencionesCM_Equipos` (VARCHAR(20)) - Dimensiones en cm
- `Accesorios_Equipos` (VARCHAR(100)) - Accesorios incluidos
- `FechaIngreso_Equipos` (DATETIME) - Fecha de ingreso
- `ImagenPrincipal_Equipos` (VARCHAR(255)) - Imagen principal

#### 4. **`categorias_equipos`** - Categorías de Dispositivos
- `idCategorias` (INT(11), PK) - ID de la categoría
- `Nombres_Categorias` (VARCHAR(50)) - Nombre de la categoría
- `PuntosBase_Categorias` (INT(11)) - Puntos base por categoría
- `Activo_Categorias` (TINYINT(4)) - Estado de la categoría

#### 5. **`estados`** - Estados de Dispositivos
- `idEstados` (INT(11), PK) - ID del estado
- `Nombres_Estados` (VARCHAR(50)) - Nombre del estado
- `MultiplicadorPuntos_Estados` (DECIMAL(3,2)) - Multiplicador de puntos
- `Activo_Estados` (TINYINT(4)) - Estado activo

#### 6. **`ubicaciones`** - Ubicaciones y Ecopuntos
- `idUbicaciones` (INT(11), PK) - ID de la ubicación
- `Direccion_Ubicaciones` (VARCHAR(255)) - Dirección
- `NroCalle_Ubicaciones` (VARCHAR(10)) - Número de calle
- `Provincia_Ubicaciones` (VARCHAR(50)) - Provincia
- `Municipios_Ubicaciones` (VARCHAR(50)) - Municipio
- `Latitud_Ubicaciones` (DECIMAL(10,8)) - Coordenada latitud
- `Longitud_Ubicaciones` (DECIMAL(10,8)) - Coordenada longitud
- `Estado_Ubicaciones` (INT(11), FK a estados) - Estado de la ubicación

#### 7. **`publicacion`** - Publicaciones de Equipos
- `idPublicacion` (INT(11), PK) - ID de la publicación
- `Titulo_Publicacion` (VARCHAR(100)) - Título de la publicación
- `Descripcion_Publicacion` (VARCHAR(255)) - Descripción
- `Puntos_Publicacion` (INT(11)) - Puntos requeridos
- `Fecha_Publicacion` (DATETIME) - Fecha de publicación
- `clientes_Publicacion` (INT(11), FK a usuarios) - Usuario publicador
- `estados_Publicacion` (INT(11), FK a estados) - Estado de la publicación
- `equipos_Publicacion` (INT(11), FK a equipos) - Equipo publicado

#### 8. **`historial_puntos`** - Historial de Transacciones de Puntos
- `idHistorialPuntos` (INT(11), PK) - ID del historial
- `PuntosInicial_Puntos` (INT(11)) - Puntos iniciales
- `PuntosCambiados_Puntos` (INT(11)) - Puntos cambiados
- `PuntosTotales_Puntos` (INT(11)) - Puntos totales
- `equipos_idEquipos` (INT(11), FK a equipos) - Equipo relacionado
- `usuarios_idUsuarios` (INT(11), FK a usuarios) - Usuario
- `Estado_Puntos` (TINYINT(4)) - Estado de la transacción
- `FechaMovimiento_Puntos` (DATETIME) - Fecha del movimiento

#### 9. **`carrito_compras`** - Carrito de Compras
- `idCarrito_Compras` (INT(11), PK) - ID del carrito
- `usuarios_Carrito` (INT(11), FK a usuarios) - Usuario propietario
- `equipos_Carrito` (INT(11), FK a equipos) - Equipo en carrito
- `publicacion_Carrito` (INT(11), FK a publicacion) - Publicación en carrito
- `Cantidad_Carrito` (INT(11)) - Cantidad en carrito
- `FechaAgregado_Carrito` (DATETIME) - Fecha de agregado
- `Activo_Carrito` (TINYINT(1)) - Estado del carrito

#### 10. **`credenciales_tecnico`** - Credenciales de Técnicos
- `id_Credenciales` (INT(11), PK) - ID de credencial
- `Certificado_Tecnico` (VARCHAR(255)) - Certificado técnico
- `clientes_Tecnico` (INT(11), FK a usuarios) - Usuario técnico
- `estados_Tecnico` (INT(11), FK a estados) - Estado del técnico

#### 11. **`credenciales_institucion`** - Credenciales de Instituciones
- `id_Institucion` (INT(11), PK) - ID de institución
- `NroLegajo_Institucion` (VARCHAR(45)) - Número de legajo
- `Tipo_Institucion` (TINYINT(2)) - Tipo de institución
- `Contacto_Institucion` (VARCHAR(45)) - Contacto
- `RegistroTitulo_Institucion` (VARCHAR(45)) - Registro/título
- `clientes_Institucion` (INT(11), FK a usuarios) - Usuario institución
- `estados_Institucion` (INT(11), FK a estados) - Estado de la institución

#### 12. **`ubicaciones_recoleccion`** - Ubicaciones de Recolección
- `idUbicaciones_Recoleccion` (INT(11), PK) - ID de recolección
- `ubicaciones_Recoleccion` (INT(11), FK a ubicaciones) - Ubicación
- `publicacion_Recoleccion` (INT(11), FK a publicacion) - Publicación
- `FechaMovimiento_Recoleccion` (DATETIME) - Fecha de movimiento

## Seguridad (Prototipo)

### Autenticación Simple
- Autenticación basada en sesiones simples para prototipo
- Validación de credenciales DNI/contraseña
- Sin tokens JWT (prototipo)

### Validación de Datos
- Validación de entrada en todos los controladores
- Sanitización de datos antes del almacenamiento
- Protección contra inyección SQL mediante ORM de CodeIgniter
- Validación de formatos (DNI, email, teléfono)

### CORS
- Configuración de headers CORS para frontend React Native
- Soporte para métodos HTTP: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Accept

### Encriptación de Contraseñas
- Encriptación con `password_hash()` de PHP
- Verificación con `password_verify()` de PHP
- Algoritmo de hash seguro (bcrypt por defecto)

## Archivos Esenciales para el Funcionamiento

### Archivos de Configuración
1. **`.env`** - Variables de entorno (base de datos, configuración de aplicación)
2. **`app/Config/Database.php`** - Configuración de base de datos MySQL
3. **`app/Config/Routes.php`** - Definición de rutas API
4. **`app/Config/CORS.php`** - Configuración de CORS para frontend
5. **`composer.json`** - Dependencias del proyecto

### Archivos de Aplicación
1. **`public/index.php`** - Punto de entrada principal
2. **`preload.php`** - Precarga de clases para optimización
3. **`spark`** - CLI de CodeIgniter

### Controladores (Obligatorios)
- `AuthController.php` - Autenticación de usuarios (sin JWT)
- `DonationController.php` - Gestión de equipos RAEE
- `InstitutionController.php` - Gestión de instituciones
- `TechnicianController.php` - Gestión de técnicos
- `CategoryController.php` - Gestión de categorías de equipos
- `StateController.php` - Gestión de estados de equipos
- `UbicacionController.php` - Gestión de ubicaciones y ecopuntos
- `ImageController.php` - Gestión de imágenes de equipos
- `CartController.php` - Gestión de carrito de compras
- `PublicacionController.php` - Gestión de publicaciones
- `UserEquiposController.php` - Gestión de equipos de usuarios

### Modelos (Obligatorios)
- `UserModel.php` - Gestión de usuarios
- `EquiposModel.php` - Gestión de equipos RAEE
- `InstitucionModel.php` - Datos institucionales
- `TecnicoModel.php` - Datos de técnicos
- `CategoryModel.php` - Categorías de equipos
- `StateModel.php` - Estados de equipos
- `UbicacionModel.php` - Ubicaciones y ecopuntos
- `CartModel.php` - Carrito de compras
- `PublicacionModel.php` - Publicaciones de equipos
- `HistorialPuntosModel.php` - Historial de transacciones de puntos

### Directorio Vendor
- **`vendor/`** - Dependencias de Composer (CodeIgniter 4, Laminas Escaper, etc.)

## Instalación y Configuración

### Requisitos del Sistema

- **PHP**: 8.1 o superior
- **Servidor Web**: Apache/Nginx
- **Base de Datos**: MySQL 5.7+ o MariaDB 10.3+
- **Composer**: Para gestión de dependencias
- **Extensiones PHP requeridas**:
  - php-mysqli
  - php-json
  - php-mbstring
  - php-openssl

### Pasos de Instalación

#### 1. Clonar o Descargar el Proyecto
```bash
# Si tienes acceso al repositorio
git clone [URL_DEL_REPOSITORIO] RAEE-BackEnd
cd RAEE-BackEnd
```

#### 2. Instalar Dependencias
```bash
composer install
```

#### 3. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
# Configuración de Base de Datos
database.default.hostname = localhost
database.default.database = EcoRAEE-db
database.default.username = tu_usuario_db
database.default.password = tu_password_db
database.default.DBDriver = MySQLi
database.default.port = 3306

# Configuración de Aplicación
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'
```

#### 4. Configurar Base de Datos
Crear la base de datos y las tablas necesarias según el diagrama EcoRAEE-db:

```sql
-- Crear base de datos
CREATE DATABASE `EcoRAEE-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `EcoRAEE-db`;

-- Tabla de roles
CREATE TABLE `roles` (
    `idRoles` INT(11) NOT NULL AUTO_INCREMENT,
    `Descripcion_Roles` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`idRoles`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios
CREATE TABLE `usuarios` (
    `idUsuarios` INT(11) NOT NULL AUTO_INCREMENT,
    `DNI_Usuarios` VARCHAR(10) NOT NULL,
    `Nombres_Usuarios` VARCHAR(50) NOT NULL,
    `Apellidos_Usuarios` VARCHAR(50) NOT NULL,
    `Password_Usuarios` VARCHAR(255) NOT NULL,
    `Telefono_Usuarios` VARCHAR(14) NOT NULL,
    `Email_Usuarios` VARCHAR(100) NOT NULL,
    `Roles_Usuarios` INT(11) NOT NULL,
    `Puntos_Usuarios` INT(11) DEFAULT 0,
    `ImagenPerfil_Usuarios` VARCHAR(255) DEFAULT NULL,
    `FechaRegistro_Usuarios` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `Activo_Usuarios` TINYINT(4) DEFAULT 1,
    `ubicaciones_Usuarios` INT(11) DEFAULT NULL,
    PRIMARY KEY (`idUsuarios`),
    UNIQUE KEY `DNI_Usuarios` (`DNI_Usuarios`),
    UNIQUE KEY `Email_Usuarios` (`Email_Usuarios`),
    KEY `Roles_Usuarios` (`Roles_Usuarios`),
    KEY `ubicaciones_Usuarios` (`ubicaciones_Usuarios`),
    CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`Roles_Usuarios`) REFERENCES `roles` (`idRoles`),
    CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`ubicaciones_Usuarios`) REFERENCES `ubicaciones` (`idUbicaciones`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de donaciones RAEE
CREATE TABLE raee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_usuario VARCHAR(50),
    tipo_dispositivo VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    estado_dispositivo VARCHAR(50),
    peso DECIMAL(5,2) NOT NULL,  -- Campo agregado para sistema de puntos
    cantidad INT DEFAULT 1,      -- Campo agregado para sistema de puntos
    descripcion TEXT,
    descripcion_adicional TEXT,
    ubicacion_donacion VARCHAR(255),
    fecha_estimada_donacion DATE,
    estado_donacion VARCHAR(50) DEFAULT 'pendiente',
    fecha_donacion TIMESTAMP NULL,
    fecha_compra DATE,
    preferencias TEXT,
    informacion_dispositivo TEXT,
    procesado_por_id INT,
    procesado_por_tipo VARCHAR(50),
    fecha_procesamiento TIMESTAMP NULL,
    notas_procesamiento TEXT,
    direccion_entrega VARCHAR(255),
    ciudad_entrega VARCHAR(100),
    codigo_postal_entrega VARCHAR(10),
    telefono_entrega VARCHAR(20),
    fecha_entrega_solicitada DATE,
    hora_entrega_solicitada TIME,
    instrucciones_entrega TEXT,
    estado_entrega VARCHAR(50),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_solicitud VARCHAR(50),
    notas_entrega TEXT,
    tecnico_asignado_id INT,
    fecha_entrega_real TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);

-- Tabla de instituciones
CREATE TABLE institucions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nombre_institucion VARCHAR(200) NOT NULL,
    tipo_institucion VARCHAR(100),
    direccion VARCHAR(255),
    codigo_postal VARCHAR(10),
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(150),
    nombre_responsable VARCHAR(150),
    descripcion_programas TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de técnicos
CREATE TABLE tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    direccion_taller VARCHAR(255),
    especialidades TEXT,
    certificaciones TEXT,
    horario_atencion VARCHAR(200),
    servicios_ofrecidos TEXT,
    descripcion_servicios TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de verificaciones (para sistema de verificación de email/teléfono)
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
    
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Índices optimizados para consultas frecuentes
    INDEX idx_usuario_tipo (usuario_id, tipo_verificacion),
    INDEX idx_codigo_usado (codigo, usado),
    INDEX idx_expira_usado (expira_en, usado),
    INDEX idx_token (token_verificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. Configurar Servidor Web

**Para Apache (.htaccess ya incluido):**
```apache
# Asegurar que mod_rewrite esté habilitado
# El archivo .htaccess en public/ maneja las redirecciones
```

**Para Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/RAEE-BackEnd/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

#### 6. Configurar Permisos
```bash
# Dar permisos de escritura a directorios necesarios
chmod -R 755 writable/
chmod -R 755 public/
```

### Verificación de Instalación

#### Probar la API
```bash
# Verificar que el servidor esté funcionando
curl http://localhost:8080/

# Probar endpoint de registro
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678",
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "password": "password123",
    "telefono": "123456789"
  }'

# Probar endpoint de actualización de perfil (requiere token JWT)
curl -X PUT http://localhost:8080/api/usuarios/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "nombre": "Nuevo Nombre",
    "apellido": "Nuevo Apellido"
  }'

# Probar endpoint de donación con sistema de puntos
curl -X POST http://localhost:8080/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "tipo_dispositivo": "Teléfono móvil",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "estado_dispositivo": "Funcional",
    "peso": 6.0,
    "cantidad": 1,
    "descripcion": "Teléfono en buen estado"
  }'
```

### Configuración para Desarrollo

#### Habilitar Modo Debug
En `.env`:
```env
CI_ENVIRONMENT = development
```

#### Logs de Desarrollo
Los logs se guardan en `writable/logs/`

### Configuración para Producción

#### Variables de Entorno de Producción
```env
CI_ENVIRONMENT = production
app.baseURL = 'https://tu-dominio.com/'

# Configuración de seguridad
security.csrfProtection = 'cookie'
security.tokenRandomize = true
```

#### Optimizaciones
```bash
# Optimizar autoloader
composer dump-autoload --optimize

# Limpiar caché
php spark cache:clear
```

### Solución de Problemas Comunes

#### Error de Conexión a Base de Datos
- Verificar credenciales en `.env`
- Confirmar que MySQL esté ejecutándose
- Verificar permisos de usuario de base de datos

#### Error 500 - Internal Server Error
- Revisar logs en `writable/logs/`
- Verificar permisos de directorio `writable/`
- Confirmar versión de PHP

#### Problemas de CORS
- Verificar configuración de headers en controladores
- Confirmar que el frontend esté en la lista de orígenes permitidos

### Comandos Útiles

```bash
# Ver rutas disponibles
php spark routes

# Limpiar caché
php spark cache:clear

# Ver información del sistema
php spark about

# Ejecutar migraciones (si las hay)
php spark migrate
```

## Funcionalidades Recientes Implementadas

### 🔄 **Sistema de Actualización de Perfil**
- **Endpoint**: `PUT /api/usuarios/update-profile`
- **Funcionalidad**: Permite actualizar nombre y apellido del usuario
- **Validación**: Campos requeridos y formato de datos
- **Seguridad**: Autenticación JWT obligatoria
- **Respuesta**: JSON con datos actualizados del usuario

### 🎯 **Sistema de Puntos Dinámico**
- **Cálculo Automático**: Puntos calculados al crear donaciones
- **Fórmula Implementada**:
  ```php
  $puntosFinales = ($puntosBase * $multiplicadorEstado + $bonusPeso) * $cantidad;
  ```
- **Categorías de Dispositivos**:
  - Teléfonos móviles: 60 puntos base
  - Computadoras: 80 puntos base
  - Laptops: 70 puntos base
  - Tablets: 50 puntos base
  - Televisores: 100 puntos base
  - Monitores: 60 puntos base
  - Impresoras: 40 puntos base
  - Electrodomésticos pequeños: 30 puntos base
  - Electrodomésticos grandes: 120 puntos base
  - Otros: 25 puntos base

- **Multiplicadores por Estado**:
  - Funcional: 1.0x (sin penalización)
  - Parcialmente funcional: 0.7x (-30%)
  - No funcional: 0.5x (-50%)
  - Dañado: 0.3x (-70%)

- **Bonus por Peso**:
  - 1-2kg: +5 puntos
  - 3-5kg: +15 puntos
  - 6-10kg: +25 puntos
  - 11-20kg: +40 puntos
  - 21kg+: +60 puntos

### 📊 **Base de Datos de Verificaciones (Preparada)**
La estructura está lista para implementar un sistema de verificación robusto:

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

## Notas Técnicas

- El sistema utiliza transacciones de base de datos para operaciones críticas
- Implementa un sistema de roles para control de acceso
- Soporte completo para CORS para integración con frontend
- Validación robusta de datos de entrada
- Gestión de errores con códigos HTTP apropiados
- Estructura modular para fácil mantenimiento y escalabilidad
- **Sistema de puntos escalable**: Fácil adición de nuevas categorías y reglas
- **API RESTful**: Endpoints bien definidos y documentados

## Soporte y Mantenimiento

### Logs del Sistema
- **Ubicación**: `writable/logs/`
- **Rotación**: Automática por fecha
- **Niveles**: ERROR, WARNING, INFO, DEBUG

### Backup de Base de Datos
```bash
# Crear backup
mysqldump -u usuario -p raee_database > backup_raee_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u usuario -p raee_database < backup_raee_YYYYMMDD.sql
```

### Monitoreo
- Verificar logs regularmente
- Monitorear uso de base de datos
- Revisar rendimiento de endpoints críticos