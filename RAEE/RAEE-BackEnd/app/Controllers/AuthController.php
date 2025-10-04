<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\InstitucionModel;
use App\Models\TecnicoModel;
use CodeIgniter\RESTful\ResourceController;

class AuthController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format = 'json';
    
    protected $userModel;
    protected $institucionModel;
    protected $tecnicoModel;
    
    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->institucionModel = new InstitucionModel();
        $this->tecnicoModel = new TecnicoModel();
    }

    /**
     * Register a new user
     */
    public function register()
    {
        try {
            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            $requiredFields = ['Nombres_Usuarios', 'Apellidos_Usuarios', 'Email_Usuarios', 'Password_Usuarios', 'DNI_Usuarios', 'Telefono_Usuarios', 'Roles_Usuarios'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Validate DNI format
            if (!preg_match('/^\d{7,8}$/', $data['DNI_Usuarios'])) {
                return $this->fail('El DNI debe contener entre 7 y 8 dígitos', 400);
            }

            // Validate email format
            if (!filter_var($data['Email_Usuarios'], FILTER_VALIDATE_EMAIL)) {
                return $this->fail('Formato de email inválido', 400);
            }

            // Validate password length
            if (strlen($data['Password_Usuarios']) < 6) {
                return $this->fail('La contraseña debe tener al menos 6 caracteres', 400);
            }

            // Validate user role (assuming 1=ciudadano, 2=institucion, 3=tecnico)
            if (!in_array($data['Roles_Usuarios'], [1, 2, 3])) {
                return $this->fail('Rol de usuario no válido', 400);
            }

            // Validate specific fields based on user role
            if ($data['Roles_Usuarios'] == 2) { // institucion
                $institutionFields = ['NroLegajo_Institucion', 'Tipo_Institucion', 'Contacto_Institucion', 'RegistroTitulo_Institucion'];
                foreach ($institutionFields as $field) {
                    if (empty($data[$field])) {
                        return $this->fail("El campo {$field} es obligatorio para instituciones", 400);
                    }
                }
            } elseif ($data['Roles_Usuarios'] == 3) { // tecnico
                if (empty($data['Certificado_Tecnico'])) {
                    return $this->fail('El campo Certificado_Tecnico es obligatorio para técnicos', 400);
                }
            }

            // Check if email already exists
            if ($this->userModel->where('Email_Usuarios', $data['Email_Usuarios'])->first()) {
                return $this->fail('El email ya está registrado', 409);
            }

            // Check if DNI already exists
            if ($this->userModel->where('DNI_Usuarios', $data['DNI_Usuarios'])->first()) {
                return $this->fail('El DNI ya está registrado', 409);
            }

            // Check if telephone already exists
            if ($this->userModel->where('Telefono_Usuarios', $data['Telefono_Usuarios'])->first()) {
                return $this->fail('El teléfono ya está registrado', 409);
            }

            // Validate location fields
            if (empty($data['Direccion_Usuarios']) || empty($data['Municipios_Usuarios'])) {
                return $this->fail('Dirección y municipio son obligatorios', 400);
            }

            // Set default values
            $data['Activo_Usuarios'] = 1;
            // Solo establecer ImagenPerfil_Usuarios como null si no se proporcionó
            if (empty($data['ImagenPerfil_Usuarios'])) {
                $data['ImagenPerfil_Usuarios'] = null;
            }
            
            // Store location data before removing from user data
            $ubicacionData = [
                'Direccion_Ubicaciones' => $data['Direccion_Usuarios'],
                'NroCalle_Ubicaciones' => $data['NroCalle_Usuarios'] ?? '',
                'Provincia_Ubicaciones' => 'Misiones',
                'Municipios_Ubicaciones' => $data['Municipios_Usuarios'],
                'Latitud_Ubicaciones' => $data['Latitud_Usuarios'] ?? -27.366667 + (rand(-500, 500) / 10000), // Coordenadas aproximadas de Misiones
                'Longitud_Ubicaciones' => $data['Longitud_Usuarios'] ?? -55.896944 + (rand(-500, 500) / 10000)
            ];
            
            // Remove fields that don't belong to usuarios table
            unset($data['Provincia_Usuarios']);
            unset($data['Direccion_Usuarios']);
            unset($data['NroCalle_Usuarios']);
            unset($data['Municipios_Usuarios']);

            // Password will be hashed by the model callback

            // Create user location first
            $ubicacionModel = new \App\Models\UbicacionModel();

            $ubicacionId = $ubicacionModel->insert($ubicacionData);
            if (!$ubicacionId) {
                $errors = $ubicacionModel->errors();
                return $this->fail('Error al crear ubicación: ' . implode(', ', $errors), 400);
            }

            // Set the location ID for the user
            $data['ubicaciones_Usuarios'] = $ubicacionId;

            // Create user
            $userId = $this->userModel->insert($data);
            
            if (!$userId) {
                $errors = $this->userModel->errors();
                // If user creation fails, delete the created location
                $ubicacionModel->delete($ubicacionId);
                return $this->fail('Error al crear usuario: ' . implode(', ', $errors), 400);
            }

            // Create profile based on user role
            $profileCreated = true;
            $profileData = [];

            if ($data['Roles_Usuarios'] == 1) { // ciudadano
                // Citizens don't need additional profile, just use the user table
                $profileCreated = true;
                $profileData = ['message' => 'Perfil de ciudadano creado exitosamente'];
            } elseif ($data['Roles_Usuarios'] == 2) { // institucion
                $institucionData = [
                    'clientes_Institucion' => $userId,
                    'NroLegajo_Institucion' => $data['NroLegajo_Institucion'],
                    'Tipo_Institucion' => $data['Tipo_Institucion'],
                    'Contacto_Institucion' => $data['Contacto_Institucion'],
                    'RegistroTitulo_Institucion' => $data['RegistroTitulo_Institucion'],
                    'estados_Institucion' => 1 // Assuming 1 = active
                ];
                
                $profileId = $this->institucionModel->insert($institucionData);
                if (!$profileId) {
                    $profileCreated = false;
                    $profileData = $this->institucionModel->errors();
                }
            } elseif ($data['Roles_Usuarios'] == 3) { // tecnico
                $tecnicoData = [
                    'clientes_Tecnico' => $userId,
                    'Certificado_Tecnico' => $data['Certificado_Tecnico'],
                    'estados_Tecnico' => 1 // Assuming 1 = active
                ];
                
                $profileId = $this->tecnicoModel->insert($tecnicoData);
                if (!$profileId) {
                    $profileCreated = false;
                    $profileData = $this->tecnicoModel->errors();
                }
            }

            // Get created user
            $user = $this->userModel->find($userId);
            unset($user['Password_Usuarios']); // Remove password from response

            $response = [
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => [
                    'user' => $user,
                    'profile_created' => $profileCreated
                ]
            ];

            if (!$profileCreated) {
                $response['profile_errors'] = $profileData;
                $response['message'] .= ' (con errores en el perfil)';
            }

            return $this->respond($response, 201);

        } catch (\Exception $e) {
            log_message('error', 'Error en registro: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Login user
     */
    public function login()
    {
        try {
            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            if (empty($data['DNI_Usuarios']) || empty($data['Password_Usuarios'])) {
                return $this->fail('DNI y contraseña son obligatorios', 400);
            }

            // Find user by DNI
            $user = $this->userModel->where('DNI_Usuarios', $data['DNI_Usuarios'])->first();
            
            if (!$user) {
                return $this->fail('Credenciales inválidas', 401);
            }

            // Check if user is active
            if (!$user['Activo_Usuarios']) {
                return $this->fail('Usuario inactivo', 401);
            }

            // Verify password
            if (!password_verify($data['Password_Usuarios'], $user['Password_Usuarios'])) {
                return $this->fail('Credenciales inválidas', 401);
            }

            // Remove password from response
            unset($user['Password_Usuarios']);

            // Get profile data based on user role
            $profile = null;
            if ($user['Roles_Usuarios'] == 2) { // institucion
                $profile = $this->institucionModel->getByUserId($user['idUsuarios']);
            } elseif ($user['Roles_Usuarios'] == 3) { // tecnico
                $profile = $this->tecnicoModel->getByUserId($user['idUsuarios']);
            }

            // Get user location data
            $location = null;
            if ($user['ubicaciones_Usuarios']) {
                $locationModel = new \App\Models\UbicacionModel();
                $location = $locationModel->find($user['ubicaciones_Usuarios']);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'user' => $user,
                    'profile' => $profile,
                    'location' => $location
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error en login: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get current user profile
     */
    public function profile()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Remove password from response
            unset($user['Password_Usuarios']);

            // Get profile data based on user role
            $profile = null;
            if ($user['Roles_Usuarios'] == 2) { // institucion
                $profile = $this->institucionModel->getByUserId($user['idUsuarios']);
            } elseif ($user['Roles_Usuarios'] == 3) { // tecnico
                $profile = $this->tecnicoModel->getByUserId($user['idUsuarios']);
            }

            return $this->respond([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'profile' => $profile
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener perfil: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }


    /**
     * Update user profile
     */
    public function updateProfile()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Separate user data from profile data
            $userData = [];
            $profileData = [];

            $userFields = ['Nombres_Usuarios', 'Apellidos_Usuarios', 'Telefono_Usuarios', 'Provincia_Usuarios', 'Municipios_Usuarios', 'ImagenPerfil_Usuarios'];
            
            foreach ($data as $key => $value) {
                if (in_array($key, $userFields)) {
                    $userData[$key] = $value;
                } else {
                    $profileData[$key] = $value;
                }
            }

            // Update user data
            if (!empty($userData)) {
                $updated = $this->userModel->update($userId, $userData);
                if (!$updated) {
                    $errors = $this->userModel->errors();
                    return $this->fail('Error al actualizar usuario: ' . implode(', ', $errors), 400);
                }
            }

            // Update profile data
            $profileUpdated = true;
            if (!empty($profileData)) {
                if ($user['Roles_Usuarios'] == 2) { // institucion
                    $profileUpdated = $this->institucionModel->updateProfile($userId, $profileData);
                } elseif ($user['Roles_Usuarios'] == 3) { // tecnico
                    $profileUpdated = $this->tecnicoModel->updateProfile($userId, $profileData);
                }
            }

            // Get updated user and profile
            $updatedUser = $this->userModel->find($userId);
            unset($updatedUser['Password_Usuarios']);

            $profile = null;
            if ($user['Roles_Usuarios'] == 2) { // institucion
                $profile = $this->institucionModel->getByUserId($userId);
            } elseif ($user['Roles_Usuarios'] == 3) { // tecnico
                $profile = $this->tecnicoModel->getByUserId($userId);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => [
                    'user' => $updatedUser,
                    'profile' => $profile,
                    'profile_updated' => $profileUpdated
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar perfil: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            if (empty($data['current_password']) || empty($data['new_password'])) {
                return $this->fail('Contraseña actual y nueva contraseña son obligatorias', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Verify current password
            if (!password_verify($data['current_password'], $user['Password_Usuarios'])) {
                return $this->fail('Contraseña actual incorrecta', 400);
            }

            // Validate new password
            if (strlen($data['new_password']) < 6) {
                return $this->fail('La nueva contraseña debe tener al menos 6 caracteres', 400);
            }

            // Hash new password
            $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

            // Update password
            $updated = $this->userModel->update($userId, ['Password_Usuarios' => $hashedPassword]);
            
            if (!$updated) {
                return $this->fail('Error al actualizar contraseña', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Contraseña actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al cambiar contraseña: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }


    /**
     * Logout user (client side only)
     */
    public function logout()
    {
        return $this->respond([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
    }

    /**
     * Validate email format
     */
    public function validateEmail()
    {
        try {
            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['email'])) {
                return $this->fail('Email es obligatorio', 400);
            }

            $email = $data['email'];
            
            // Check email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->respond([
                    'success' => false,
                    'message' => 'Formato de email inválido'
                ]);
            }

            // Check if email exists
            $exists = $this->userModel->where('Email_Usuarios', $email)->first();
            
            return $this->respond([
                'success' => true,
                'data' => [
                    'email' => $email,
                    'available' => !$exists,
                    'message' => $exists ? 'Email ya registrado' : 'Email disponible'
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al validar email: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Validate DNI
     */
    public function validateDni()
    {
        try {
            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['dni'])) {
                return $this->fail('DNI es obligatorio', 400);
            }

            $dni = $data['dni'];
            
            // Check if DNI exists
            $exists = $this->userModel->where('DNI_Usuarios', $dni)->first();
            
            return $this->respond([
                'success' => true,
                'data' => [
                    'dni' => $dni,
                    'available' => !$exists,
                    'message' => $exists ? 'DNI ya registrado' : 'DNI disponible'
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al validar DNI: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }


    /**
     * Get user points
     */
    public function getUserPoints()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Obtener puntos actuales del usuario
            $puntos = $user['Puntos_Usuarios'] ?? 0;

            return $this->respond([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'puntos' => $puntos,
                    'nombres' => $user['Nombres_Usuarios'],
                    'apellidos' => $user['Apellidos_Usuarios']
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener puntos del usuario: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getUserStatistics()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Obtener estadísticas usando HistorialPuntosModel
            $historialModel = new \App\Models\HistorialPuntosModel();
            $estadisticas = $historialModel->getUserStatistics($userId);

            return $this->respond([
                'success' => true,
                'data' => $estadisticas
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener estadísticas: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get user points history
     */
    public function getUserPointsHistory()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Obtener historial de puntos
            $historialModel = new \App\Models\HistorialPuntosModel();
            $historial = $historialModel->getUserPointsHistory($userId, 20);

            return $this->respond([
                'success' => true,
                'data' => $historial
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener historial de puntos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get collection locations
     */
    public function getCollectionLocations()
    {
        try {
            $ubicacionModel = new \App\Models\UbicacionModel();
            $ubicaciones = $ubicacionModel->getCollectionLocations();

            return $this->respond([
                'success' => true,
                'data' => $ubicaciones
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener ubicaciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Validate telephone number
     */
    public function validateTelefono()
    {
        try {
            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['telefono'])) {
                return $this->fail('Teléfono es obligatorio', 400);
            }

            $telefono = $data['telefono'];
            
            // Check if telephone exists
            $exists = $this->userModel->where('Telefono_Usuarios', $telefono)->first();
            
            return $this->respond([
                'success' => true,
                'data' => [
                    'telefono' => $telefono,
                    'available' => !$exists,
                    'message' => $exists ? 'Teléfono ya registrado' : 'Teléfono disponible'
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al validar teléfono: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

}