<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\InstitucionModel;
use App\Models\TecnicoModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

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
            $requiredFields = ['nombre', 'apellido', 'email', 'password', 'dni', 'telefono', 'tipo_usuario'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Validate user type
            if (!in_array($data['tipo_usuario'], ['ciudadano', 'institucion', 'tecnico'])) {
                return $this->fail('Tipo de usuario no válido', 400);
            }

            // Check if email already exists
            if ($this->userModel->where('email', $data['email'])->first()) {
                return $this->fail('El email ya está registrado', 409);
            }

            // Check if DNI already exists
            if ($this->userModel->where('dni', $data['dni'])->first()) {
                return $this->fail('El DNI ya está registrado', 409);
            }

            // Set default values
            $data['puntos'] = 0;
            $data['activo'] = 1;
            $data['provincia'] = $data['provincia'] ?? 'Misiones';
            $data['municipio'] = $data['municipio'] ?? 'No especificado';

            // Create user
            $userId = $this->userModel->insert($data);
            
            if (!$userId) {
                $errors = $this->userModel->errors();
                return $this->fail('Error al crear usuario: ' . implode(', ', $errors), 400);
            }

            // Create profile based on user type
            $profileCreated = true;
            $profileData = [];

            if ($data['tipo_usuario'] === 'ciudadano') {
                // Citizens don't need additional profile, just use the user table
                $profileCreated = true;
                $profileData = ['message' => 'Perfil de ciudadano creado exitosamente'];
            } elseif ($data['tipo_usuario'] === 'institucion') {
                $institucionData = [
                    'user_id' => $userId,
                    'nombre_institucion' => $data['nombre_institucion'] ?? '',
                    'tipo_institucion' => $data['tipo_institucion'] ?? '',
                    'direccion' => $data['direccion'] ?? '',
                    'codigo_postal' => $data['codigo_postal'] ?? '',
                    'telefono_contacto' => $data['telefono_contacto'] ?? $data['telefono'],
                    'email_contacto' => $data['email_contacto'] ?? $data['email'],
                    'nombre_responsable' => $data['nombre_responsable'] ?? $data['nombre'] . ' ' . $data['apellido'],
                    'descripcion_programas' => $data['descripcion_programas'] ?? ''
                ];
                
                $profileId = $this->institucionModel->insert($institucionData);
                if (!$profileId) {
                    $profileCreated = false;
                    $profileData = $this->institucionModel->errors();
                }
            } elseif ($data['tipo_usuario'] === 'tecnico') {
                $tecnicoData = [
                    'user_id' => $userId,
                    'especialidad' => $data['especialidad'] ?? '',
                    'experiencia_anos' => $data['experiencia_anos'] ?? 0,
                    'certificaciones' => $data['certificaciones'] ?? '',
                    'disponibilidad' => 'disponible',
                    'zona_cobertura' => $data['zona_cobertura'] ?? $data['provincia'],
                    'tarifa_hora' => $data['tarifa_hora'] ?? 0,
                    'calificacion_promedio' => 0,
                    'total_trabajos' => 0,
                    'descripcion_servicios' => $data['descripcion_servicios'] ?? ''
                ];
                
                $profileId = $this->tecnicoModel->insert($tecnicoData);
                if (!$profileId) {
                    $profileCreated = false;
                    $profileData = $this->tecnicoModel->errors();
                }
            }

            // Get created user
            $user = $this->userModel->find($userId);
            unset($user['password']); // Remove password from response

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
            if (empty($data['dni']) || empty($data['password'])) {
                return $this->fail('DNI y contraseña son obligatorios', 400);
            }

            // Find user by DNI
            $user = $this->userModel->where('dni', $data['dni'])->first();
            
            if (!$user) {
                return $this->fail('Credenciales inválidas', 401);
            }

            // Check if user is active
            if (!$user['activo']) {
                return $this->fail('Usuario inactivo', 401);
            }

            // Verify password
            if (!password_verify($data['password'], $user['password'])) {
                return $this->fail('Credenciales inválidas', 401);
            }

            // Generate JWT token
            $token = $this->generateJWT($user);

            // Remove password from response
            unset($user['password']);

            // Get profile data based on user type
            $profile = null;
            if ($user['tipo_usuario'] === 'institucion') {
                $profile = $this->institucionModel->getByUserId($user['id']);
            } elseif ($user['tipo_usuario'] === 'tecnico') {
                $profile = $this->tecnicoModel->getByUserId($user['id']);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'user' => $user,
                    'profile' => $profile,
                    'token' => $token
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
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            // Remove password from response
            unset($user['password']);

            // Get profile data based on user type
            $profile = null;
            if ($user['tipo_usuario'] === 'institucion') {
                $profile = $this->institucionModel->getByUserId($user['id']);
            } elseif ($user['tipo_usuario'] === 'tecnico') {
                $profile = $this->tecnicoModel->getByUserId($user['id']);
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
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
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

            $userFields = ['nombre', 'apellido', 'telefono', 'provincia', 'municipio'];
            
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
                if ($user['tipo_usuario'] === 'institucion') {
                    $profileUpdated = $this->institucionModel->updateProfile($userId, $profileData);
                } elseif ($user['tipo_usuario'] === 'tecnico') {
                    $profileUpdated = $this->tecnicoModel->updateProfile($userId, $profileData);
                }
            }

            // Get updated user and profile
            $updatedUser = $this->userModel->find($userId);
            unset($updatedUser['password']);

            $profile = null;
            if ($user['tipo_usuario'] === 'institucion') {
                $profile = $this->institucionModel->getByUserId($userId);
            } elseif ($user['tipo_usuario'] === 'tecnico') {
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
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
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
            if (!password_verify($data['current_password'], $user['password'])) {
                return $this->fail('Contraseña actual incorrecta', 400);
            }

            // Validate new password
            if (strlen($data['new_password']) < 6) {
                return $this->fail('La nueva contraseña debe tener al menos 6 caracteres', 400);
            }

            // Hash new password
            $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

            // Update password
            $updated = $this->userModel->update($userId, ['password' => $hashedPassword]);
            
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
     * Refresh JWT token
     */
    public function refreshToken()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $user = $this->userModel->find($userId);
            
            if (!$user || !$user['activo']) {
                return $this->fail('Usuario no válido', 401);
            }

            // Generate new token
            $token = $this->generateJWT($user);

            return $this->respond([
                'success' => true,
                'message' => 'Token renovado exitosamente',
                'data' => [
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al renovar token: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Logout user (invalidate token - client side)
     */
    public function logout()
    {
        return $this->respond([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
    }

    /**
     * Generate JWT token
     */
    private function generateJWT(array $user): string
    {
        $key = getenv('JWT_SECRET');
        $payload = [
            'iss' => 'raee-backend',
            'aud' => 'raee-frontend',
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60), // 24 hours
            'data' => [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'tipo_usuario' => $user['tipo_usuario']
            ]
        ];

        return JWT::encode($payload, $key, 'HS256');
    }

    /**
     * Get user ID from JWT token
     */
    private function getUserIdFromToken(): ?int
    {
        try {
            $authHeader = $this->request->getHeaderLine('Authorization');
            
            if (!$authHeader) {
                return null;
            }

            $token = str_replace('Bearer ', '', $authHeader);
            $key = getenv('JWT_SECRET');
            
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            return $decoded->data->user_id ?? null;

        } catch (\Exception $e) {
            log_message('error', 'Error al decodificar token: ' . $e->getMessage());
            return null;
        }
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
            $exists = $this->userModel->where('email', $email)->first();
            
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
            $exists = $this->userModel->where('dni', $dni)->first();
            
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
}