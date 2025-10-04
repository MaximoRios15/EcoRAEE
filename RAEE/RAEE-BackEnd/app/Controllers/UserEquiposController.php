<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\UserModel;
use App\Models\EquiposModel;
use App\Models\HistorialPuntosModel;

class UserEquiposController extends ResourceController
{
    use ResponseTrait;

    protected $userModel;
    protected $equiposModel;
    protected $historialPuntosModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->equiposModel = new EquiposModel();
        $this->historialPuntosModel = new HistorialPuntosModel();
    }

    /**
     * Obtener todos los equipos del usuario autenticado
     */
    public function index()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            // Verificar que el usuario existe
            $user = $this->userModel->find($userId);
            if (!$user) {
                return $this->fail('Usuario no encontrado', 404);
            }
            
            // Obtener equipos del usuario con información de categorías y estados
            $equipos = $this->equiposModel->getEquiposWithDetails($userId);
            
            log_message('info', 'Equipos encontrados para usuario ' . $userId . ': ' . count($equipos));

            // Obtener puntos totales ganados por el usuario
            $totalPointsEarned = 0;
            try {
                $totalPointsEarned = $this->historialPuntosModel->getTotalPointsEarned($userId);
            } catch (\Exception $e) {
                log_message('warning', 'No se pudieron obtener puntos del historial: ' . $e->getMessage());
                // Calcular puntos sumando los equipos
                foreach ($equipos as $equipo) {
                    $totalPointsEarned += $equipo['Puntos_Equipos'] ?? 0;
                }
            }

            // Transformar los datos para el frontend
            $transformedEquipos = [];
            foreach ($equipos as $equipo) {
                $transformedEquipos[] = [
                    'idEquipos' => $equipo['idEquipos'] ?? 0,
                    'idClientes_Equipos' => $equipo['idClientes_Equipos'] ?? 0,
                    'idCategorias_Equipos' => $equipo['idCategorias_Equipos'] ?? 0,
                    'Marca_Equipos' => $equipo['Marca_Equipos'] ?? 'Sin marca',
                    'Modelo_Equipos' => $equipo['Modelo_Equipos'] ?? 'Sin modelo',
                    'idEstados_Equipos' => $equipo['idEstados_Equipos'] ?? 0,
                    'Cantidad_Equipos' => $equipo['Cantidad_Equipos'] ?? 1,
                    'Descripcion_Equipos' => $equipo['Descripcion_Equipos'] ?? '',
                    'Fotos_Equipos' => $equipo['Fotos_Equipos'] ?? '',
                    'PesoKG_Equipos' => $equipo['PesoKG_Equipos'] ?? 0,
                    'DimencionesCM_Equipos' => $equipo['DimencionesCM_Equipos'] ?? '',
                    'Accesorios_Equipos' => $equipo['Accesorios_Equipos'] ?? '',
                    'FechaIngreso_Equipos' => $equipo['FechaIngreso_Equipos'] ?? date('Y-m-d'),
                    'ImagenPrincipal_Equipos' => $equipo['ImagenPrincipal_Equipos'] ?? '',
                    'Puntos_Equipos' => $equipo['Puntos_Equipos'] ?? 0,
                    'Nombres_Categorias' => $equipo['Nombres_Categorias'] ?? 'Sin categoría',
                    'Nombres_Estados' => $equipo['Nombres_Estados'] ?? 'Sin estado',
                    'FechaMovimiento_Puntos' => $equipo['FechaMovimiento_Puntos'] ?? null
                ];
            }

            return $this->respond([
                'success' => true,
                'data' => $transformedEquipos,
                'total_equipos' => count($transformedEquipos),
                'total_points_earned' => $totalPointsEarned,
                'message' => 'Equipos obtenidos correctamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error en UserEquiposController::index: ' . $e->getMessage());
            
            return $this->failServerError('Error interno del servidor');
        }
    }

}
