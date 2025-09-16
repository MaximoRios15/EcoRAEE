<?php

namespace App\Controllers;

use App\Models\DonationModel;
use App\Models\UserModel;
use App\Models\TecnicoModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class DonationController extends ResourceController
{
    protected $modelName = 'App\Models\DonationModel';
    protected $format = 'json';
    
    protected $donationModel;
    protected $userModel;
    protected $tecnicoModel;
    
    public function __construct()
    {
        $this->donationModel = new DonationModel();
        $this->userModel = new UserModel();
        $this->tecnicoModel = new TecnicoModel();
    }

    /**
     * Get all donations with pagination and filters
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
                'estado' => $this->request->getGet('estado'),
                'tipo_dispositivo' => $this->request->getGet('tipo_dispositivo'),
                'provincia' => $this->request->getGet('provincia'),
                'municipio' => $this->request->getGet('municipio'),
                'fecha_desde' => $this->request->getGet('fecha_desde'),
                'fecha_hasta' => $this->request->getGet('fecha_hasta'),
                'search' => $this->request->getGet('search')
            ];

            // Filter by user type
            if ($userType === 'donante' || $userType === 'institucion') {
                $filters['usuario_id'] = $userId;
            } elseif ($userType === 'tecnico') {
                $filters['tecnico_id'] = $userId;
            }

            $result = $this->donationModel->getDonationsPaginated($page, $perPage, $filters);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener donaciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get a specific donation
     */
    public function show($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de donación requerido', 400);
            }

            $donation = $this->donationModel->getDonationWithDetails($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Check permissions
            if ($userType !== 'admin') {
                if ($userType === 'tecnico' && $donation['tecnico_asignado_id'] != $userId) {
                    return $this->fail('No tienes permisos para ver esta donación', 403);
                } elseif (($userType === 'donante' || $userType === 'institucion') && $donation['usuario_id'] != $userId) {
                    return $this->fail('No tienes permisos para ver esta donación', 403);
                }
            }

            return $this->respond([
                'success' => true,
                'data' => $donation
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener donación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Create a new donation
     */
    public function create()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            // Only donantes and instituciones can create donations
            if (!in_array($userType, ['donante', 'institucion'])) {
                return $this->fail('No tienes permisos para crear donaciones', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            $requiredFields = ['tipo_dispositivo', 'marca', 'modelo', 'descripcion_estado', 'direccion_recogida'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Set user ID and default values
            $data['usuario_id'] = $userId;
            $data['estado_donacion'] = 'pendiente';
            $data['fecha_solicitud'] = date('Y-m-d H:i:s');

            // Create donation
            $donationId = $this->donationModel->insert($data);
            
            if (!$donationId) {
                $errors = $this->donationModel->errors();
                return $this->fail('Error al crear donación: ' . implode(', ', $errors), 400);
            }

            // Get created donation with details
            $donation = $this->donationModel->getDonationWithDetails($donationId);

            return $this->respond([
                'success' => true,
                'message' => 'Donación creada exitosamente',
                'data' => $donation
            ], 201);

        } catch (\Exception $e) {
            log_message('error', 'Error al crear donación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update a donation
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
                return $this->fail('ID de donación requerido', 400);
            }

            $donation = $this->donationModel->find($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Check permissions
            if ($userType !== 'admin') {
                if ($userType === 'tecnico' && $donation['tecnico_asignado_id'] != $userId) {
                    return $this->fail('No tienes permisos para modificar esta donación', 403);
                } elseif (($userType === 'donante' || $userType === 'institucion') && $donation['usuario_id'] != $userId) {
                    return $this->fail('No tienes permisos para modificar esta donación', 403);
                }
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Restrict fields that can be updated based on user type
            if ($userType === 'tecnico') {
                $allowedFields = ['estado_donacion', 'fecha_recogida', 'fecha_entrega', 'observaciones_tecnico'];
                $data = array_intersect_key($data, array_flip($allowedFields));
            } elseif (in_array($userType, ['donante', 'institucion'])) {
                // Only allow updates if donation is still pending
                if ($donation['estado_donacion'] !== 'pendiente') {
                    return $this->fail('No se puede modificar una donación que ya está en proceso', 400);
                }
                $allowedFields = ['tipo_dispositivo', 'marca', 'modelo', 'descripcion_estado', 'direccion_recogida', 'telefono_contacto', 'observaciones'];
                $data = array_intersect_key($data, array_flip($allowedFields));
            }

            // Update donation
            $updated = $this->donationModel->update($id, $data);
            
            if (!$updated) {
                $errors = $this->donationModel->errors();
                return $this->fail('Error al actualizar donación: ' . implode(', ', $errors), 400);
            }

            // Get updated donation with details
            $updatedDonation = $this->donationModel->getDonationWithDetails($id);

            return $this->respond([
                'success' => true,
                'message' => 'Donación actualizada exitosamente',
                'data' => $updatedDonation
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar donación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Delete a donation
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
                return $this->fail('ID de donación requerido', 400);
            }

            $donation = $this->donationModel->find($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Check permissions - only owner can delete and only if pending
            if ($donation['usuario_id'] != $userId && $userType !== 'admin') {
                return $this->fail('No tienes permisos para eliminar esta donación', 403);
            }

            if ($donation['estado_donacion'] !== 'pendiente') {
                return $this->fail('Solo se pueden eliminar donaciones pendientes', 400);
            }

            // Delete donation
            $deleted = $this->donationModel->delete($id);
            
            if (!$deleted) {
                return $this->fail('Error al eliminar donación', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Donación eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al eliminar donación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Assign technician to donation
     */
    public function assignTechnician($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de donación requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['tecnico_id'])) {
                return $this->fail('ID del técnico es obligatorio', 400);
            }

            $donation = $this->donationModel->find($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Check if donation can be assigned
            if (!in_array($donation['estado_donacion'], ['pendiente', 'asignada'])) {
                return $this->fail('La donación no puede ser asignada en su estado actual', 400);
            }

            // Verify technician exists and is available
            $technician = $this->tecnicoModel->getByUserId($data['tecnico_id']);
            
            if (!$technician) {
                return $this->fail('Técnico no encontrado', 404);
            }

            if ($technician['disponibilidad'] !== 'disponible') {
                return $this->fail('El técnico no está disponible', 400);
            }

            // Assign technician
            $updateData = [
                'tecnico_asignado_id' => $data['tecnico_id'],
                'estado_donacion' => 'asignada',
                'fecha_asignacion' => date('Y-m-d H:i:s')
            ];

            $updated = $this->donationModel->update($id, $updateData);
            
            if (!$updated) {
                return $this->fail('Error al asignar técnico', 500);
            }

            // Update technician availability
            $this->tecnicoModel->updateAvailability($data['tecnico_id'], 'ocupado');

            // Get updated donation with details
            $updatedDonation = $this->donationModel->getDonationWithDetails($id);

            return $this->respond([
                'success' => true,
                'message' => 'Técnico asignado exitosamente',
                'data' => $updatedDonation
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al asignar técnico: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update donation status
     */
    public function updateStatus($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de donación requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['estado'])) {
                return $this->fail('Estado es obligatorio', 400);
            }

            $donation = $this->donationModel->find($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Check permissions
            if ($userType === 'tecnico' && $donation['tecnico_asignado_id'] != $userId) {
                return $this->fail('No tienes permisos para modificar esta donación', 403);
            }

            $newStatus = $data['estado'];
            $updateData = ['estado_donacion' => $newStatus];

            // Set appropriate date fields based on status
            switch ($newStatus) {
                case 'en_proceso':
                    $updateData['fecha_recogida'] = date('Y-m-d H:i:s');
                    break;
                case 'completada':
                    $updateData['fecha_entrega'] = date('Y-m-d H:i:s');
                    // Award points to user
                    $this->awardPointsForDonation($donation['usuario_id'], $donation['tipo_dispositivo']);
                    // Update technician availability
                    if ($donation['tecnico_asignado_id']) {
                        $this->tecnicoModel->updateAvailability($donation['tecnico_asignado_id'], 'disponible');
                    }
                    break;
                case 'cancelada':
                    // Update technician availability
                    if ($donation['tecnico_asignado_id']) {
                        $this->tecnicoModel->updateAvailability($donation['tecnico_asignado_id'], 'disponible');
                    }
                    break;
            }

            // Add observations if provided
            if (!empty($data['observaciones'])) {
                $updateData['observaciones_tecnico'] = $data['observaciones'];
            }

            // Update donation
            $updated = $this->donationModel->update($id, $updateData);
            
            if (!$updated) {
                return $this->fail('Error al actualizar estado', 500);
            }

            // Get updated donation with details
            $updatedDonation = $this->donationModel->getDonationWithDetails($id);

            return $this->respond([
                'success' => true,
                'message' => 'Estado actualizado exitosamente',
                'data' => $updatedDonation
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar estado: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get donation statistics
     */
    public function statistics()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $stats = [];

            if ($userType === 'admin') {
                $stats = $this->donationModel->getGeneralStatistics();
            } elseif (in_array($userType, ['donante', 'institucion'])) {
                $stats = $this->donationModel->getUserStatistics($userId);
            } elseif ($userType === 'tecnico') {
                $stats = $this->donationModel->getTechnicianStatistics($userId);
            }

            return $this->respond([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener estadísticas: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get available technicians for a donation
     */
    public function getAvailableTechnicians($id = null)
    {
        try {
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            if (!$id) {
                return $this->fail('ID de donación requerido', 400);
            }

            $donation = $this->donationModel->getDonationWithDetails($id);
            
            if (!$donation) {
                return $this->fail('Donación no encontrada', 404);
            }

            // Get available technicians in the same location
            $technicians = $this->tecnicoModel->getAvailableByLocation(
                $donation['provincia'], 
                $donation['municipio']
            );

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
     * Get device types summary
     */
    public function getDeviceTypes()
    {
        try {
            $types = $this->donationModel->getDeviceTypesSummary();

            return $this->respond([
                'success' => true,
                'data' => $types
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener tipos de dispositivos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get monthly trends
     */
    public function getMonthlyTrends()
    {
        try {
            $userId = $this->getUserIdFromToken();
            $userType = $this->getUserTypeFromToken();
            
            if (!$userId) {
                return $this->fail('Token inválido', 401);
            }

            $months = $this->request->getGet('months') ?? 12;
            
            if ($userType === 'admin') {
                $trends = $this->donationModel->getMonthlyTrends($months);
            } else {
                $trends = $this->donationModel->getUserMonthlyTrends($userId, $months);
            }

            return $this->respond([
                'success' => true,
                'data' => $trends
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener tendencias mensuales: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Award points for completed donation
     */
    private function awardPointsForDonation(int $userId, string $deviceType): void
    {
        try {
            // Points based on device type
            $pointsMap = [
                'Computadora' => 50,
                'Laptop' => 40,
                'Tablet' => 30,
                'Smartphone' => 20,
                'Monitor' => 25,
                'Impresora' => 15,
                'Televisor' => 35,
                'Electrodoméstico' => 30,
                'Otro' => 10
            ];

            $points = $pointsMap[$deviceType] ?? 10;
            
            $this->userModel->addPoints($userId, $points);

        } catch (\Exception $e) {
            log_message('error', 'Error al otorgar puntos: ' . $e->getMessage());
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