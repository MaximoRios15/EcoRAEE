-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-10-2025 a las 14:36:52
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
-- Estructura de tabla para la tabla `canjes`
--

CREATE TABLE `canjes` (
  `idCanje` int(11) NOT NULL,
  `idUsuarios_Canjeador` int(11) NOT NULL,
  `idEquipos_Canje` int(11) NOT NULL,
  `idPuntoEntrega_Canje` int(11) NOT NULL,
  `PuntosUsados_Canje` int(11) NOT NULL,
  `FechaCanje_Canje` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_equipos`
--

CREATE TABLE `categorias_equipos` (
  `idCategorias` int(11) NOT NULL,
  `Nombres_Categorias` varchar(50) NOT NULL,
  `PuntosBase_Categorias` decimal(6,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `categorias_equipos`
--

INSERT INTO `categorias_equipos` (`idCategorias`, `Nombres_Categorias`, `PuntosBase_Categorias`) VALUES
(1, 'Heladeras', 200.00),
(2, 'Freezers', 200.00),
(3, 'Lavarropas', 180.00),
(4, 'Secarropas', 160.00),
(5, 'Lavavajillas', 160.00),
(6, 'Cocinas electricas', 150.00),
(7, 'Termotanques electricos', 140.00),
(8, 'Calefones electricos', 120.00),
(9, 'Aires acondicionados Ventana', 160.00),
(10, 'Aires acondicionados Splits', 180.00),
(11, 'Calefactores', 100.00),
(12, 'Estufas', 100.00),
(13, 'Microondas', 80.00),
(14, 'Licuadoras', 40.00),
(15, 'Batidoras', 30.00),
(16, 'Procesadoras de alimentos', 50.00),
(17, 'Cafeteras', 40.00),
(18, 'Tostadoras', 30.00),
(19, 'Sandwicheras', 30.00),
(20, 'Hornitos electricos', 50.00),
(21, 'Pavas electricas', 30.00),
(22, 'Extractores de jugo', 40.00),
(23, 'Secadores de pelo', 30.00),
(24, 'Planchitas', 25.00),
(25, 'Rizadores', 20.00),
(26, 'Afeitadoras electricas', 25.00),
(27, 'Depiladoras electricas', 25.00),
(28, 'Cepillos de dientes electricos', 15.00),
(29, 'Lamparas LED', 10.00),
(30, 'Lamparas fluorescentes compactas', 15.00),
(31, 'Tubos fluorescentes', 20.00),
(32, 'Proyectores de luz', 40.00),
(33, 'Farolas o luminarias publicas', 100.00),
(34, 'Televisores', 160.00),
(35, 'Parlantes y barras de sonido', 80.00),
(36, 'Reproductores de video (DVD, Blu-ray)', 60.00),
(37, 'Consolas de videojuegos', 120.00),
(38, 'Juguetes electronicos interactivos', 40.00),
(39, 'Autos electricos para chicos', 100.00),
(40, 'Robots educativos', 60.00),
(41, 'Drones', 80.00),
(42, 'Computadoras de escritorio (PCs)', 200.00),
(43, 'Notebooks', 180.00),
(44, 'Laptops', 160.00),
(45, 'Tablets', 100.00),
(46, 'Monitores', 120.00),
(47, 'Impresoras', 80.00),
(48, 'Escaneres', 40.00),
(49, 'Estabilizadores y UPS', 60.00),
(50, 'Teclados', 20.00),
(51, 'Mouse', 15.00),
(52, 'Microfonos', 40.00),
(53, 'Camaras web', 30.00),
(54, 'Auriculares', 40.00),
(55, 'Joysticks y mandos', 30.00),
(56, 'Telefonos fijos', 40.00),
(57, 'Celulares/Smartphones', 80.00),
(58, 'Routers', 40.00),
(59, 'Modems', 40.00),
(60, 'Switches de red', 50.00),
(61, 'Antenas/repetidores WiFi', 60.00),
(62, 'Taladros electricos', 60.00),
(63, 'Sierras electricas', 70.00),
(64, 'Amoladoras', 70.00),
(65, 'Soldadoras electricas', 100.00),
(66, 'Aspiradoras industriales', 100.00),
(67, 'Hidrolavadoras', 120.00),
(68, 'Compresores electricos', 120.00),
(69, 'Multimetros', 40.00),
(70, 'Termometros digitales', 20.00),
(71, 'Camaras de seguridad', 60.00),
(72, 'Sensores inteligentes', 30.00),
(73, 'Detectores de humo', 25.00),
(74, 'Cargadores', 20.00),
(75, 'Fuentes de poder', 40.00),
(76, 'Paneles solares domesticos', 200.00),
(77, 'Baterias recargables', 30.00),
(78, 'Powerbanks', 25.00),
(79, 'Relojes electricos', 20.00),
(80, 'Timbres electricos', 15.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `idDirecciones` int(11) NOT NULL,
  `Calle_Direcciones` varchar(50) DEFAULT NULL,
  `Numero_Direcciones` varchar(10) DEFAULT NULL,
  `Piso_Direcciones` varchar(10) DEFAULT NULL,
  `Departamento_Direcciones` varchar(10) DEFAULT NULL,
  `Barrio_Direcciones` varchar(50) DEFAULT NULL,
  `Longitud_Ubicaciones` decimal(10,8) DEFAULT NULL,
  `Latitud_Ubicaciones` decimal(10,8) DEFAULT NULL,
  `idMunicipios_Direcciones` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`idDirecciones`, `Calle_Direcciones`, `Numero_Direcciones`, `Piso_Direcciones`, `Departamento_Direcciones`, `Barrio_Direcciones`, `Longitud_Ubicaciones`, `Latitud_Ubicaciones`, `idMunicipios_Direcciones`) VALUES
(1, 'Av. Los Lirios y Las Golondrinas', NULL, NULL, NULL, 'Itaembe Guazu', -55.98441700, -27.40819600, 56),
(2, 'Av. 147 y Av. 170', NULL, NULL, NULL, 'Itaembe Mini', -55.95591100, -27.41457000, 56),
(3, 'Calle Jerusalen y Calle 132', NULL, NULL, NULL, 'Barrio Los Alamos', -55.93046200, -27.41469100, 56),
(4, 'Av. Cocomarola y Calle 180', NULL, NULL, NULL, 'Barrio Dolores Sur', -55.91475500, -27.43339000, 56),
(5, 'Av. Martin Fierro y Av. Aguado', NULL, NULL, NULL, 'Barrio Miguel Lanus', -55.92630900, -27.38124300, 56),
(6, 'Av. Roque Perez y Av. Rademacher (Plaza Sarmiento)', NULL, NULL, NULL, 'Centro', -55.94511700, -27.36610100, 56),
(7, 'Av. Urquiza y San Martin', NULL, NULL, NULL, 'Centro', -55.91542800, -27.36018800, 56),
(8, 'Av. Costanera Oeste y Av. Chacabuco', NULL, NULL, NULL, 'Barrio Yacyreta', -55.88513200, -27.37031600, 56),
(9, 'Av. Costanera Sur', NULL, NULL, NULL, 'Cascada Artificial', -55.88797600, -27.38262500, 56),
(10, 'Av. America Latina y Av. Juan Domingo Peron', NULL, NULL, NULL, 'Miguel Lanus', -55.88328100, -27.43065400, 56),
(13, 'Los andes', '3937', NULL, NULL, 'San Lucas', NULL, NULL, 56),
(22, 'AAAAAAAAAAAAAAAAAAAA', '1111111111', '0', 'AAAAAAAAAA', 'AAAAAAAAAAAAAAAAAAAA', NULL, NULL, 56);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `donaciones`
--

CREATE TABLE `donaciones` (
  `idDonacion` int(11) NOT NULL,
  `idUsuarios_Donante` int(11) NOT NULL,
  `idEquipos_Donacion` int(11) NOT NULL,
  `idPuntoEntrega_Donacion` int(11) NOT NULL,
  `FechaDonacion_Donacion` datetime NOT NULL DEFAULT current_timestamp(),
  `CodigoQR_Donacion` varchar(100) DEFAULT NULL,
  `Estado_Donacion` enum('recibido','publicado','canjeado') NOT NULL DEFAULT 'recibido'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `idEquipos` int(11) NOT NULL,
  `idCategorias_Equipos` int(11) NOT NULL,
  `idMarcas_Equipos` int(11) NOT NULL,
  `Modelo_Equipos` varchar(50) DEFAULT NULL,
  `Descripcion_Equipos` varchar(255) DEFAULT NULL,
  `idEstados_Equipos` int(11) NOT NULL,
  `PesoKG_Equipos` double NOT NULL,
  `DimencionesCM_Equipos` varchar(20) DEFAULT NULL,
  `Accesorios_Equipos` varchar(100) DEFAULT NULL,
  `FechaIngreso_Equipos` datetime DEFAULT NULL,
  `ImagenPrincipal_Equipos` varchar(255) DEFAULT NULL,
  `idUsuarios_Equipos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_equipos`
--

CREATE TABLE `estados_equipos` (
  `idEstadosEquipos` int(11) NOT NULL,
  `Nombres_EstadosEquipos` varchar(50) NOT NULL,
  `MultiplicadorPuntos_EstadosEquipos` decimal(3,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `estados_equipos`
--

INSERT INTO `estados_equipos` (`idEstadosEquipos`, `Nombres_EstadosEquipos`, `MultiplicadorPuntos_EstadosEquipos`) VALUES
(1, 'Funcional', 1.00),
(2, 'Parcialmente funcional', 0.70),
(3, 'No funcional', 0.20),
(4, 'Para repuestos', 0.40);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos_equipos`
--

CREATE TABLE `fotos_equipos` (
  `idFotosEquipos` int(11) NOT NULL,
  `URL_FotosEquipos` varchar(255) DEFAULT NULL,
  `idEquipos_FotosEquipos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_movimientos`
--

CREATE TABLE `historial_movimientos` (
  `idHistorialMov` int(11) NOT NULL,
  `idUsuarios_Historial` int(11) NOT NULL,
  `PuntosInicial_Historial` int(11) NOT NULL,
  `PuntosCambiados_Historial` int(11) NOT NULL,
  `PuntosTotales_Historial` int(11) NOT NULL,
  `TipoMovimiento_Historial` enum('donacion','canje') NOT NULL,
  `FechaMovimiento_Historial` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas_equipos`
--

CREATE TABLE `marcas_equipos` (
  `idMarcas` int(11) NOT NULL,
  `idCategorias_Marcas` int(11) NOT NULL,
  `Nombres_Marcas` varchar(50) NOT NULL,
  `PuntosBase_Marcas` decimal(6,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `marcas_equipos`
--

INSERT INTO `marcas_equipos` (`idMarcas`, `idCategorias_Marcas`, `Nombres_Marcas`, `PuntosBase_Marcas`) VALUES
(1, 1, 'Whirlpool', 200.00),
(2, 1, 'LG', 195.00),
(3, 1, 'Samsung', 190.00),
(4, 1, 'Electrolux', 185.00),
(5, 1, 'Bosch', 180.00),
(6, 1, 'GE', 175.00),
(7, 1, 'Midea', 170.00),
(8, 1, 'Philco', 165.00),
(9, 1, 'Patrick', 160.00),
(10, 1, 'BGH', 155.00),
(11, 2, 'Whirlpool', 200.00),
(12, 2, 'Gafa', 195.00),
(13, 2, 'Patrick', 190.00),
(14, 2, 'Electrolux', 185.00),
(15, 2, 'Philco', 180.00),
(16, 2, 'BGH', 175.00),
(17, 3, 'Whirlpool', 180.00),
(18, 3, 'LG', 175.00),
(19, 3, 'Samsung', 170.00),
(20, 3, 'Drean', 165.00),
(21, 3, 'Electrolux', 160.00),
(22, 3, 'Bosch', 155.00),
(23, 3, 'BGH', 150.00),
(24, 4, 'Drean', 160.00),
(25, 4, 'Whirlpool', 155.00),
(26, 4, 'Electrolux', 150.00),
(27, 4, 'BGH', 145.00),
(28, 4, 'Philco', 140.00),
(29, 5, 'Bosch', 160.00),
(30, 5, 'Whirlpool', 155.00),
(31, 5, 'Electrolux', 150.00),
(32, 5, 'LG', 145.00),
(33, 5, 'Samsung', 140.00),
(34, 5, 'Siemens', 135.00),
(35, 6, 'Longvie', 150.00),
(36, 6, 'Whirlpool', 145.00),
(37, 6, 'Patrick', 140.00),
(38, 6, 'Tromen', 135.00),
(39, 6, 'Orbis', 130.00),
(40, 6, 'Ariston', 125.00),
(41, 7, 'Rheem', 140.00),
(42, 7, 'Longvie', 135.00),
(43, 7, 'Saiar', 130.00),
(44, 7, 'Ecotermo', 125.00),
(45, 7, 'Se??orial', 120.00),
(46, 8, 'Longvie', 120.00),
(47, 8, 'Rheem', 115.00),
(48, 8, 'Ecotermo', 110.00),
(49, 8, 'Se??orial', 105.00),
(50, 8, 'Orbis', 100.00),
(51, 9, 'Surrey', 160.00),
(52, 9, 'BGH', 155.00),
(53, 9, 'Philco', 150.00),
(54, 9, 'Electrolux', 145.00),
(55, 9, 'Samsung', 140.00),
(56, 9, 'LG', 135.00),
(57, 10, 'LG', 180.00),
(58, 10, 'Samsung', 175.00),
(59, 10, 'Electrolux', 170.00),
(60, 10, 'Daikin', 165.00),
(61, 10, 'Carrier', 160.00),
(62, 10, 'BGH', 155.00),
(63, 10, 'Philco', 150.00),
(64, 11, 'Longvie', 100.00),
(65, 11, 'Orbis', 95.00),
(66, 11, 'Eskabe', 90.00),
(67, 11, 'Volcan', 85.00),
(68, 11, 'Peabody', 80.00),
(69, 11, 'Philco', 75.00),
(70, 12, 'Eskabe', 100.00),
(71, 12, 'Longvie', 95.00),
(72, 12, 'Peabody', 90.00),
(73, 12, 'Volcan', 85.00),
(74, 12, 'Philco', 80.00),
(75, 12, 'Atma', 75.00),
(76, 13, 'Samsung', 80.00),
(77, 13, 'LG', 75.00),
(78, 13, 'Panasonic', 70.00),
(79, 13, 'Whirlpool', 65.00),
(80, 13, 'Philco', 60.00),
(81, 13, 'BGH', 55.00),
(82, 13, 'Daewoo', 50.00),
(83, 13, 'Peabody', 45.00),
(84, 14, 'Oster', 40.00),
(85, 14, 'Philips', 35.00),
(86, 14, 'Peabody', 30.00),
(87, 14, 'Atma', 25.00),
(88, 14, 'Liliana', 20.00),
(89, 14, 'Moulinex', 15.00),
(90, 14, 'Black+Decker', 10.00),
(91, 14, 'Hamilton Beach', 5.00),
(92, 15, 'Philips', 30.00),
(93, 15, 'Peabody', 25.00),
(94, 15, 'Atma', 20.00),
(95, 15, 'Liliana', 15.00),
(96, 15, 'Oster', 10.00),
(97, 15, 'Moulinex', 5.00),
(98, 16, 'Philips', 50.00),
(99, 16, 'Peabody', 45.00),
(100, 16, 'Atma', 40.00),
(101, 16, 'Moulinex', 35.00),
(102, 16, 'Oster', 30.00),
(103, 16, 'Black+Decker', 25.00),
(104, 17, 'Philips', 40.00),
(105, 17, 'Nespresso', 35.00),
(106, 17, 'Oster', 30.00),
(107, 17, 'Peabody', 25.00),
(108, 17, 'Atma', 20.00),
(109, 17, 'Electrolux', 15.00),
(110, 17, 'DeLonghi', 10.00),
(111, 18, 'Philips', 30.00),
(112, 18, 'Peabody', 25.00),
(113, 18, 'Atma', 20.00),
(114, 18, 'Liliana', 15.00),
(115, 18, 'Oster', 10.00),
(116, 18, 'Electrolux', 5.00),
(117, 19, 'Philips', 30.00),
(118, 19, 'Peabody', 25.00),
(119, 19, 'Atma', 20.00),
(120, 19, 'Liliana', 15.00),
(121, 19, 'Oster', 10.00),
(122, 20, 'Peabody', 50.00),
(123, 20, 'Atma', 45.00),
(124, 20, 'Liliana', 40.00),
(125, 20, 'Philips', 35.00),
(126, 20, 'Oster', 30.00),
(127, 21, 'Peabody', 30.00),
(128, 21, 'Atma', 25.00),
(129, 21, 'Liliana', 20.00),
(130, 21, 'Philips', 15.00),
(131, 21, 'Electrolux', 10.00),
(132, 21, 'Oster', 5.00),
(133, 22, 'Philips', 40.00),
(134, 22, 'Peabody', 35.00),
(135, 22, 'Oster', 30.00),
(136, 22, 'Moulinex', 25.00),
(137, 22, 'Liliana', 20.00),
(138, 22, 'Hamilton Beach', 15.00),
(139, 23, 'Philips', 30.00),
(140, 23, 'Remington', 25.00),
(141, 23, 'Gama Italy', 20.00),
(142, 23, 'Babyliss', 15.00),
(143, 23, 'Peabody', 10.00),
(144, 23, 'Atma', 5.00),
(145, 24, 'Gama Italy', 25.00),
(146, 24, 'Philips', 20.00),
(147, 24, 'Remington', 15.00),
(148, 24, 'Babyliss', 10.00),
(149, 24, 'Peabody', 5.00),
(150, 24, 'Atma', 0.00),
(151, 25, 'Gama Italy', 20.00),
(152, 25, 'Philips', 15.00),
(153, 25, 'Remington', 10.00),
(154, 25, 'Babyliss', 5.00),
(155, 25, 'Peabody', 0.00),
(156, 26, 'Philips', 25.00),
(157, 26, 'Braun', 20.00),
(158, 26, 'Remington', 15.00),
(159, 26, 'Panasonic', 10.00),
(160, 27, 'Philips', 25.00),
(161, 27, 'Braun', 20.00),
(162, 27, 'Remington', 15.00),
(163, 28, 'Philips Sonicare', 15.00),
(164, 28, 'Oral-B', 10.00),
(165, 28, 'Colgate', 5.00),
(166, 29, 'Philips', 50.00),
(167, 29, 'Osram', 45.00),
(168, 29, 'GE Lighting', 40.00),
(169, 29, 'TBC', 35.00),
(170, 29, 'Sica', 30.00),
(171, 30, 'Philips', 50.00),
(172, 30, 'Osram', 45.00),
(173, 30, 'GE Lighting', 40.00),
(174, 30, 'Sica', 35.00),
(175, 31, 'Philips', 50.00),
(176, 31, 'Osram', 45.00),
(177, 31, 'GE Lighting', 40.00),
(178, 31, 'TBC', 35.00),
(179, 32, 'Philips', 50.00),
(180, 32, 'Osram', 45.00),
(181, 32, 'Sica', 40.00),
(182, 32, 'TBC', 35.00),
(183, 33, 'Philips', 50.00),
(184, 33, 'Osram', 45.00),
(185, 33, 'Sica', 40.00),
(186, 33, 'TBC', 35.00),
(187, 34, 'Samsung', 200.00),
(188, 34, 'LG', 195.00),
(189, 34, 'Sony', 190.00),
(190, 34, 'Philips', 180.00),
(191, 34, 'TCL', 170.00),
(192, 34, 'Hisense', 160.00),
(193, 34, 'Noblex', 150.00),
(194, 34, 'BGH', 140.00),
(195, 34, 'Philco', 130.00),
(196, 35, 'JBL', 200.00),
(197, 35, 'Sony', 195.00),
(198, 35, 'LG', 190.00),
(199, 35, 'Samsung', 185.00),
(200, 35, 'Bose', 180.00),
(201, 35, 'Philco', 170.00),
(202, 35, 'Noblex', 160.00),
(203, 35, 'Panasonic', 150.00),
(204, 35, 'Harman Kardon', 145.00),
(205, 36, 'Sony', 200.00),
(206, 36, 'LG', 190.00),
(207, 36, 'Philips', 180.00),
(208, 36, 'Panasonic', 170.00),
(209, 36, 'Samsung', 160.00),
(210, 37, 'Sony PlayStation', 200.00),
(211, 37, 'Microsoft Xbox', 190.00),
(212, 37, 'Nintendo', 180.00),
(213, 38, 'VTech', 200.00),
(214, 38, 'Fisher Price', 190.00),
(215, 38, 'Hasbro', 180.00),
(216, 38, 'Clementoni', 170.00),
(217, 39, 'Peg Perego', 200.00),
(218, 39, 'Rondi', 190.00),
(219, 39, 'Audi Kids', 180.00),
(220, 39, 'Ford Kids', 170.00),
(221, 40, 'LEGO Mindstorms', 200.00),
(222, 40, 'Sphero', 190.00),
(223, 40, 'UBTech', 180.00),
(224, 40, 'Makeblock', 170.00),
(225, 41, 'DJI', 200.00),
(226, 41, 'Parrot', 190.00),
(227, 41, 'Syma', 180.00),
(228, 41, 'Potensic', 170.00),
(229, 41, 'Xiaomi', 160.00),
(230, 42, 'HP', 200.00),
(231, 42, 'Dell', 190.00),
(232, 42, 'Lenovo', 180.00),
(233, 42, 'Acer', 170.00),
(234, 42, 'Asus', 160.00),
(235, 42, 'Bangh??', 150.00),
(236, 42, 'EXO', 140.00),
(237, 43, 'HP', 200.00),
(238, 43, 'Dell', 190.00),
(239, 43, 'Lenovo', 180.00),
(240, 43, 'Asus', 170.00),
(241, 43, 'Acer', 160.00),
(242, 43, 'Bangh??', 150.00),
(243, 43, 'EXO', 140.00),
(244, 44, 'HP', 200.00),
(245, 44, 'Dell', 190.00),
(246, 44, 'Lenovo', 180.00),
(247, 44, 'Asus', 170.00),
(248, 44, 'Acer', 160.00),
(249, 44, 'Apple', 150.00),
(250, 44, 'MSI', 140.00),
(251, 45, 'Samsung', 200.00),
(252, 45, 'Apple', 190.00),
(253, 45, 'Lenovo', 180.00),
(254, 45, 'Huawei', 170.00),
(255, 45, 'Amazon', 160.00),
(256, 45, 'EXO', 150.00),
(257, 46, 'Samsung', 200.00),
(258, 46, 'LG', 190.00),
(259, 46, 'Dell', 180.00),
(260, 46, 'Acer', 170.00),
(261, 46, 'Asus', 160.00),
(262, 46, 'AOC', 150.00),
(263, 46, 'BenQ', 140.00),
(264, 47, 'HP', 200.00),
(265, 47, 'Canon', 190.00),
(266, 47, 'Epson', 180.00),
(267, 47, 'Brother', 170.00),
(268, 47, 'Lexmark', 160.00),
(269, 47, 'Ricoh', 150.00),
(270, 48, 'Epson', 200.00),
(271, 48, 'Canon', 190.00),
(272, 48, 'HP', 180.00),
(273, 48, 'Brother', 170.00),
(274, 48, 'Fujitsu', 160.00),
(275, 49, 'APC', 200.00),
(276, 49, 'Forza', 190.00),
(277, 49, 'CyberPower', 180.00),
(278, 49, 'Tripp Lite', 170.00),
(279, 49, 'Eaton', 160.00),
(280, 49, 'Sentey', 150.00),
(281, 50, 'Logitech', 200.00),
(282, 50, 'Redragon', 190.00),
(283, 50, 'Razer', 180.00),
(284, 50, 'HyperX', 170.00),
(285, 50, 'Corsair', 160.00),
(286, 50, 'HP', 150.00),
(287, 51, 'Logitech', 200.00),
(288, 51, 'Redragon', 190.00),
(289, 51, 'Razer', 180.00),
(290, 51, 'HyperX', 170.00),
(291, 51, 'Corsair', 160.00),
(292, 51, 'HP', 150.00),
(293, 52, 'Blue Yeti', 200.00),
(294, 52, 'Shure', 190.00),
(295, 52, 'Audio-Technica', 180.00),
(296, 52, 'Rode', 170.00),
(297, 52, 'HyperX', 160.00),
(298, 52, 'Samson', 150.00),
(299, 53, 'Logitech', 200.00),
(300, 53, 'Microsoft', 190.00),
(301, 53, 'Razer', 180.00),
(302, 53, 'Genius', 170.00),
(303, 54, 'Sony', 200.00),
(304, 54, 'JBL', 190.00),
(305, 54, 'Sennheiser', 180.00),
(306, 54, 'Bose', 170.00),
(307, 54, 'Razer', 160.00),
(308, 54, 'HyperX', 150.00),
(309, 55, 'Sony', 200.00),
(310, 55, 'Microsoft', 190.00),
(311, 55, 'Nintendo', 180.00),
(312, 55, 'Logitech', 170.00),
(313, 55, 'Razer', 160.00),
(314, 56, 'Panasonic', 200.00),
(315, 56, 'Motorola', 190.00),
(316, 56, 'Philips', 180.00),
(317, 56, 'Gigaset', 170.00),
(318, 57, 'Samsung', 200.00),
(319, 57, 'Apple', 190.00),
(320, 57, 'Motorola', 180.00),
(321, 57, 'Xiaomi', 170.00),
(322, 57, 'Huawei', 160.00),
(323, 57, 'LG', 150.00),
(324, 57, 'Nokia', 140.00),
(325, 58, 'TP-Link', 200.00),
(326, 58, 'D-Link', 190.00),
(327, 58, 'Netgear', 180.00),
(328, 58, 'Cisco', 170.00),
(329, 58, 'Ubiquiti', 160.00),
(330, 59, 'TP-Link', 200.00),
(331, 59, 'D-Link', 190.00),
(332, 59, 'Huawei', 180.00),
(333, 59, 'Motorola', 170.00),
(334, 59, 'ZTE', 160.00),
(335, 60, 'TP-Link', 200.00),
(336, 60, 'Cisco', 190.00),
(337, 60, 'D-Link', 180.00),
(338, 60, 'Netgear', 170.00),
(339, 61, 'TP-Link', 200.00),
(340, 61, 'Ubiquiti', 190.00),
(341, 61, 'Netgear', 180.00),
(342, 61, 'Mercusys', 170.00),
(343, 61, 'Tenda', 160.00),
(344, 62, 'Bosch', 200.00),
(345, 62, 'Black+Decker', 190.00),
(346, 62, 'Makita', 180.00),
(347, 62, 'DeWalt', 170.00),
(348, 62, 'Stanley', 160.00),
(349, 63, 'Bosch', 200.00),
(350, 63, 'Makita', 190.00),
(351, 63, 'DeWalt', 180.00),
(352, 63, 'Black+Decker', 170.00),
(353, 64, 'Bosch', 200.00),
(354, 64, 'Makita', 190.00),
(355, 64, 'DeWalt', 180.00),
(356, 64, 'Stanley', 170.00),
(357, 64, 'Black+Decker', 160.00),
(358, 65, 'Lincoln Electric', 200.00),
(359, 65, 'Gamma', 190.00),
(360, 65, 'Lusqtoff', 180.00),
(361, 65, 'Esab', 170.00),
(362, 66, 'K??rcher', 200.00),
(363, 66, 'Bosch', 190.00),
(364, 66, 'Electrolux', 180.00),
(365, 66, 'Gamma', 170.00),
(366, 67, 'K??rcher', 200.00),
(367, 67, 'Bosch', 190.00),
(368, 67, 'Black+Decker', 180.00),
(369, 67, 'Gamma', 170.00),
(370, 68, 'Gamma', 200.00),
(371, 68, 'Lusqtoff', 190.00),
(372, 68, 'Dewalt', 180.00),
(373, 68, 'Stanley', 170.00),
(374, 69, 'Fluke', 200.00),
(375, 69, 'UNI-T', 190.00),
(376, 69, 'Tektronix', 180.00),
(377, 69, 'Sanwa', 170.00),
(378, 70, 'Fluke', 200.00),
(379, 70, 'Testo', 190.00),
(380, 70, 'Beurer', 180.00),
(381, 70, 'Xiaomi', 170.00),
(382, 71, 'Hikvision', 200.00),
(383, 71, 'Dahua', 190.00),
(384, 71, 'Ezviz', 180.00),
(385, 71, 'TP-Link', 170.00),
(386, 71, 'Ring', 160.00),
(387, 72, 'Xiaomi', 200.00),
(388, 72, 'Philips Hue', 190.00),
(389, 72, 'Aqara', 180.00),
(390, 72, 'Tuya', 170.00),
(391, 73, 'Kidde', 200.00),
(392, 73, 'First Alert', 190.00),
(393, 73, 'Honeywell', 180.00),
(394, 73, 'Nest Protect', 170.00),
(395, 74, 'Anker', 200.00),
(396, 74, 'Aukey', 190.00),
(397, 74, 'Samsung', 180.00),
(398, 74, 'Xiaomi', 170.00),
(399, 74, 'Belkin', 160.00),
(400, 75, 'Corsair', 200.00),
(401, 75, 'EVGA', 190.00),
(402, 75, 'Cooler Master', 180.00),
(403, 75, 'Thermaltake', 170.00),
(404, 75, 'Seasonic', 160.00),
(405, 76, 'LG Solar', 200.00),
(406, 76, 'JA Solar', 190.00),
(407, 76, 'Trina Solar', 180.00),
(408, 76, 'Canadian Solar', 170.00),
(409, 77, 'Duracell', 200.00),
(410, 77, 'Energizer', 190.00),
(411, 77, 'Panasonic', 180.00),
(412, 77, 'Sony', 170.00),
(413, 77, 'Samsung', 160.00),
(414, 78, 'Anker', 200.00),
(415, 78, 'Xiaomi', 190.00),
(416, 78, 'Samsung', 180.00),
(417, 78, 'Romoss', 170.00),
(418, 78, 'Aukey', 160.00),
(419, 79, 'Casio', 200.00),
(420, 79, 'Seiko', 190.00),
(421, 79, 'Citizen', 180.00),
(422, 79, 'Orient', 170.00),
(423, 80, 'Ring', 200.00),
(424, 80, 'Honeywell', 190.00),
(425, 80, 'Aiphone', 180.00),
(426, 80, 'TBC', 170.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `municipios`
--

CREATE TABLE `municipios` (
  `idMunicipios` int(11) NOT NULL,
  `Nombres_Municipios` varchar(100) DEFAULT NULL,
  `CodigoPostal_Municipios` varchar(10) DEFAULT NULL,
  `idProvincias_Municipios` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `municipios`
--

INSERT INTO `municipios` (`idMunicipios`, `Nombres_Municipios`, `CodigoPostal_Municipios`, `idProvincias_Municipios`) VALUES
(1, 'Alba Posse', '3363', 1),
(2, 'Almafuerte', '3317', 1),
(3, 'Apostoles', '3350', 1),
(4, 'Aristobulo del Valle', '3364', 1),
(5, 'Arroyo del Medio', '3313', 1),
(6, 'Azara', '3351', 1),
(7, 'Bernardo de Irigoyen', '3366', 1),
(8, 'Bonpland', '3357', 1),
(9, 'Caa Yari', '3315', 1),
(10, 'Campo Grande', '3362', 1),
(11, 'Campo Ramon', '3361', 1),
(12, 'Campo Viera', '3362', 1),
(13, 'Candelaria', '3308', 1),
(14, 'Capiovi', '3332', 1),
(15, 'Caraguatay', '3384', 1),
(16, 'Cerro Azul', '3313', 1),
(17, 'Cerro Cora', '3304', 1),
(18, 'Colonia Alberdi', '3361', 1),
(19, 'Colonia Aurora', '3363', 1),
(20, 'Colonia Delicia', '3381', 1),
(21, 'Colonia Polana', '3326', 1),
(22, 'Colonia Victoria', '3384', 1),
(23, 'Colonia Wanda', '3380', 1),
(24, 'Comandante Andresito', '3364', 1),
(25, 'Concepcion de la Sierra', '3355', 1),
(26, 'Corpus Christi', '3322', 1),
(27, 'Dos Arroyos', '3315', 1),
(28, 'Dos de Mayo', '3364', 1),
(29, 'El Alcazar', '3384', 1),
(30, 'Eldorado', '3380', 1),
(31, 'El Soberbio', '3338', 1),
(32, 'Fachinal', '3304', 1),
(33, 'Florentino Ameghino', '3361', 1),
(34, 'Fracran', '3364', 1),
(35, 'Garuhape', '3334', 1),
(36, 'Garupa', '3304', 1),
(37, 'General Alvear', '3361', 1),
(38, 'General Urquiza', '3326', 1),
(39, 'Gobernador Lopez', '3315', 1),
(40, 'Gobernador Roca', '3324', 1),
(41, 'Guarani', '3361', 1),
(42, 'Hipolito Yrigoyen', '3328', 1),
(43, 'Itacaruare', '3353', 1),
(44, 'Jardin America', '3328', 1),
(45, 'Leandro N. Alem', '3315', 1),
(46, 'Libertad', '3384', 1),
(47, 'Loreto', '3322', 1),
(48, 'Los Helechos', '3361', 1),
(49, 'Martires', '3318', 1),
(50, 'Mojon Grande', '3315', 1),
(51, 'Montecarlo', '3384', 1),
(52, '9 de Julio', '3363', 1),
(53, 'Obera', '3360', 1),
(54, 'Olegario Victor Andrade', '3311', 1),
(55, 'Panambi', '3361', 1),
(56, 'Posadas', '3300', 1),
(57, 'Pozo Azul', '3364', 1),
(58, 'Profundidad', '3304', 1),
(59, 'Puerto Esperanza', '3378', 1),
(60, 'Puerto Iguazu', '3370', 1),
(61, 'Puerto Leoni', '3332', 1),
(62, 'Puerto Piray', '3381', 1),
(63, 'Puerto Rico', '3334', 1),
(64, 'Ruiz de Montoya', '3334', 1),
(65, 'Salto Encantado', '3364', 1),
(66, 'San Antonio', '3366', 1),
(67, 'San Ignacio', '3322', 1),
(68, 'San Javier', '3357', 1),
(69, 'San Jose', '3306', 1),
(70, 'San Martin', '3360', 1),
(71, 'San Pedro', '3364', 1),
(72, 'San Vicente', '3356', 1),
(73, 'Santa Ana', '3328', 1),
(74, 'Santa Rita', '3363', 1),
(75, 'Santo Pipo', '3326', 1),
(76, 'Tres Capones', '3353', 1),
(77, 'Wanda', '3380', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincias`
--

CREATE TABLE `provincias` (
  `idProvincias` int(11) NOT NULL,
  `Nombres_Provincias` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `provincias`
--

INSERT INTO `provincias` (`idProvincias`, `Nombres_Provincias`) VALUES
(1, 'Misiones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `idPublicacion` int(11) NOT NULL,
  `Titulo_Publicacion` varchar(100) NOT NULL,
  `Descripcion_Publicacion` varchar(255) NOT NULL,
  `PuntosDonados_Publicacion` int(11) NOT NULL,
  `FechaIngreso_Publicacion` datetime NOT NULL,
  `idDonacion_Publicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_entrega`
--

CREATE TABLE `punto_entrega` (
  `idPuntoEntrega` int(11) NOT NULL,
  `Nombre_PuntoEntrega` varchar(100) DEFAULT NULL,
  `idDirecciones_PuntoEntrega` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `punto_entrega`
--

INSERT INTO `punto_entrega` (`idPuntoEntrega`, `Nombre_PuntoEntrega`, `idDirecciones_PuntoEntrega`) VALUES
(1, 'EcoPunto Itaembe Guazu', 1),
(2, 'EcoPunto Itaembe Mini', 2),
(3, 'EcoPunto Barrio Los Alamos', 3),
(4, 'EcoPunto Dolores Sur', 4),
(5, 'EcoPunto Av. Martin Fierro & Av. Aguado', 5),
(6, 'EcoPunto Parque Sarmiento', 6),
(7, 'EcoPunto Av. Urquiza', 7),
(8, 'EcoPunto Feria Puente Chacabuco', 8),
(9, 'EcoPunto Cascada Artificial', 9),
(10, 'EcoPunto Av. Juan Domingo Peron & America Latina', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `idRoles` int(11) NOT NULL,
  `Nombres_Roles` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`idRoles`, `Nombres_Roles`) VALUES
(1, 'ciudadano'),
(2, 'tecnico'),
(3, 'institucion'),
(4, 'recepcion'),
(5, 'administrador');

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
  `Puntos_Usuarios` int(11) NOT NULL,
  `Roles_Usuarios` int(11) NOT NULL,
  `idDirecciones_Usuarios` int(11) NOT NULL,
  `ImagenPerfil_Usuarios` varchar(255) DEFAULT NULL,
  `FechaRegistro_Usuarios` datetime DEFAULT current_timestamp(),
  `Activo_Usuarios` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuarios`, `DNI_Usuarios`, `Nombres_Usuarios`, `Apellidos_Usuarios`, `Password_Usuarios`, `Telefono_Usuarios`, `Email_Usuarios`, `Puntos_Usuarios`, `Roles_Usuarios`, `idDirecciones_Usuarios`, `ImagenPerfil_Usuarios`, `FechaRegistro_Usuarios`, `Activo_Usuarios`) VALUES
(10, '45026308', 'Maximo Jesus', 'Rios', '$2y$10$qd3RrDdFknXjGga2Jfa8JO9qrr44d7iY2e5iYO.9G/ijBzLmARoaO', '3675102868', 'maximuz_ty@hotmail.com', 0, 1, 13, 'profile/perfil2animal.png', '2025-10-13 21:22:23', 1),
(13, '11111111', 'Test1', 'Host1', '$2y$10$heKj6VeR8okPyKw7bVTrqupZxTM6yodN.SWXZW/LV2NbMdgrHjaHq', '11111111111111', 'testhost@gmail.com', 0, 4, 22, 'profile/perfil2flores.png', '2025-10-14 20:27:55', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canjes`
--
ALTER TABLE `canjes`
  ADD PRIMARY KEY (`idCanje`),
  ADD KEY `idx_canjes_usuario` (`idUsuarios_Canjeador`),
  ADD KEY `idx_canjes_equipo` (`idEquipos_Canje`),
  ADD KEY `idx_canjes_punto` (`idPuntoEntrega_Canje`),
  ADD KEY `idx_canjes_fecha` (`FechaCanje_Canje`);

--
-- Indices de la tabla `categorias_equipos`
--
ALTER TABLE `categorias_equipos`
  ADD PRIMARY KEY (`idCategorias`),
  ADD UNIQUE KEY `Nombres_Categorias` (`Nombres_Categorias`),
  ADD KEY `idx_categorias_puntos` (`PuntosBase_Categorias`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`idDirecciones`),
  ADD KEY `idx_ubicaciones_coordenadas` (`Latitud_Ubicaciones`,`Longitud_Ubicaciones`),
  ADD KEY `fk_direcciones_municipios1_idx` (`idMunicipios_Direcciones`);

--
-- Indices de la tabla `donaciones`
--
ALTER TABLE `donaciones`
  ADD PRIMARY KEY (`idDonacion`),
  ADD UNIQUE KEY `uq_donaciones_codigo_qr` (`CodigoQR_Donacion`),
  ADD KEY `idx_donaciones_usuario` (`idUsuarios_Donante`),
  ADD KEY `idx_donaciones_equipo` (`idEquipos_Donacion`),
  ADD KEY `idx_donaciones_punto` (`idPuntoEntrega_Donacion`),
  ADD KEY `idx_donaciones_fecha_estado` (`FechaDonacion_Donacion`,`Estado_Donacion`);

--
-- Indices de la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`idEquipos`),
  ADD KEY `idx_equipos_fecha_ingreso` (`FechaIngreso_Equipos`),
  ADD KEY `idx_equipos_categoria` (`idCategorias_Equipos`),
  ADD KEY `fk_equipos_estados1_idx` (`idEstados_Equipos`),
  ADD KEY `idx_equipos_imagen` (`ImagenPrincipal_Equipos`),
  ADD KEY `fk_equipos_marcas_equipos1_idx` (`idMarcas_Equipos`),
  ADD KEY `fk_equipos_usuarios1_idx` (`idUsuarios_Equipos`);

--
-- Indices de la tabla `estados_equipos`
--
ALTER TABLE `estados_equipos`
  ADD PRIMARY KEY (`idEstadosEquipos`),
  ADD KEY `idx_estados_multiplicador` (`MultiplicadorPuntos_EstadosEquipos`);

--
-- Indices de la tabla `fotos_equipos`
--
ALTER TABLE `fotos_equipos`
  ADD PRIMARY KEY (`idFotosEquipos`),
  ADD KEY `fk_fotos_equipos_equipos1_idx` (`idEquipos_FotosEquipos`);

--
-- Indices de la tabla `historial_movimientos`
--
ALTER TABLE `historial_movimientos`
  ADD PRIMARY KEY (`idHistorialMov`),
  ADD KEY `idx_historial_usuario` (`idUsuarios_Historial`);

--
-- Indices de la tabla `marcas_equipos`
--
ALTER TABLE `marcas_equipos`
  ADD PRIMARY KEY (`idMarcas`),
  ADD UNIQUE KEY `uniq_marca_categoria` (`idCategorias_Marcas`,`Nombres_Marcas`),
  ADD KEY `idx_marcas_puntos` (`PuntosBase_Marcas`),
  ADD KEY `idx_marcas_categoria` (`idCategorias_Marcas`);

--
-- Indices de la tabla `municipios`
--
ALTER TABLE `municipios`
  ADD PRIMARY KEY (`idMunicipios`),
  ADD KEY `fk_municipios_provincias1_idx` (`idProvincias_Municipios`);

--
-- Indices de la tabla `provincias`
--
ALTER TABLE `provincias`
  ADD PRIMARY KEY (`idProvincias`);

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`idPublicacion`),
  ADD KEY `idx_publicacion_titulo` (`Titulo_Publicacion`),
  ADD KEY `idx_publicacion_idDonacion` (`idDonacion_Publicacion`);

--
-- Indices de la tabla `punto_entrega`
--
ALTER TABLE `punto_entrega`
  ADD PRIMARY KEY (`idPuntoEntrega`),
  ADD KEY `fk_punto_entrega_direcciones1_idx` (`idDirecciones_PuntoEntrega`);

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
  ADD KEY `fk_clientes_roles1_idx` (`Roles_Usuarios`),
  ADD KEY `idx_usuarios_activo` (`Activo_Usuarios`),
  ADD KEY `fk_usuarios_direcciones1_idx` (`idDirecciones_Usuarios`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `canjes`
--
ALTER TABLE `canjes`
  MODIFY `idCanje` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_equipos`
--
ALTER TABLE `categorias_equipos`
  MODIFY `idCategorias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `idDirecciones` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `donaciones`
--
ALTER TABLE `donaciones`
  MODIFY `idDonacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipos`
--
ALTER TABLE `equipos`
  MODIFY `idEquipos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `estados_equipos`
--
ALTER TABLE `estados_equipos`
  MODIFY `idEstadosEquipos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `fotos_equipos`
--
ALTER TABLE `fotos_equipos`
  MODIFY `idFotosEquipos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_movimientos`
--
ALTER TABLE `historial_movimientos`
  MODIFY `idHistorialMov` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marcas_equipos`
--
ALTER TABLE `marcas_equipos`
  MODIFY `idMarcas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=427;

--
-- AUTO_INCREMENT de la tabla `municipios`
--
ALTER TABLE `municipios`
  MODIFY `idMunicipios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `provincias`
--
ALTER TABLE `provincias`
  MODIFY `idProvincias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `idPublicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `punto_entrega`
--
ALTER TABLE `punto_entrega`
  MODIFY `idPuntoEntrega` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `idRoles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `canjes`
--
ALTER TABLE `canjes`
  ADD CONSTRAINT `fk_canjes_equipos` FOREIGN KEY (`idEquipos_Canje`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_canjes_punto_entrega` FOREIGN KEY (`idPuntoEntrega_Canje`) REFERENCES `punto_entrega` (`idPuntoEntrega`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_canjes_usuarios` FOREIGN KEY (`idUsuarios_Canjeador`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD CONSTRAINT `fk_direcciones_municipios1` FOREIGN KEY (`idMunicipios_Direcciones`) REFERENCES `municipios` (`idMunicipios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `donaciones`
--
ALTER TABLE `donaciones`
  ADD CONSTRAINT `fk_donaciones_equipos` FOREIGN KEY (`idEquipos_Donacion`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_donaciones_punto_entrega` FOREIGN KEY (`idPuntoEntrega_Donacion`) REFERENCES `punto_entrega` (`idPuntoEntrega`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_donaciones_usuarios` FOREIGN KEY (`idUsuarios_Donante`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD CONSTRAINT `fk_equipos_categorias1` FOREIGN KEY (`idCategorias_Equipos`) REFERENCES `categorias_equipos` (`idCategorias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_equipos_estados1` FOREIGN KEY (`idEstados_Equipos`) REFERENCES `estados_equipos` (`idEstadosEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_equipos_marcas_equipos1` FOREIGN KEY (`idMarcas_Equipos`) REFERENCES `marcas_equipos` (`idMarcas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_equipos_usuarios1` FOREIGN KEY (`idUsuarios_Equipos`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `fotos_equipos`
--
ALTER TABLE `fotos_equipos`
  ADD CONSTRAINT `fk_fotos_equipos_equipos1` FOREIGN KEY (`idEquipos_FotosEquipos`) REFERENCES `equipos` (`idEquipos`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `historial_movimientos`
--
ALTER TABLE `historial_movimientos`
  ADD CONSTRAINT `fk_historialmov_usuario` FOREIGN KEY (`idUsuarios_Historial`) REFERENCES `usuarios` (`idUsuarios`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `marcas_equipos`
--
ALTER TABLE `marcas_equipos`
  ADD CONSTRAINT `fk_marcas_categorias` FOREIGN KEY (`idCategorias_Marcas`) REFERENCES `categorias_equipos` (`idCategorias`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `municipios`
--
ALTER TABLE `municipios`
  ADD CONSTRAINT `fk_municipios_provincias1` FOREIGN KEY (`idProvincias_Municipios`) REFERENCES `provincias` (`idProvincias`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD CONSTRAINT `fk_publicacion_donaciones` FOREIGN KEY (`idDonacion_Publicacion`) REFERENCES `donaciones` (`idDonacion`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `punto_entrega`
--
ALTER TABLE `punto_entrega`
  ADD CONSTRAINT `fk_punto_entrega_direcciones1` FOREIGN KEY (`idDirecciones_PuntoEntrega`) REFERENCES `direcciones` (`idDirecciones`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_clientes_roles1` FOREIGN KEY (`Roles_Usuarios`) REFERENCES `roles` (`idRoles`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_usuarios_direcciones1` FOREIGN KEY (`idDirecciones_Usuarios`) REFERENCES `direcciones` (`idDirecciones`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
