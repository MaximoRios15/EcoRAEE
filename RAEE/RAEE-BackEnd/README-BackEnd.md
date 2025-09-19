# RAEE-BackEnd

## Descripción del Proyecto

RAEE-BackEnd es la API REST del sistema EcoRAEE, desarrollada con CodeIgniter 4. Este backend gestiona el sistema de donaciones y reciclaje de Residuos de Aparatos Eléctricos y Electrónicos (RAEE), proporcionando servicios para usuarios, instituciones y técnicos especializados.

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
│   ├── Config/
│   │   ├── Database.php      # Configuración de base de datos
│   │   └── Routes.php        # Definición de rutas API
│   ├── Controllers/
│   │   ├── AuthController.php        # Autenticación y gestión de usuarios
│   │   ├── DonationController.php    # Gestión de donaciones RAEE
│   │   ├── InstitutionController.php # Gestión de instituciones
│   │   └── TechnicianController.php  # Gestión de técnicos
│   └── Models/
│       ├── UserModel.php         # Modelo de usuarios
│       ├── DonationModel.php     # Modelo de donaciones
│       ├── InstitucionModel.php  # Modelo de instituciones
│       └── TecnicoModel.php      # Modelo de técnicos
├── public/
│   └── index.php             # Punto de entrada de la aplicación
├── vendor/                   # Dependencias de Composer
├── composer.json            # Configuración de dependencias
└── .env                     # Variables de entorno
```

## Controladores

### 1. AuthController
**Archivo**: `app/Controllers/AuthController.php`

**Funcionalidad**: Gestiona la autenticación y registro de usuarios en el sistema.

**Métodos principales**:
- `register()`: Registra nuevos usuarios con validación de datos
- `login()`: Autentica usuarios y genera tokens JWT
- `profile()`: Obtiene el perfil del usuario autenticado
- `updateProfile()`: Actualiza datos del perfil del usuario
- `options()`: Maneja las solicitudes CORS preflight

**Características**:
- Validación de datos de entrada (DNI, email, teléfono)
- Encriptación de contraseñas con `password_hash()`
- Generación y validación de tokens JWT
- Soporte para diferentes tipos de usuario (usuario, institucion, tecnico)
- Gestión de transacciones de base de datos
- Configuración de headers CORS
- **Actualización de perfil**: Modificación de nombre y apellido del usuario
- **Validación de datos**: Verificación de campos requeridos en actualizaciones
- **Respuestas JSON**: Formato consistente para todas las respuestas API

### 2. DonationController
**Archivo**: `app/Controllers/DonationController.php`

**Funcionalidad**: Gestiona todas las operaciones relacionadas con las donaciones de RAEE.

**Métodos principales**:
- `create()`: Crea nuevas donaciones de dispositivos RAEE
- `getUserDonations()`: Obtiene las donaciones de un usuario específico
- `getAllDonations()`: Lista todas las donaciones (solo administradores)
- `updateStatus()`: Actualiza el estado de una donación
- `getDonation()`: Obtiene detalles de una donación específica

**Características**:
- Validación de tipos de dispositivos y estados
- Control de acceso basado en roles de usuario
- Gestión de estados de donación (pendiente, procesada, completada)
- Registro de información detallada del dispositivo
- Soporte para entregas a domicilio
- **Sistema de puntos dinámico**: Cálculo automático de puntos basado en:
  - Categoría del dispositivo (puntos base)
  - Estado del dispositivo (multiplicador)
  - Peso del dispositivo (bonus)
  - Cantidad de unidades
- **Validación de peso**: Campo obligatorio para cálculo de puntos
- **Respuestas estructuradas**: Formato JSON consistente con códigos de estado HTTP

### 3. InstitutionController
**Archivo**: `app/Controllers/InstitutionController.php`

**Funcionalidad**: Gestiona el registro y perfil de instituciones educativas o organizaciones.

**Métodos principales**:
- `register()`: Registra nuevas instituciones en el sistema
- `getProfile()`: Obtiene el perfil completo de la institución
- `updateProfile()`: Actualiza la información de la institución

**Características**:
- Validación de datos institucionales
- Gestión de información específica (tipo de institución, programas)
- Vinculación con usuarios del sistema
- Control de acceso restringido a instituciones

### 4. TechnicianController
**Archivo**: `app/Controllers/TechnicianController.php`

**Funcionalidad**: Gestiona el registro y perfil de técnicos especializados en RAEE.

**Métodos principales**:
- `register()`: Registra nuevos técnicos en el sistema
- `getProfile()`: Obtiene el perfil completo del técnico
- `updateProfile()`: Actualiza la información del técnico
- `getAllTechnicians()`: Lista todos los técnicos disponibles

**Características**:
- Gestión de especialidades y certificaciones
- Información de talleres y servicios ofrecidos
- Horarios de atención
- Listado público para selección de técnicos

## Modelos

### 1. UserModel
**Archivo**: `app/Models/UserModel.php`
**Tabla**: `users`

**Campos principales**:
- `dni`: Documento de identidad único
- `nombre`, `apellido`: Información personal
- `email`: Correo electrónico (único)
- `password`: Contraseña encriptada
- `telefono`: Número de contacto
- `provincia`, `municipio`: Ubicación geográfica
- `tipo_usuario`: Tipo de usuario (usuario, institucion, tecnico)
- `puntos`: Sistema de puntos por donaciones

### 2. DonationModel
**Archivo**: `app/Models/DonationModel.php`
**Tabla**: `raee`

**Campos principales**:
- `usuario_id`: ID del usuario donante
- `tipo_dispositivo`: Categoría del dispositivo RAEE
- `marca`, `modelo`: Información del dispositivo
- `estado_dispositivo`: Condición física del dispositivo
- `descripcion`: Descripción detallada
- `ubicacion_donacion`: Lugar de recogida
- `fecha_estimada_donacion`: Fecha programada
- `estado_donacion`: Estado actual (pendiente, procesada, etc.)
- Campos de entrega: dirección, ciudad, fecha, técnico asignado

### 3. InstitucionModel
**Archivo**: `app/Models/InstitucionModel.php`
**Tabla**: `institucions`

**Campos principales**:
- `user_id`: Vinculación con usuario
- `nombre_institucion`: Nombre oficial
- `tipo_institucion`: Categoría institucional
- `direccion`, `codigo_postal`: Ubicación
- `telefono_contacto`, `email_contacto`: Información de contacto
- `nombre_responsable`: Persona a cargo
- `descripcion_programas`: Programas relacionados con RAEE

### 4. TecnicoModel
**Archivo**: `app/Models/TecnicoModel.php`
**Tabla**: `tecnicos`

**Campos principales**:
- `user_id`: Vinculación con usuario
- `direccion_taller`: Ubicación del taller
- `especialidades`: Áreas de especialización
- `certificaciones`: Certificaciones profesionales
- `horario_atencion`: Horarios de trabajo
- `servicios_ofrecidos`: Lista de servicios
- `descripcion_servicios`: Descripción detallada

## API Endpoints

### Autenticación
- `POST /api/register` - Registro de usuarios
- `POST /api/login` - Inicio de sesión
- `GET /api/profile` - Perfil del usuario
- `PUT /api/usuarios/update-profile` - Actualizar perfil del usuario

### Instituciones
- `POST /api/institution/register` - Registro de institución
- `GET /api/institution/profile` - Perfil de institución
- `PUT /api/institution/profile` - Actualizar perfil

### Técnicos
- `POST /api/technician/register` - Registro de técnico
- `GET /api/technician/profile` - Perfil de técnico
- `PUT /api/technician/profile` - Actualizar perfil
- `GET /api/technicians` - Listar técnicos

### Donaciones
- `POST /api/donations` - Crear donación
- `GET /api/donations` - Listar todas las donaciones
- `GET /api/donations/user` - Donaciones del usuario
- `GET /api/donations/{id}` - Detalles de donación
- `PUT /api/donations/{id}/status` - Actualizar estado

### Sistema de Puntos
- **Cálculo automático**: Los puntos se calculan automáticamente al crear donaciones
- **Fórmula de puntos**: `(puntos_base * multiplicador_estado + bonus_peso) * cantidad`
- **Categorías de dispositivos**: Cada tipo tiene puntos base diferentes
- **Estados de dispositivos**: Multiplicadores según condición (funcional, parcialmente funcional, etc.)
- **Bonus por peso**: Puntos adicionales según el peso del dispositivo

## Dependencias Principales

### Composer Dependencies
```json
{
  "php": "^8.1",
  "codeigniter4/framework": "^4.0",
  "firebase/php-jwt": "^6.11"
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

## Configuración de Base de Datos

El sistema utiliza MySQL como base de datos principal. La configuración se encuentra en:
- **Archivo**: `app/Config/Database.php`
- **Driver**: MySQLi
- **Charset**: utf8mb4
- **Puerto**: 3306 (por defecto)

## Seguridad

### Autenticación JWT
- Tokens JWT para autenticación stateless
- Validación de tokens en endpoints protegidos
- Expiración configurable de tokens

### Validación de Datos
- Validación de entrada en todos los controladores
- Sanitización de datos antes del almacenamiento
- Protección contra inyección SQL mediante ORM

### CORS
- Configuración de headers CORS para frontend
- Soporte para métodos HTTP: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Authorization

## Archivos Esenciales para el Funcionamiento

### Archivos de Configuración
1. **`.env`** - Variables de entorno (base de datos, JWT secret)
2. **`app/Config/Database.php`** - Configuración de base de datos
3. **`app/Config/Routes.php`** - Definición de rutas API
4. **`composer.json`** - Dependencias del proyecto

### Archivos de Aplicación
1. **`public/index.php`** - Punto de entrada principal
2. **`preload.php`** - Precarga de clases para optimización
3. **`spark`** - CLI de CodeIgniter

### Controladores (Obligatorios)
- `AuthController.php` - Autenticación básica
- `DonationController.php` - Funcionalidad principal RAEE
- `InstitutionController.php` - Gestión institucional
- `TechnicianController.php` - Gestión de técnicos

### Modelos (Obligatorios)
- `UserModel.php` - Gestión de usuarios
- `DonationModel.php` - Gestión de donaciones
- `InstitucionModel.php` - Datos institucionales
- `TecnicoModel.php` - Datos de técnicos

### Directorio Vendor
- **`vendor/`** - Dependencias de Composer (CodeIgniter 4, JWT, etc.)

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
database.default.database = raee_database
database.default.username = tu_usuario_db
database.default.password = tu_password_db
database.default.DBDriver = MySQLi
database.default.port = 3306

# Configuración JWT
JWT_SECRET = tu_clave_secreta_jwt_muy_segura

# Configuración de Aplicación
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'
```

#### 4. Configurar Base de Datos
Crear la base de datos y las tablas necesarias:

```sql
-- Crear base de datos
CREATE DATABASE raee_database CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    provincia VARCHAR(100),
    municipio VARCHAR(100),
    tipo_usuario ENUM('usuario', 'institucion', 'tecnico') DEFAULT 'usuario',
    puntos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

### 🔧 **Mejoras en Validación y Respuestas**
- **Validación de Peso**: Campo obligatorio para donaciones
- **Respuestas JSON Estructuradas**: Formato consistente para todas las respuestas
- **Códigos HTTP Apropiados**: 200, 201, 400, 401, 404, 500
- **Manejo de Errores**: Mensajes descriptivos para debugging
- **Headers CORS**: Configuración actualizada para frontend

### 🚀 **Optimizaciones de Rendimiento**
- **Índices de Base de Datos**: Optimizados para consultas frecuentes
- **Transacciones**: Uso eficiente para operaciones críticas
- **Validación Eficiente**: Validación rápida de datos de entrada
- **Respuestas Ligeras**: JSON optimizado sin datos innecesarios

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