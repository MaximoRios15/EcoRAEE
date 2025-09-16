<?php

namespace App\Controllers;

use App\Models\InstitucionModel;
use App\Models\UserModel;
use App\Models\DonationModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class InstitutionController extends ResourceController
{
    protected $modelName = 'App\Models\InstitucionModel';
    protected $format = 'json';
    
    protected $institucionModel;
    protected $userModel;
    protected $donationModel;
    
    public function __construct()
    {
        $this->institucionModel = new InstitucionModel();
        $this->userModel = new UserModel();
        $this->donationModel = new DonationModel();
    }

    /**
     * Get all institutions with pagination and filters
     */
    public function index()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            $filters = [
                'tipo_institucion' => $this->request->getGet('tipo_institucion'),
                'provincia' => $this->request->getGet('provincia'),
                'search' => $this->request->getGet('search')
            ];

            $result = $this->institucionModel->getInstitutionsPaginated($page, $perPage, $filters);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener instituciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get a specific institution
     */
    public function show($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de institución requerido', 400);
            }

            $institution = $this->institucionModel->getInstitutionWithUser($id);
            
            if (!$institution) {
                return $this->fail('Institución no encontrada', 404);
            }

            // Get institution statistics
            $stats = $this->institucionModel->getInstitutionStats($id);

            return $this->respond([
                'success' => true,
                'data' => [
                    'institution' => $institution,
                    'statistics' => $stats
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Create a new institution profile
     */
    public function create()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            // Only admin can create institution profiles for other users
            if ($userType !== 'admin') {
                return $this->fail('No tienes permisos para crear perfiles de institución', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            $requiredFields = ['user_id', 'nombre_institucion'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Check if user exists and doesn't have an institution profile
            $user = $this->userModel->find($data['user_id']);
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            if ($this->institucionModel->hasProfile($data['user_id'])) {
                return $this->fail('El usuario ya tiene un perfil de institución', 409);
            }

            // Validate institution data
            $validationErrors = $this->institucionModel->validateInstitutionData($data);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Create institution profile
            $institutionId = $this->institucionModel->insert($data);
            
            if (!$institutionId) {
                $errors = $this->institucionModel->errors();
                return $this->fail('Error al crear perfil de institución: ' . implode(', ', $errors), 400);
            }

            // Get created institution with user data
            $institution = $this->institucionModel->getInstitutionWithUser($institutionId);

            return $this->respond([
                'success' => true,
                'message' => 'Perfil de institución creado exitosamente',
                'data' => $institution
            ], 201);

        } catch (\Exception $e) {
            log_message('error', 'Error al crear institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update an institution profile
     */
    public function update($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de institución requerido', 400);
            }

            $institution = $this->institucionModel->find($id);
            
            if (!$institution) {
                return $this->fail('Institución no encontrada', 404);
            }

            // Check permissions
            if ($userType !== 'admin' && $institution['user_id'] != $userId) {
                return $this->fail('No tienes permisos para modificar esta institución', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate institution data
            $validationErrors = $this->institucionModel->validateInstitutionData($data, $id);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Update institution
            $updated = $this->institucionModel->update($id, $data);
            
            if (!$updated) {
                $errors = $this->institucionModel->errors();
                return $this->fail('Error al actualizar institución: ' . implode(', ', $errors), 400);
            }

            // Get updated institution with user data
            $updatedInstitution = $this->institucionModel->getInstitutionWithUser($id);

            return $this->respond([
                'success' => true,
                'message' => 'Institución actualizada exitosamente',
                'data' => $updatedInstitution
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Delete an institution profile
     */
    public function delete($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de institución requerido', 400);
            }

            $institution = $this->institucionModel->find($id);
            
            if (!$institution) {
                return $this->fail('Institución no encontrada', 404);
            }

            // Check permissions - only admin or owner can delete
            if ($userType !== 'admin' && $institution['user_id'] != $userId) {
                return $this->fail('No tienes permisos para eliminar esta institución', 403);
            }

            // Check if institution has active donations
            $activeDonations = $this->donationModel->where('usuario_id', $institution['user_id'])
                                                  ->whereIn('estado_donacion', ['pendiente', 'asignada', 'en_proceso'])
                                                  ->countAllResults();

            if ($activeDonations > 0) {
                return $this->fail('No se puede eliminar la institución porque tiene donaciones activas', 400);
            }

            // Delete institution
            $deleted = $this->institucionModel->delete($id);
            
            if (!$deleted) {
                return $this->fail('Error al eliminar institución', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Institución eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al eliminar institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get current user's institution profile
     */
    public function myProfile()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'institucion') {
                return $this->fail('Solo las instituciones pueden acceder a este endpoint', 403);
            }

            $profile = $this->institucionModel->getProfileByUserId($userId);
            
            if (!$profile) {
                return $this->fail('Perfil de institución no encontrado', 404);
            }

            // Get institution statistics
            $stats = $this->institucionModel->getInstitutionStats($profile['id']);

            return $this->respond([
                'success' => true,
                'data' => [
                    'profile' => $profile,
                    'statistics' => $stats
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener perfil de institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update current user's institution profile
     */
    public function updateMyProfile()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'institucion') {
                return $this->fail('Solo las instituciones pueden acceder a este endpoint', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Check if profile exists
            if (!$this->institucionModel->hasProfile($userId)) {
                return $this->fail('Perfil de institución no encontrado', 404);
            }

            // Validate institution data
            $institution = $this->institucionModel->getByUserId($userId);
            $validationErrors = $this->institucionModel->validateInstitutionData($data, $institution['id']);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Update profile
            $updated = $this->institucionModel->updateProfile($userId, $data);
            
            if (!$updated) {
                return $this->fail('Error al actualizar perfil', 500);
            }

            // Get updated profile
            $updatedProfile = $this->institucionModel->getProfileByUserId($userId);

            return $this->respond([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => $updatedProfile
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar perfil de institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Search institutions
     */
    public function search()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $search = $this->request->getGet('q');
            $limit = $this->request->getGet('limit') ?? 20;
            
            if (empty($search)) {
                return $this->fail('Parámetro de búsqueda requerido', 400);
            }

            $institutions = $this->institucionModel->searchInstitutions($search, $limit);

            return $this->respond([
                'success' => true,
                'data' => $institutions
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al buscar instituciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get institutions by type
     */
    public function getByType($type = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$type) {
                return $this->fail('Tipo de institución requerido', 400);
            }

            $institutions = $this->institucionModel->getByType($type);

            return $this->respond([
                'success' => true,
                'data' => $institutions
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener instituciones por tipo: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get institution types summary
     */
    public function getTypes()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $types = $this->institucionModel->getInstitutionTypesSummary();

            return $this->respond([
                'success' => true,
                'data' => $types
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener tipos de instituciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get top institutions by donations
     */
    public function getTopByDonations()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $limit = $this->request->getGet('limit') ?? 10;
            $institutions = $this->institucionModel->getTopInstitutionsByDonations($limit);

            return $this->respond([
                'success' => true,
                'data' => $institutions
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener top instituciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get institutions with recent activity
     */
    public function getWithRecentActivity()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $days = $this->request->getGet('days') ?? 30;
            $institutions = $this->institucionModel->getInstitutionsWithRecentActivity($days);

            return $this->respond([
                'success' => true,
                'data' => $institutions
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener instituciones con actividad reciente: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get institution donations
     */
    public function getDonations($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de institución requerido', 400);
            }

            $institution = $this->institucionModel->find($id);
            
            if (!$institution) {
                return $this->fail('Institución no encontrada', 404);
            }

            // Check permissions
            if ($userType !== 'admin' && $institution['user_id'] != $userId) {
                return $this->fail('No tienes permisos para ver las donaciones de esta institución', 403);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            $filters = [
                'usuario_id' => $institution['user_id'],
                'estado' => $this->request->getGet('estado'),
                'tipo_dispositivo' => $this->request->getGet('tipo_dispositivo'),
                'fecha_desde' => $this->request->getGet('fecha_desde'),
                'fecha_hasta' => $this->request->getGet('fecha_hasta')
            ];

            $result = $this->donationModel->getDonationsPaginated($page, $perPage, $filters);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener donaciones de institución: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
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
     * Get user type from JWT token
     */
    private function getUserTypeFromToken(): ?string
    {
        try {
            $authHeader = $this->request->getHeaderLine('Authorization');
            
            if (!$authHeader) {
                return null;
            }

            $token = str_replace('Bearer ', '', $authHeader);
            $key = getenv('JWT_SECRET');
            
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            return $decoded->data->tipo_usuario ?? null;

        } catch (\Exception $e) {
            log_message('error', 'Error al decodificar token: ' . $e->getMessage());
            return null;
        }
    }
}