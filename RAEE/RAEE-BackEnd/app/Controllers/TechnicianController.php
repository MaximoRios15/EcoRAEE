<?php

namespace App\Controllers;

use App\Models\TecnicoModel;
use App\Models\UserModel;
use App\Models\DonationModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class TechnicianController extends ResourceController
{
    protected $modelName = 'App\Models\TecnicoModel';
    protected $format = 'json';
    
    protected $tecnicoModel;
    protected $userModel;
    protected $donationModel;
    
    public function __construct()
    {
        $this->tecnicoModel = new TecnicoModel();
        $this->userModel = new UserModel();
        $this->donationModel = new DonationModel();
    }

    /**
     * Get all technicians with pagination and filters
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
                'especialidad' => $this->request->getGet('especialidad'),
                'provincia' => $this->request->getGet('provincia'),
                'disponible' => $this->request->getGet('disponible'),
                'search' => $this->request->getGet('search')
            ];

            $result = $this->tecnicoModel->getTechniciansPaginated($page, $perPage, $filters);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener técnicos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get a specific technician
     */
    public function show($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de técnico requerido', 400);
            }

            $technician = $this->tecnicoModel->getTechnicianWithUser($id);
            
            if (!$technician) {
                return $this->fail('Técnico no encontrado', 404);
            }

            // Get technician statistics
            $stats = $this->tecnicoModel->getTechnicianStats($id);

            return $this->respond([
                'success' => true,
                'data' => [
                    'technician' => $technician,
                    'statistics' => $stats
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Create a new technician profile
     */
    public function create()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            // Only admin can create technician profiles for other users
            if ($userType !== 'admin') {
                return $this->fail('No tienes permisos para crear perfiles de técnico', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            $requiredFields = ['user_id', 'especialidad'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Check if user exists and doesn't have a technician profile
            $user = $this->userModel->find($data['user_id']);
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }

            if ($this->tecnicoModel->hasProfile($data['user_id'])) {
                return $this->fail('El usuario ya tiene un perfil de técnico', 409);
            }

            // Validate technician data
            $validationErrors = $this->tecnicoModel->validateTechnicianData($data);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Create technician profile
            $technicianId = $this->tecnicoModel->insert($data);
            
            if (!$technicianId) {
                $errors = $this->tecnicoModel->errors();
                return $this->fail('Error al crear perfil de técnico: ' . implode(', ', $errors), 400);
            }

            // Get created technician with user data
            $technician = $this->tecnicoModel->getTechnicianWithUser($technicianId);

            return $this->respond([
                'success' => true,
                'message' => 'Perfil de técnico creado exitosamente',
                'data' => $technician
            ], 201);

        } catch (\Exception $e) {
            log_message('error', 'Error al crear técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update a technician profile
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
                return $this->fail('ID de técnico requerido', 400);
            }

            $technician = $this->tecnicoModel->find($id);
            
            if (!$technician) {
                return $this->fail('Técnico no encontrado', 404);
            }

            // Check permissions
            if ($userType !== 'admin' && $technician['user_id'] != $userId) {
                return $this->fail('No tienes permisos para modificar este técnico', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate technician data
            $validationErrors = $this->tecnicoModel->validateTechnicianData($data, $id);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Update technician
            $updated = $this->tecnicoModel->update($id, $data);
            
            if (!$updated) {
                $errors = $this->tecnicoModel->errors();
                return $this->fail('Error al actualizar técnico: ' . implode(', ', $errors), 400);
            }

            // Get updated technician with user data
            $updatedTechnician = $this->tecnicoModel->getTechnicianWithUser($id);

            return $this->respond([
                'success' => true,
                'message' => 'Técnico actualizado exitosamente',
                'data' => $updatedTechnician
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Delete a technician profile
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
                return $this->fail('ID de técnico requerido', 400);
            }

            $technician = $this->tecnicoModel->find($id);
            
            if (!$technician) {
                return $this->fail('Técnico no encontrado', 404);
            }

            // Check permissions - only admin or owner can delete
            if ($userType !== 'admin' && $technician['user_id'] != $userId) {
                return $this->fail('No tienes permisos para eliminar este técnico', 403);
            }

            // Check if technician has active assignments
            $activeAssignments = $this->donationModel->where('tecnico_id', $id)
                                                   ->whereIn('estado_donacion', ['asignada', 'en_proceso'])
                                                   ->countAllResults();

            if ($activeAssignments > 0) {
                return $this->fail('No se puede eliminar el técnico porque tiene asignaciones activas', 400);
            }

            // Delete technician
            $deleted = $this->tecnicoModel->delete($id);
            
            if (!$deleted) {
                return $this->fail('Error al eliminar técnico', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Técnico eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al eliminar técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get current user's technician profile
     */
    public function myProfile()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'tecnico') {
                return $this->fail('Solo los técnicos pueden acceder a este endpoint', 403);
            }

            $profile = $this->tecnicoModel->getProfileByUserId($userId);
            
            if (!$profile) {
                return $this->fail('Perfil de técnico no encontrado', 404);
            }

            // Get technician statistics
            $stats = $this->tecnicoModel->getTechnicianStats($profile['id']);

            return $this->respond([
                'success' => true,
                'data' => [
                    'profile' => $profile,
                    'statistics' => $stats
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener perfil de técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update current user's technician profile
     */
    public function updateMyProfile()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'tecnico') {
                return $this->fail('Solo los técnicos pueden acceder a este endpoint', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Check if profile exists
            if (!$this->tecnicoModel->hasProfile($userId)) {
                return $this->fail('Perfil de técnico no encontrado', 404);
            }

            // Validate technician data
            $technician = $this->tecnicoModel->getByUserId($userId);
            $validationErrors = $this->tecnicoModel->validateTechnicianData($data, $technician['id']);
            if (!empty($validationErrors)) {
                return $this->fail(implode(', ', $validationErrors), 400);
            }

            // Update profile
            $updated = $this->tecnicoModel->updateProfile($userId, $data);
            
            if (!$updated) {
                return $this->fail('Error al actualizar perfil', 500);
            }

            // Get updated profile
            $updatedProfile = $this->tecnicoModel->getProfileByUserId($userId);

            return $this->respond([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => $updatedProfile
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar perfil de técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Search technicians
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

            $technicians = $this->tecnicoModel->searchTechnicians($search, $limit);

            return $this->respond([
                'success' => true,
                'data' => $technicians
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al buscar técnicos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get technicians by specialty
     */
    public function getBySpecialty($specialty = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$specialty) {
                return $this->fail('Especialidad requerida', 400);
            }

            $technicians = $this->tecnicoModel->getBySpecialty($specialty);

            return $this->respond([
                'success' => true,
                'data' => $technicians
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener técnicos por especialidad: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get available technicians
     */
    public function getAvailable()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $technicians = $this->tecnicoModel->getAvailableTechnicians();

            return $this->respond([
                'success' => true,
                'data' => $technicians
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener técnicos disponibles: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get technician specialties summary
     */
    public function getSpecialties()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $specialties = $this->tecnicoModel->getSpecialtiesSummary();

            return $this->respond([
                'success' => true,
                'data' => $specialties
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener especialidades: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get top technicians by completed donations
     */
    public function getTopByCompletedDonations()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $limit = $this->request->getGet('limit') ?? 10;
            $technicians = $this->tecnicoModel->getTopTechniciansByCompletedDonations($limit);

            return $this->respond([
                'success' => true,
                'data' => $technicians
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener top técnicos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get technicians with recent activity
     */
    public function getWithRecentActivity()
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $days = $this->request->getGet('days') ?? 30;
            $technicians = $this->tecnicoModel->getTechniciansWithRecentActivity($days);

            return $this->respond([
                'success' => true,
                'data' => $technicians
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener técnicos con actividad reciente: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get technician assignments
     */
    public function getAssignments($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de técnico requerido', 400);
            }

            $technician = $this->tecnicoModel->find($id);
            
            if (!$technician) {
                return $this->fail('Técnico no encontrado', 404);
            }

            // Check permissions
            if ($userType !== 'admin' && $technician['user_id'] != $userId) {
                return $this->fail('No tienes permisos para ver las asignaciones de este técnico', 403);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            $filters = [
                'tecnico_id' => $id,
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
            log_message('error', 'Error al obtener asignaciones de técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get my assignments (for current technician)
     */
    public function getMyAssignments()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'tecnico') {
                return $this->fail('Solo los técnicos pueden acceder a este endpoint', 403);
            }

            $technician = $this->tecnicoModel->getByUserId($userId);
            
            if (!$technician) {
                return $this->fail('Perfil de técnico no encontrado', 404);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            $filters = [
                'tecnico_id' => $technician['id'],
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
            log_message('error', 'Error al obtener mis asignaciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update availability status
     */
    public function updateAvailability()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if ($userType !== 'tecnico') {
                return $this->fail('Solo los técnicos pueden acceder a este endpoint', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!isset($data['disponible'])) {
                return $this->fail('Estado de disponibilidad requerido', 400);
            }

            $disponible = (bool) $data['disponible'];

            // Update availability
            $updated = $this->tecnicoModel->updateAvailability($userId, $disponible);
            
            if (!$updated) {
                return $this->fail('Error al actualizar disponibilidad', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Disponibilidad actualizada exitosamente',
                'data' => ['disponible' => $disponible]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar disponibilidad: ' . $e->getMessage());
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