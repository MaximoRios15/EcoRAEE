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
    $routes->post('logout', 'AuthController::logout');
    
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
    
    // Category and State routes (public endpoints)
    $routes->get('categories', 'CategoryController::index');
    $routes->get('states', 'StateController::index');
});
