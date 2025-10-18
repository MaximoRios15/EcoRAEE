<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
// API Routes
$routes->group('api', static function($routes) {
    $routes->get('health', 'AuthController::health');
    $routes->post('register', 'AuthController::register');
    $routes->post('login', 'AuthController::login');
    $routes->post('validate-dni', 'AuthController::validateDni');
    $routes->get('municipios', 'MunicipiosController::index');
    $routes->get('puntos-entrega', 'PuntosEntregaController::index');
    // Perfil de usuario
    $routes->get('profile', 'UserController::profile');
    // Búsqueda de usuario por DNI (para recepción)
    $routes->get('user/search-by-dni', 'UserController::searchByDni');
    // Estadísticas y puntos de usuario
    $routes->get('user/statistics', 'UserController::statistics');
    $routes->get('user/points', 'UserController::points');
  $routes->get('user/points/history', 'UserController::pointsHistory');
  // Publicaciones (tienda de canjes)
  $routes->get('publications', 'PublicationsController::index');
  // Catálogos para filtros
  $routes->get('categories', 'CategoriesController::index');
  $routes->get('states', 'StatesController::index');
  $routes->get('brands', 'BrandsController::index');
  });
