-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-10-2025 a las 05:42:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ecoraee-db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_compras`
--

CREATE TABLE `carrito_compras` (
  `idCarrito_Compras` int(11) NOT NULL,
  `usuarios_Carrito` int(11) NOT NULL,
  `equipos_Carrito` int(11) NOT NULL,
  `publicacion_Carrito` int(11) NOT NULL,
  `Cantidad_Carrito` int(11) DEFAULT NULL,
  `FechaAgregado_Carrito` datetime DEFAULT current_timestamp(),
  `Activo_Carrito` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_equipos`
--

CREATE TABLE `categorias_equipos` (
  `idCategorias` int(11) NOT NULL,
  `Nombres_Categorias` varchar(50) NOT NULL,
  `PuntosBase_Categorias` int(11) NOT NULL DEFAULT 50,
  `Activo_Categorias` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `categorias_equipos`
--

INSERT INTO `categorias_equipos` (`idCategorias`, `Nombres_Categorias`, `PuntosBase_Categorias`, `Activo_Categorias`) VALUES
(1, 'Microondas', 80, 1),
(2, 'Licuadoras', 40, 1),
(3, 'Batidoras', 30, 1),
(4, 'Procesadoras de alimentos', 50, 1),
(5, 'Cafeteras', 40, 1),
(6, 'Tostadoras', 30, 1),
(7, 'Sandwicheras', 30, 1),
(8, 'Hornitos electricos', 50, 1),
(9, 'Pavas electricas', 30, 1),
(10, 'Extractores de jugo', 40, 1),
(11, 'Calefactores y estufas', 100, 1),
(12, 'Televisores', 160, 1),
(13, 'Parlantes y barras de sonido', 80, 1),
(14, 'Reproductores de video', 60, 1),
(15, 'Consolas de videojuegos', 120, 1),
(16, 'Secadores de pelo', 30, 1),
(17, 'Planchitas', 25, 1),
(18, 'Rizadores', 20, 1),
(19, 'Computadoras de escritorio', 200, 1),
(20, 'Notebooks', 180, 1),
(21, 'Laptops', 160, 1),
(22, 'Tablets', 100, 1),
(23, 'Teclados', 20, 1),
(24, 'Mouse', 15, 1),
(25, 'Scanners', 40, 1),
(26, 'Microfonos', 40, 1),
(27, 'Camaras web', 30, 1),
(28, 'Monitores', 120, 1),
(29, 'Impresoras', 80, 1),
(30, 'Auriculares', 40, 1),
(31, 'Estabilizadores y UPS', 60, 1),
(32, 'Joysticks y mandos', 30, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `credenciales_institucion`
--

CREATE TABLE `credenciales_institucion` (
  `id_Institucion` int(11) NOT NULL,
  `NroLegajo_Institucion` varchar(45) NOT NULL,
  `Tipo_Institucion` tinyint(2) NOT NULL,
  `Contacto_Institucion` varchar(45) NOT NULL,
  `RegistroTitulo_Institucion` varchar(45) NOT NULL,
  `clientes_Institucion` int(11) NOT NULL,
  `estados_Institucion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `credenciales_tecnico`
--

CREATE TABLE `credenciales_tecnico` (
  `id_Credenciales` int(11) NOT NULL,
  `Certificado_Tecnico` varchar(255) NOT NULL,
  `clientes_Tecnico` int(11) NOT NULL,
  `estados_Tecnico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `idEquipos` int(11) NOT NULL,
  `idClientes_Equipos` int(11) NOT NULL,
  `idCategorias_Equipos` int(11) NOT NULL,
  `Marca_Equipos` varchar(50) NOT NULL,
  `Modelo_Equipos` varchar(100) DEFAULT NULL,
  `idEstados_Equipos` int(11) NOT NULL,
  `Cantidad_Equipos` int(11) NOT NULL,
  `Descripcion_Equipos` varchar(255) DEFAULT NULL,
  `Fotos_Equipos` text DEFAULT NULL,
  `PesoKG_Equipos` double NOT NULL,
  `DimencionesCM_Equipos` varchar(20) DEFAULT NULL,
  `Accesorios_Equipos` varchar(100) DEFAULT NULL,
  `FechaIngreso_Equipos` datetime DEFAULT NULL,
  `ImagenPrincipal_Equipos` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `equipos`
--

INSERT INTO `equipos` (`idEquipos`, `idClientes_Equipos`, `idCategorias_Equipos`, `Marca_Equipos`, `Modelo_Equipos`, `idEstados_Equipos`, `Cantidad_Equipos`, `Descripcion_Equipos`, `Fotos_Equipos`, `PesoKG_Equipos`, `DimencionesCM_Equipos`, `Accesorios_Equipos`, `FechaIngreso_Equipos`, `ImagenPrincipal_Equipos`) VALUES
(1, 1, 21, 'Dell', 'G15 5525', 1, 1, 'Laptop Dell g15 5525 ryzen 5 6600h - rtx 3050', '[]', 2.52, '27x370x260', 'Cargador', '2025-09-18 01:43:09', NULL),
(3, 2, 29, 'Kodak', '', 2, 1, '', '[]', 6, '', '', '2025-09-18 05:07:32', NULL),
(4, 1, 30, 'JBL', '', 4, 1, '', '[]', 0.7, '', '', '2025-09-18 21:58:55', NULL),
(5, 1, 31, 'Forza', 'Xa 02', 2, 1, '', '[]', 10, '', '', '2025-09-24 01:03:26', NULL),
(10, 1, 27, 'Logitech', '', 3, 1, '', '[{\"filename\":\"1759418056_66d7628a8c8bd63ec216.jpg\",\"original_name\":\"equipment_0.jpg\",\"path\":\"uploads\\/equipment\\/1759418056_66d7628a8c8bd63ec216.jpg\",\"size\":573714,\"type\":\"image\\/jpeg\"}]', 2.5, '', '', '2025-10-02 15:14:16', NULL),
(11, 1, 29, 'HP', '', 4, 1, '', '[{\"filename\":\"1759418476_23b46f3778a4e3394f1b.jpg\",\"original_name\":\"equipment_0.jpg\",\"path\":\"uploads\\/equipment\\/1759418476_23b46f3778a4e3394f1b.jpg\",\"size\":966156,\"type\":\"image\\/jpeg\"}]', 6, '', '', '2025-10-02 15:21:16', NULL),
(12, 1, 23, 'RedDragon', '', 2, 1, '', '[{\"filename\":\"1759418796_4605fd9b68cb3994099f.jpg\",\"original_name\":\"equipment_0.jpg\",\"path\":\"uploads\\/equipment\\/1759418796_4605fd9b68cb3994099f.jpg\",\"size\":963707,\"type\":\"image\\/jpeg\"}]', 7, '', '', '2025-10-02 15:26:36', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `idEstados` int(11) NOT NULL,
  `Nombres_Estados` varchar(50) NOT NULL,
  `MultiplicadorPuntos_Estados` decimal(3,2) DEFAULT 1.00,
  `Activo_Estados` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`idEstados`, `Nombres_Estados`, `MultiplicadorPuntos_Estados`, `Activo_Estados`) VALUES
(1, 'Funcional', 1.00, 1),
(2, 'Parcialmente funcional', 0.70, 1),
(3, 'No funcional', 0.20, 1),
(4, 'Para repuestos', 0.40, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_puntos`
--

CREATE TABLE `historial_puntos` (
  `idHistorialPuntos` int(11) NOT NULL,
  `PuntosInicial_Puntos` int(11) DEFAULT NULL,
  `PuntosCambiados_Puntos` int(11) DEFAULT NULL,
  `PuntosTotales_Puntos` int(11) DEFAULT NULL,
  `equipos_idEquipos` int(11) NOT NULL,
  `usuarios_idUsuarios` int(11) NOT NULL,
  `Estado_Puntos` tinyint(4) DEFAULT NULL,
  `FechaMovimiento_Puntos` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `historial_puntos`
--

INSERT INTO `historial_puntos` (`idHistorialPuntos`, `PuntosInicial_Puntos`, `PuntosCambiados_Puntos`, `PuntosTotales_Puntos`, `equipos_idEquipos`, `usuarios_idUsuarios`, `Estado_Puntos`, `FechaMovimiento_Puntos`) VALUES
(1, 0, 190, 190, 1, 1, 1, '2025-09-18 01:43:09'),
(2, 0, 95, 95, 3, 2, 1, '2025-09-18 05:07:32'),
(3, 190, 30, 220, 4, 1, 1, '2025-09-18 21:58:55'),
(4, 220, 81, 301, 5, 1, 1, '2025-09-24 01:03:26'),
(5, 301, 22, 323, 10, 1, 1, '2025-10-02 15:14:16'),
(6, 323, 75, 398, 11, 1, 1, '2025-10-02 15:21:16'),
(7, 398, 46, 444, 12, 1, 1, '2025-10-02 15:26:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `idPublicacion` int(11) NOT NULL,
  `Titulo_Publicacion` varchar(100) DEFAULT NULL,
  `Descripcion_Publicacion` varchar(255) NOT NULL,
  `Puntos_Publicacion` int(11) NOT NULL,
  `Fecha_Publicacion` datetime NOT NULL,
  `clientes_Publicacion` int(11) NOT NULL,
  `estados_Publicacion` int(11) NOT NULL,
  `equipos_Publicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `publicacion`
--

INSERT INTO `publicacion` (`idPublicacion`, `Titulo_Publicacion`, `Descripcion_Publicacion`, `Puntos_Publicacion`, `Fecha_Publicacion`, `clientes_Publicacion`, `estados_Publicacion`, `equipos_Publicacion`) VALUES
(1, NULL, 'Laptop Dell g15 5525 ryzen 5 6600h - rtx 3050', 190, '2025-09-18 01:43:09', 1, 1, 1),
(2, NULL, '', 95, '2025-09-18 05:07:32', 2, 1, 3),
(3, NULL, '', 30, '2025-09-18 21:58:55', 1, 1, 4),
(4, NULL, '', 81, '2025-09-24 01:03:26', 1, 1, 5),
(8, 'Logitech', '', 22, '2025-10-02 15:14:16', 1, 3, 10),
(9, 'HP', '', 75, '2025-10-02 15:21:16', 1, 4, 11),
(10, 'RedDragon', '', 46, '2025-10-02 15:26:36', 1, 2, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `idRoles` int(11) NOT NULL,
  `Descripcion_Roles` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`idRoles`, `Descripcion_Roles`) VALUES
(1, 'cuidadano'),
(2, 'institucion'),
(3, 'tecnico'),
(4, 'administrador'),
(5, 'recepcion');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `idUbicaciones` int(11) NOT NULL,
  `Direccion_Ubicaciones` varchar(255) DEFAULT NULL,
  `NroCalle_Ubicaciones` varchar(10) DEFAULT NULL,
  `Provincia_Ubicaciones` varchar(50) DEFAULT NULL,
  `Municipios_Ubicaciones` varchar(50) DEFAULT NULL,
  `Latitud_Ubicaciones` decimal(10,8) DEFAULT NULL,
  `Longitud_Ubicaciones` decimal(10,8) DEFAULT NULL,
  `Estado_Ubicaciones` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`idUbicaciones`, `Direccion_Ubicaciones`, `NroCalle_Ubicaciones`, `Provincia_Ubicaciones`, `Municipios_Ubicaciones`, `Latitud_Ubicaciones`, `Longitud_Ubicaciones`, `Estado_Ubicaciones`) VALUES
(1, 'Los Andes', '3937', 'Misiones', 'Posadas', -27.36666700, -55.89694400, 0),
(2, 'EcoPunto Itaembe Guazu', NULL, 'Misiones', 'Posadas', -27.40819600, -55.98441700, 1),
(3, 'EcoPunto Itaembe Mini­', NULL, 'Misiones', 'Posadas', -27.41457000, -55.95591100, 1),
(4, 'EcoPunto Barrio Los Alamos', NULL, 'Misiones', 'Posadas', -27.41469100, -55.93046200, 1),
(5, 'EcoPunto Dolores Sur', NULL, 'Misiones', 'Posadas', -27.43339000, -55.91475500, 1),
(6, 'EcoPunto Av. Martin Fierro & Av. Aguado', NULL, 'Misiones', 'Posadas', -27.38124300, -55.92630900, 1),
(7, 'EcoPunto Parque Sarmiento', NULL, 'Misiones', 'Posadas', -27.36610100, -55.94511700, 1),
(8, 'EcoPunto Av. Urquiza', NULL, 'Misiones', 'Posadas', -27.36018800, -55.91542800, 1),
(9, 'EcoPunto Feria Puente Chacabuco', NULL, 'Misiones', 'Posadas', -27.37031600, -55.88513200, 1),
(10, 'EcoPunto Cascada Artificial', NULL, 'Misiones', 'Posadas', -27.38262500, -55.88797600, 1),
(11, 'EcoPunto Avenida Juan Domingo Peron & America Latina', NULL, 'Misiones', 'Posadas', -27.43065400, -55.88328100, 1),
(22, 'Test Address 4', '', 'Misiones', 'Obera', -27.34756700, -55.86084400, 0),
(23, 'Test Address 5', '', 'Misiones', 'Posadas', -27.37896700, -55.85894400, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones_recoleccion`
--

CREATE TABLE `ubicaciones_recoleccion` (
  `idUbicaciones_Recoleccion` int(11) NOT NULL,
  `ubicaciones_Recoleccion` int(11) NOT NULL,
  `publicacion_Recoleccion` int(11) NOT NULL,
  `FechaMovimiento_Recoleccion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ubicaciones_recoleccion`
--

INSERT INTO `ubicaciones_recoleccion` (`idUbicaciones_Recoleccion`, `ubicaciones_Recoleccion`, `publicacion_Recoleccion`, `FechaMovimiento_Recoleccion`) VALUES
(1, 2, 1, '2025-09-18 01:43:09'),
(2, 3, 2, '2025-09-18 05:07:32'),
(3, 4, 3, '2025-09-18 21:58:55'),
(4, 5, 4, '2025-09-24 01:03:26'),
(6, 4, 8, '2025-10-02 15:14:16'),
(7, 4, 9, '2025-10-02 15:21:16'),
(8, 4, 10, '2025-10-02 15:26:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuarios` int(11) NOT NULL,
  `DNI_Usuarios` varchar(10) NOT NULL,
  `Nombres_Usuarios` varchar(50) NOT NULL,
  `Apellidos_Usuarios` varchar(50) NOT NULL,
  `Password_Usuarios` varchar(255) NOT NULL,
  `Telefono_Usuarios` varchar(14) NOT NULL,
  `Email_Usuarios` varchar(100) NOT NULL,
  `Roles_Usuarios` int(11) NOT NULL,
  `Puntos_Usuarios` int(11) NOT NULL,
  `ImagenPerfil_Usuarios` varchar(255) DEFAULT NULL,
  `FechaRegistro_Usuarios` datetime DEFAULT current_timestamp(),
  `Activo_Usuarios` tinyint(4) DEFAULT 1,
  `ubicaciones_Usuarios` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuarios`, `DNI_Usuarios`, `Nombres_Usuarios`, `Apellidos_Usuarios`, `Password_Usuarios`, `Telefono_Usuarios`, `Email_Usuarios`, `Roles_Usuarios`, `Puntos_Usuarios`, `ImagenPerfil_Usuarios`, `FechaRegistro_Usuarios`, `Activo_Usuarios`, `ubicaciones_Usuarios`) VALUES
(1, '45026308', 'Maximo Jesus', 'Rios', '$2y$10$58zloM57FHLVmhu/SrXdku4Yn/9KAeIKsA2I8KSXOfjqk0vYSuJcS', '3765102868', 'maximuz_ty@hotmail.com', 4, 444, 'perfil4animal.png', '2025-09-17 19:56:08', 1, 1),
(2, '45053541', 'Uruga ', 'Azul', '$2y$10$Atr0OEnRw2rXHZENeaVdvupO2OVlPHpWFyIYL6sGxNrsd3ChXu0z2', '3764367492', 'themagichest@gmail.com', 5, 95, 'perfil1flores.png', '2025-09-18 01:48:39', 1, 2),
(8, '22222222', 'Test4', 'User4', '$2y$10$6w/GhUrbik7gz6poedCW0u6vzUQ6f1lkOiUgjjijgdu.kdiFB1zx.', '2222222222', 'test4@test.com', 1, 0, 'perfil1animal.png', '2025-10-01 16:20:55', 1, 22),
(9, '33333333', 'Test5', 'User5', '$2y$10$PDapkRu8NYpDAjxswtaIJOh8NsHTFwMhxs1DCvNuz7OFca1zUdWES', '3333333333', 'test5@test.com', 1, 0, 'perfil4flores.png', '2025-10-01 16:28:08', 1, 23);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito_compras`
--
ALTER TABLE `carrito_compras`
  ADD PRIMARY KEY (`idCarrito_Compras`),
  ADD KEY `fk_carrito_compras_usuarios1_idx` (`usuarios_Carrito`),
  ADD KEY `fk_carrito_compras_equipos1_idx` (`equipos_Carrito`),
  ADD KEY `fk_carrito_compras_publicacion1_idx` (`publicacion_Carrito`),
  ADD KEY `idx_carrito_activo` (`Activo_Carrito`),
  ADD KEY `idx_carrito_fecha` (`FechaAgregado_Carrito`);

--
-- Indices de la tabla `categorias_equipos`
--
ALTER TABLE `categorias_equipos`
  ADD PRIMARY KEY (`idCategorias`),
  ADD UNIQUE KEY `Nombres_Categorias` (`Nombres_Categorias`),
  ADD KEY `idx_categorias_puntos` (`PuntosBase_Categorias`),
  ADD KEY `idx_categorias_activo` (`Activo_Categorias`);

--
-- Indices de la tabla `credenciales_institucion`
--
ALTER TABLE `credenciales_institucion`
  ADD PRIMARY KEY (`id_Institucion`),
  ADD KEY `fk_Institucion_clientes1_idx` (`clientes_Institucion`),
  ADD KEY `fk_credenciales_institucion_estados1_idx` (`estados_Institucion`);

--
-- Indices de la tabla `credenciales_tecnico`
--
ALTER TABLE `credenciales_tecnico`
  ADD PRIMARY KEY (`id_Credenciales`),
  ADD KEY `fk_Credenciales_Tecnico_clientes1_idx` (`clientes_Tecnico`),
  ADD KEY `fk_credenciales_tecnico_estados1_idx` (`estados_Tecnico`);

--
-- Indices de la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`idEquipos`),
  ADD KEY `idx_equipos_cliente` (`idClientes_Equipos`),
  ADD KEY `idx_equipos_fecha_ingreso` (`FechaIngreso_Equipos`),
  ADD KEY `idx_equipos_categoria` (`idCategorias_Equipos`),
  ADD KEY `fk_equipos_estados1_idx` (`idEstados_Equipos`),
  ADD KEY `idx_equipos_imagen` (`ImagenPrincipal_Equipos`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`idEstados`),
  ADD KEY `idx_estados_multiplicador` (`MultiplicadorPuntos_Estados`),
  ADD KEY `idx_estados_activo` (`Activo_Estados`);

--
-- Indices de la tabla `historial_puntos`
--
ALTER TABLE `historial_puntos`
  ADD PRIMARY KEY (`idHistorialPuntos`),
  ADD KEY `fk_Puntos_equipos1_idx` (`equipos_idEquipos`),
  ADD KEY `fk_Puntos_usuarios1_idx` (`usuarios_idUsuarios`),
  ADD KEY `idx_historial_fecha` (`FechaMovimiento_Puntos`),
  ADD KEY `idx_historial_estado` (`Estado_Puntos`);

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`idPublicacion`),
  ADD KEY `fk_Publicacion_clientes1_idx` (`clientes_Publicacion`),
  ADD KEY `fk_Publicacion_estados1_idx` (`estados_Publicacion`),
  ADD KEY `fk_Publicacion_equipos1_idx` (`equipos_Publicacion`),
  ADD KEY `idx_publicacion_titulo` (`Titulo_Publicacion`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`idRoles`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`idUbicaciones`),
  ADD KEY `idx_ubicaciones_coordenadas` (`Latitud_Ubicaciones`,`Longitud_Ubicaciones`);

--
-- Indices de la tabla `ubicaciones_recoleccion`
--
ALTER TABLE `ubicaciones_recoleccion`
  ADD PRIMARY KEY (`idUbicaciones_Recoleccion`),
  ADD KEY `fk_ubicaciones_recoleccion_ubicaciones1_idx` (`ubicaciones_Recoleccion`),
  ADD KEY `fk_ubicaciones_recoleccion_publicacion1_idx` (`publicacion_Recoleccion`),
  ADD KEY `idx_ubicaciones_recoleccion_fecha` (`FechaMovimiento_Recoleccion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuarios`),
  ADD KEY `idx_clientes_documento` (`DNI_Usuarios`),
  ADD KEY `idx_clientes_telefono` (`Telefono_Usuarios`),
  ADD KEY `idx_clientes_email` (`Email_Usuarios`),
  ADD KEY `fk_clientes_roles1_idx` (`Roles_Usuarios`),
  ADD KEY `fk_usuarios_ubicaciones1_idx` (`ubicaciones_Usuarios`),
  ADD KEY `idx_usuarios_ubicacion` (`ubicaciones_Usuarios`),
  ADD KEY `idx_usuarios_activo` (`Activo_Usuarios`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito_compras`
--
ALTER TABLE `carrito_compras`
  MODIFY `idCarrito_Compras` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_equipos`
--
ALTER TABLE `categorias_equipos`
  MODIFY `idCategorias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `credenciales_institucion`
--
ALTER TABLE `credenciales_institucion`
  MODIFY `id_Institucion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `credenciales_tecnico`
--
ALTER TABLE `credenciales_tecnico`
  MODIFY `id_Credenciales` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipos`
--
ALTER TABLE `equipos`
  MODIFY `idEquipos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `idEstados` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `historial_puntos`
--
ALTER TABLE `historial_puntos`
  MODIFY `idHistorialPuntos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `idPublicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `idRoles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `idUbicaciones` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `ubicaciones_recoleccion`
--
ALTER TABLE `ubicaciones_recoleccion`
  MODIFY `idUbicaciones_Recoleccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito_compras`
--
ALTER TABLE `carrito_compras`
  ADD CONSTRAINT `fk_carrito_compras_equipos1` FOREIGN KEY (`equipos_Carrito`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_carrito_compras_publicacion1` FOREIGN KEY (`publicacion_Carrito`) REFERENCES `publicacion` (`idPublicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_carrito_compras_usuarios1` FOREIGN KEY (`usuarios_Carrito`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `credenciales_institucion`
--
ALTER TABLE `credenciales_institucion`
  ADD CONSTRAINT `fk_Institucion_clientes1` FOREIGN KEY (`clientes_Institucion`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_credenciales_institucion_estados1` FOREIGN KEY (`estados_Institucion`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `credenciales_tecnico`
--
ALTER TABLE `credenciales_tecnico`
  ADD CONSTRAINT `fk_Credenciales_Tecnico_clientes1` FOREIGN KEY (`clientes_Tecnico`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_credenciales_tecnico_estados1` FOREIGN KEY (`estados_Tecnico`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD CONSTRAINT `fk_equipos_categorias1` FOREIGN KEY (`idCategorias_Equipos`) REFERENCES `categorias_equipos` (`idCategorias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_equipos_clientes1` FOREIGN KEY (`idClientes_Equipos`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_equipos_estados1` FOREIGN KEY (`idEstados_Equipos`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `historial_puntos`
--
ALTER TABLE `historial_puntos`
  ADD CONSTRAINT `fk_Puntos_equipos1` FOREIGN KEY (`equipos_idEquipos`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Puntos_usuarios1` FOREIGN KEY (`usuarios_idUsuarios`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD CONSTRAINT `fk_Publicacion_clientes1` FOREIGN KEY (`clientes_Publicacion`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Publicacion_equipos1` FOREIGN KEY (`equipos_Publicacion`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Publicacion_estados1` FOREIGN KEY (`estados_Publicacion`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `ubicaciones_recoleccion`
--
ALTER TABLE `ubicaciones_recoleccion`
  ADD CONSTRAINT `fk_ubicaciones_recoleccion_publicacion1` FOREIGN KEY (`publicacion_Recoleccion`) REFERENCES `publicacion` (`idPublicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_ubicaciones_recoleccion_ubicaciones1` FOREIGN KEY (`ubicaciones_Recoleccion`) REFERENCES `ubicaciones` (`idUbicaciones`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_clientes_roles1` FOREIGN KEY (`Roles_Usuarios`) REFERENCES `roles` (`idRoles`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_usuarios_ubicaciones1` FOREIGN KEY (`ubicaciones_Usuarios`) REFERENCES `ubicaciones` (`idUbicaciones`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
