<?php

namespace App\Controllers;

use App\Models\DonationModel;
use App\Models\UserModel;
use App\Models\TecnicoModel;
use App\Models\HistorialPuntosModel;
use CodeIgniter\RESTful\ResourceController;

class DonationController extends ResourceController
{
    protected $modelName = 'App\Models\DonationModel';
    protected $format = 'json';
    
    protected $donationModel;
    protected $userModel;
    protected $tecnicoModel;
    protected $historialPuntosModel;
    
    public function __construct()
    {
        $this->donationModel = new DonationModel();
        $this->userModel = new UserModel();
        $this->tecnicoModel = new TecnicoModel();
        $this->historialPuntosModel = new HistorialPuntosModel();
    }

    /**
     * Get all equipment with pagination and filters
     */
    public function index()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userRole = $this->request->getGet('user_role');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            $filters = [
                'categoria' => $this->request->getGet('categoria'),
                'estado' => $this->request->getGet('estado'),
                'estado_publicacion' => $this->request->getGet('estado_publicacion'),
                'fecha_desde' => $this->request->getGet('fecha_desde'),
                'fecha_hasta' => $this->request->getGet('fecha_hasta'),
                'search' => $this->request->getGet('search')
            ];

            // Filter by user role
            if ($userRole == 1 || $userRole == 2) { // ciudadano or institucion
                $filters['usuario_id'] = $userId;
            } elseif ($userRole == 3) { // tecnico
                $filters['tecnico_id'] = $userId;
            }

            $result = $this->donationModel->getDonationsPaginated($page, $perPage, $filters);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener equipos: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get a specific equipment
     */
    public function show($id = null)
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userRole = $this->request->getGet('user_role');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            if (!$id) {
                return $this->fail('ID de equipo requerido', 400);
            }

            $equipment = $this->donationModel->getDonationWithUser($id);
            
            if (!$equipment) {
                return $this->fail('Equipo no encontrado', 404);
            }

            // Check permissions
            if ($userRole != 4) { // Assuming 4 = admin
                if ($userRole == 3 && $equipment['idClientes_Equipos'] != $userId) { // tecnico
                    return $this->fail('No tienes permisos para ver este equipo', 403);
                } elseif (($userRole == 1 || $userRole == 2) && $equipment['idClientes_Equipos'] != $userId) { // ciudadano or institucion
                    return $this->fail('No tienes permisos para ver este equipo', 403);
                }
            }

            return $this->respond([
                'success' => true,
                'data' => $equipment
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener equipo: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Create a new equipment
     */
    public function create()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userRole = $this->request->getGet('user_role');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            // Only ciudadanos and instituciones can create equipment
            if (!in_array($userRole, [1, 2])) { // ciudadano or institucion
                return $this->fail('No tienes permisos para crear equipos', 403);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields (only those that are NOT NULL in database)
            $requiredFields = ['idCategorias_Equipos', 'Marca_Equipos', 'idEstados_Equipos', 'Cantidad_Equipos', 'PesoKG_Equipos'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Clean and prepare data
            $data['idClientes_Equipos'] = $userId;
            $data['FechaIngreso_Equipos'] = date('Y-m-d H:i:s');
            
            // Convert string IDs to integers
            $data['idCategorias_Equipos'] = (int)$data['idCategorias_Equipos'];
            $data['idEstados_Equipos'] = (int)$data['idEstados_Equipos'];
            $data['Cantidad_Equipos'] = (int)$data['Cantidad_Equipos'];
            
            // Fix decimal format (replace comma with dot)
            $data['PesoKG_Equipos'] = str_replace(',', '.', $data['PesoKG_Equipos']);
            $data['PesoKG_Equipos'] = (float)$data['PesoKG_Equipos'];
            
            // Ensure arrays are properly formatted
            if (isset($data['Fotos_Equipos']) && is_array($data['Fotos_Equipos'])) {
                $data['Fotos_Equipos'] = json_encode($data['Fotos_Equipos']);
            }

            // Log the data being inserted for debugging
            log_message('debug', 'Data to insert: ' . json_encode($data));
            
            // Create equipment
            $equipmentId = $this->donationModel->insert($data);
            
            if (!$equipmentId) {
                $errors = $this->donationModel->errors();
                log_message('error', 'Validation errors: ' . json_encode($errors));
                log_message('error', 'Data that failed: ' . json_encode($data));
                return $this->fail('Error al crear equipo: ' . implode(', ', $errors), 400);
            }

            // Create publication if points are provided
            log_message('debug', 'Checking points condition - puntos: ' . ($data['puntos'] ?? 'null') . ', descripcion: ' . ($data['descripcion_publicacion'] ?? 'null'));
            
            if (!empty($data['puntos'])) {
                // Use custom description or fallback to equipment description
                $publicationDescription = !empty($data['descripcion_publicacion']) 
                    ? $data['descripcion_publicacion'] 
                    : ($data['Descripcion_Equipos'] ?? 'Donación de equipo electrónico');
                
                // Use marca as title
                $publicationTitle = $data['Marca_Equipos'] ?? 'Equipo electrónico';
                
                log_message('debug', 'Creating publication and adding points for user: ' . $userId . ' with points: ' . $data['puntos']);
                
                $publicacionId = $this->donationModel->createPublication(
                    $equipmentId, 
                    $userId, 
                    $publicationTitle,
                    $publicationDescription, 
                    (int)$data['puntos'],
                    (int)$data['idEstados_Equipos'] // Use the selected state
                );
                
                if ($publicacionId) {
                    log_message('debug', 'Publication created with ID: ' . $publicacionId);
                    
                    // Create collection location if provided
                    if (!empty($data['ubicacion'])) {
                        $ubicacionResult = $this->donationModel->createCollectionLocation(
                            $publicacionId,
                            (int)$data['ubicacion']
                        );
                        log_message('debug', 'Collection location created: ' . ($ubicacionResult ? 'true' : 'false'));
                    }
                    
                    // Add points to user using HistorialPuntosModel
                    $pointsResult = $this->historialPuntosModel->addPointsToUser(
                        $userId, 
                        $equipmentId, 
                        (int)$data['puntos'], 
                        'Donación de equipo: ' . $publicationTitle
                    );
                    log_message('debug', 'Points added to historial result: ' . ($pointsResult ? 'true' : 'false'));
                    
                    // Verify points were added
                    $user = $this->userModel->find($userId);
                    log_message('debug', 'User points after adding: ' . ($user['Puntos_Usuarios'] ?? 'null'));
                } else {
                    log_message('error', 'Failed to create publication');
                }
            } else {
                log_message('debug', 'Points condition not met - puntos empty: ' . (empty($data['puntos']) ? 'true' : 'false'));
            }

            // Get basic equipment data
            $equipment = $this->donationModel->find($equipmentId);

            return $this->respond([
                'success' => true,
                'message' => 'Donación registrada exitosamente',
                'data' => [
                    'equipment_id' => $equipmentId,
                    'equipment' => $equipment,
                    'points_added' => !empty($data['puntos']) ? (int)$data['puntos'] : 0,
                    'publication_created' => !empty($data['puntos']) ? true : false,
                    'location_saved' => !empty($data['ubicacion']) ? true : false
                ]
            ], 201);

        } catch (\Exception $e) {
            log_message('error', 'Error al crear equipo: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update a donation
     */
    public function update($id = null)
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            $userType = $this->request->getGet('user_type');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
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

}