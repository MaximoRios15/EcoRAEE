<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes
$routes->group('api', function($routes) {
    // Authentication routes
    $routes->post('register', 'AuthController::register');
    $routes->post('login', 'AuthController::login');
    $routes->get('profile', 'AuthController::profile');
    $routes->get('user/points', 'AuthController::getUserPoints');
    $routes->get('user/statistics', 'AuthController::getUserStatistics');
    $routes->get('user/points/history', 'AuthController::getUserPointsHistory');
    $routes->put('usuarios/update-profile', 'AuthController::updateProfile');
    $routes->post('logout', 'AuthController::logout');
    
    // Public routes
    $routes->get('locations', 'UbicacionController::index');
    $routes->get('locations/(:num)', 'UbicacionController::show/$1');
    $routes->get('locations/municipality/(:segment)', 'UbicacionController::getByMunicipality/$1');
    $routes->get('categories', 'CategoryController::index');
    $routes->get('states', 'StateController::index');
    
    // Validation routes
$routes->post('validate-email', 'AuthController::validateEmail');
$routes->post('validate-dni', 'AuthController::validateDni');
$routes->post('validate-telefono', 'AuthController::validateTelefono');
    
    // Donation routes
    $routes->post('donations', 'DonationController::create');
    $routes->get('donations', 'DonationController::index');
    $routes->get('donations/user', 'DonationController::getUserDonations');
    $routes->get('donations/(:num)', 'DonationController::show/$1');
    $routes->put('donations/(:num)/status', 'DonationController::updateStatus/$1');
    
    // Institution routes
    $routes->post('institution/register', 'InstitutionController::register');
    $routes->get('institution/profile', 'InstitutionController::profile');
    $routes->put('institution/profile', 'InstitutionController::updateProfile');
    
    // Technician routes
    $routes->post('technician/register', 'TechnicianController::register');
    $routes->get('technician/profile', 'TechnicianController::profile');
    $routes->put('technician/profile', 'TechnicianController::updateProfile');
    $routes->get('technicians', 'TechnicianController::index');
    
    // Cart routes
    $routes->get('cart', 'CartController::index');
    $routes->post('cart', 'CartController::add');
    $routes->put('cart/(:num)', 'CartController::update/$1');
    $routes->delete('cart/(:num)', 'CartController::remove/$1');
    $routes->delete('cart/clear', 'CartController::clear');
    
    // Category and State routes (public endpoints)
    $routes->get('categories', 'CategoryController::index');
    $routes->get('states', 'StateController::index');
    
    // Image routes
    $routes->post('images/upload', 'ImageController::uploadEquipmentImages');
    $routes->get('images/(:segment)', 'ImageController::getImage/$1');
    $routes->delete('images/(:segment)', 'ImageController::deleteImage/$1');
    
    // Publication routes
    $routes->get('publications', 'PublicacionController::getAllPublications');
    $routes->get('publications/user', 'PublicacionController::getUserPublications');
    $routes->get('publications/(:num)', 'PublicacionController::show/$1');
    
    // User equipos routes
    $routes->get('user-equipos', 'UserEquiposController::index');
});
