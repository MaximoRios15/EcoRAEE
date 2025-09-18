-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-09-2025 a las 04:02:59
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
-- Estructura de tabla para la tabla `categorias_equipos`
--

CREATE TABLE `categorias_equipos` (
  `idCategorias` int(11) NOT NULL,
  `Nombres_Categorias` varchar(50) NOT NULL,
  `Activo_Categorias` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `categorias_equipos`
--

INSERT INTO `categorias_equipos` (`idCategorias`, `Nombres_Categorias`, `Activo_Categorias`) VALUES
(1, 'Microondas', 1),
(2, 'Licuadoras', 1),
(3, 'Batidoras', 1),
(4, 'Procesadoras de alimentos', 1),
(5, 'Cafeteras', 1),
(6, 'Tostadoras', 1),
(7, 'Sandwicheras', 1),
(8, 'Hornitos electricos', 1),
(9, 'Pavas electricas', 1),
(10, 'Extractores de jugo', 1),
(11, 'Calefactores y estufas', 1),
(12, 'Televisores', 1),
(13, 'Parlantes y barras de sonido', 1),
(14, 'Reproductores de video', 1),
(15, 'Consolas de videojuegos', 1),
(16, 'Secadores de pelo', 1),
(17, 'Planchitas', 1),
(18, 'Rizadores', 1),
(19, 'Computadoras de escritorio', 1),
(20, 'Notebooks', 1),
(21, 'Laptops', 1),
(22, 'Tablets', 1),
(23, 'Teclados', 1),
(24, 'Mouse', 1),
(25, 'Scanners', 1),
(26, 'Microfonos', 1),
(27, 'Camaras web', 1),
(28, 'Monitores', 1),
(29, 'Impresoras', 1),
(30, 'Auriculares', 1),
(31, 'Estabilizadores y UPS', 1),
(32, 'Joysticks y mandos', 1);

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
  `Modelo_Equipos` varchar(100) NOT NULL,
  `idEstados_Equipos` int(11) NOT NULL,
  `Cantidad_Equipos` int(11) NOT NULL,
  `Descripcion_Equipos` varchar(255) DEFAULT NULL,
  `Fotos_Equipos` varchar(255) DEFAULT NULL,
  `PesoKG_Equipos` double NOT NULL,
  `DimencionesCM_Equipos` varchar(20) NOT NULL,
  `FechaIngreso_Equipos` datetime DEFAULT NULL,
  `Accesorios_Equipos` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `equipos`
--

INSERT INTO `equipos` (`idEquipos`, `idClientes_Equipos`, `idCategorias_Equipos`, `Marca_Equipos`, `Modelo_Equipos`, `idEstados_Equipos`, `Cantidad_Equipos`, `Descripcion_Equipos`, `Fotos_Equipos`, `PesoKG_Equipos`, `DimencionesCM_Equipos`, `FechaIngreso_Equipos`, `Accesorios_Equipos`) VALUES
(1, 3, 21, 'Dell', 'G15 5525', 1, 1, 'Laptop Dell g15 5525 ryzen 5 6600h - rtx 3050', '[]', 2.52, '27x370x260', '2025-09-18 01:43:09', 'Cargador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `idEstados` int(11) NOT NULL,
  `Descripcion_Estados` varchar(50) NOT NULL,
  `Activo_Estados` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`idEstados`, `Descripcion_Estados`, `Activo_Estados`) VALUES
(1, 'Funcional', 1),
(2, 'Parcialmente funcional', 1),
(3, 'No funcional', 1),
(4, 'Para repuestos', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_recoleccion`
--

CREATE TABLE `movimiento_recoleccion` (
  `id_Movimiento_Recoleccion` int(11) NOT NULL,
  `Fecha_Asignacion_Datetime` datetime NOT NULL,
  `Fecha_Retiro_Movimiento` datetime NOT NULL,
  `Publicacion_id_Publicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `id_Publicacion` int(11) NOT NULL,
  `Descripcion_Publicacion` varchar(255) NOT NULL,
  `Puntos_Publicacion` int(11) NOT NULL,
  `Fecha_Publicacion` datetime NOT NULL,
  `clientes_idClientes` int(11) NOT NULL,
  `estados_idEstados` int(11) NOT NULL,
  `equipos_idEquipos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `publicacion`
--

INSERT INTO `publicacion` (`id_Publicacion`, `Descripcion_Publicacion`, `Puntos_Publicacion`, `Fecha_Publicacion`, `clientes_idClientes`, `estados_idEstados`, `equipos_idEquipos`) VALUES
(1, 'Laptop Dell g15 5525 ryzen 5 6600h - rtx 3050', 190, '2025-09-18 01:43:09', 3, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_recoleccion`
--

CREATE TABLE `punto_recoleccion` (
  `id_Punto_Recoleccion` int(11) NOT NULL,
  `Direccion_Punto` varchar(150) NOT NULL,
  `Nombre_Recoleccion` varchar(45) NOT NULL,
  `Movimiento_Recoleccion_id_Movimiento_Recoleccion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva_producto`
--

CREATE TABLE `reserva_producto` (
  `idReserva_producto` int(11) NOT NULL,
  `Fecha_Reserva` datetime DEFAULT NULL,
  `clientes_idClientes` int(11) NOT NULL,
  `equipos_idEquipos` int(11) NOT NULL,
  `estados_idEstados` int(11) NOT NULL,
  `Publicacion_id_Publicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
(3, 'tecnico');

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
  `Provincia_Usuarios` varchar(45) NOT NULL,
  `Municipios_Usuarios` varchar(45) NOT NULL,
  `Roles_Usuarios` int(11) NOT NULL,
  `Puntos_Usuarios` int(11) DEFAULT NULL,
  `FechaRegistro_Usuarios` datetime DEFAULT current_timestamp(),
  `Activo_Usuarios` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuarios`, `DNI_Usuarios`, `Nombres_Usuarios`, `Apellidos_Usuarios`, `Password_Usuarios`, `Telefono_Usuarios`, `Email_Usuarios`, `Provincia_Usuarios`, `Municipios_Usuarios`, `Roles_Usuarios`, `Puntos_Usuarios`, `FechaRegistro_Usuarios`, `Activo_Usuarios`) VALUES
(2, '87654321', 'Maria', 'Garcia', '$2y$10$fyhIGWdx1XWSp1AGwe1VpezPYzIHsC7W2pzu4NV/8RlkUMDyMa49S', '0987654321', 'maria.garcia@test.com', 'Misiones', 'Posadas', 1, 0, '2025-09-17 19:35:39', 1),
(3, '45026308', 'Maximo Jesus', 'Rios', '$2y$10$58zloM57FHLVmhu/SrXdku4Yn/9KAeIKsA2I8KSXOfjqk0vYSuJcS', '3765102868', 'maximuz_ty@hotmail.com', 'Misiones', 'Posadas', 1, 190, '2025-09-17 19:56:08', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias_equipos`
--
ALTER TABLE `categorias_equipos`
  ADD PRIMARY KEY (`idCategorias`),
  ADD UNIQUE KEY `Nombres_Categorias` (`Nombres_Categorias`);

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
  ADD KEY `fk_equipos_estados1_idx` (`idEstados_Equipos`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`idEstados`);

--
-- Indices de la tabla `movimiento_recoleccion`
--
ALTER TABLE `movimiento_recoleccion`
  ADD PRIMARY KEY (`id_Movimiento_Recoleccion`),
  ADD KEY `fk_Movimiento_Recoleccion_Publicacion1_idx` (`Publicacion_id_Publicacion`);

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`id_Publicacion`),
  ADD KEY `fk_Publicacion_clientes1_idx` (`clientes_idClientes`),
  ADD KEY `fk_Publicacion_estados1_idx` (`estados_idEstados`),
  ADD KEY `fk_Publicacion_equipos1_idx` (`equipos_idEquipos`);

--
-- Indices de la tabla `punto_recoleccion`
--
ALTER TABLE `punto_recoleccion`
  ADD PRIMARY KEY (`id_Punto_Recoleccion`),
  ADD KEY `fk_Punto_recoleccion_Movimiento_Recoleccion1_idx` (`Movimiento_Recoleccion_id_Movimiento_Recoleccion`);

--
-- Indices de la tabla `reserva_producto`
--
ALTER TABLE `reserva_producto`
  ADD PRIMARY KEY (`idReserva_producto`),
  ADD KEY `fk_Reserva_producto_clientes1_idx` (`clientes_idClientes`),
  ADD KEY `fk_Reserva_producto_equipos1_idx` (`equipos_idEquipos`),
  ADD KEY `fk_Reserva_producto_estados1_idx` (`estados_idEstados`),
  ADD KEY `fk_Reserva_producto_Publicacion1_idx` (`Publicacion_id_Publicacion`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`idRoles`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuarios`),
  ADD KEY `idx_clientes_documento` (`DNI_Usuarios`),
  ADD KEY `idx_clientes_telefono` (`Telefono_Usuarios`),
  ADD KEY `idx_clientes_email` (`Email_Usuarios`),
  ADD KEY `fk_clientes_roles1_idx` (`Roles_Usuarios`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

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
  MODIFY `idEquipos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `idEstados` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `movimiento_recoleccion`
--
ALTER TABLE `movimiento_recoleccion`
  MODIFY `id_Movimiento_Recoleccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `id_Publicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `punto_recoleccion`
--
ALTER TABLE `punto_recoleccion`
  MODIFY `id_Punto_Recoleccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reserva_producto`
--
ALTER TABLE `reserva_producto`
  MODIFY `idReserva_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `idRoles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

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
-- Filtros para la tabla `movimiento_recoleccion`
--
ALTER TABLE `movimiento_recoleccion`
  ADD CONSTRAINT `fk_Movimiento_Recoleccion_Publicacion1` FOREIGN KEY (`Publicacion_id_Publicacion`) REFERENCES `publicacion` (`id_Publicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD CONSTRAINT `fk_Publicacion_clientes1` FOREIGN KEY (`clientes_idClientes`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Publicacion_equipos1` FOREIGN KEY (`equipos_idEquipos`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Publicacion_estados1` FOREIGN KEY (`estados_idEstados`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `punto_recoleccion`
--
ALTER TABLE `punto_recoleccion`
  ADD CONSTRAINT `fk_Punto_recoleccion_Movimiento_Recoleccion1` FOREIGN KEY (`Movimiento_Recoleccion_id_Movimiento_Recoleccion`) REFERENCES `movimiento_recoleccion` (`id_Movimiento_Recoleccion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `reserva_producto`
--
ALTER TABLE `reserva_producto`
  ADD CONSTRAINT `fk_Reserva_producto_Publicacion1` FOREIGN KEY (`Publicacion_id_Publicacion`) REFERENCES `publicacion` (`id_Publicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Reserva_producto_clientes1` FOREIGN KEY (`clientes_idClientes`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Reserva_producto_equipos1` FOREIGN KEY (`equipos_idEquipos`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Reserva_producto_estados1` FOREIGN KEY (`estados_idEstados`) REFERENCES `estados` (`idEstados`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_clientes_roles1` FOREIGN KEY (`Roles_Usuarios`) REFERENCES `roles` (`idRoles`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
