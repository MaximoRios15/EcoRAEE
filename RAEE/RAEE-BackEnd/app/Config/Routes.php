<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Rutas de la API
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    // Autenticación
    $routes->post('register', 'AuthController::register');
    $routes->post('login', 'AuthController::login');
    $routes->get('profile', 'AuthController::profile');
    
    // Instituciones
    $routes->post('institution/register', 'InstitutionController::register');
    $routes->get('institution/profile', 'InstitutionController::getProfile');
    $routes->put('institution/profile', 'InstitutionController::updateProfile');
    
    // Técnicos
    $routes->post('technician/register', 'TechnicianController::register');
    $routes->get('technician/profile', 'TechnicianController::getProfile');
    $routes->put('technician/profile', 'TechnicianController::updateProfile');
    $routes->get('technicians', 'TechnicianController::getAllTechnicians');
    
    // Donaciones
    $routes->post('donations', 'DonationController::create');
    $routes->get('donations', 'DonationController::getAllDonations');
    $routes->get('donations/user', 'DonationController::getUserDonations');
    $routes->get('donations/(:num)', 'DonationController::getDonation/$1');
    $routes->put('donations/(:num)/status', 'DonationController::updateStatus/$1');
    
    // Entregas
    $routes->post('deliveries', 'DeliveryController::create');
    $routes->get('deliveries', 'DeliveryController::getAllDeliveries');
    $routes->get('deliveries/user', 'DeliveryController::getUserDeliveries');
    $routes->get('deliveries/(:num)', 'DeliveryController::getDelivery/$1');
    $routes->put('deliveries/(:num)/status', 'DeliveryController::updateDeliveryStatus/$1');
    $routes->get('deliveries/timeslots', 'DeliveryController::getAvailableTimeSlots');
    
    // CORS preflight para todas las rutas
    $routes->options('register', 'AuthController::options');
    $routes->options('login', 'AuthController::options');
    $routes->options('profile', 'AuthController::options');
    $routes->options('institution/register', 'InstitutionController::options');
    $routes->options('institution/profile', 'InstitutionController::options');
    $routes->options('technician/register', 'TechnicianController::options');
    $routes->options('technician/profile', 'TechnicianController::options');
    $routes->options('technicians', 'TechnicianController::options');
    $routes->options('donations', 'DonationController::options');
    $routes->options('donations/user', 'DonationController::options');
    $routes->options('donations/(:num)', 'DonationController::options');
    $routes->options('donations/(:num)/status', 'DonationController::options');
    $routes->options('deliveries', 'DeliveryController::options');
    $routes->options('deliveries/user', 'DeliveryController::options');
    $routes->options('deliveries/(:num)', 'DeliveryController::options');
    $routes->options('deliveries/(:num)/status', 'DeliveryController::options');
    $routes->options('deliveries/timeslots', 'DeliveryController::options');
});
