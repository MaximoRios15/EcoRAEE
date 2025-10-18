<?php

namespace App\Controllers;

use App\Models\UsuariosModel;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class UserController extends BaseController
{
    use ResponseTrait;

    /**
     * GET /api/profile?user_id=10
     * Devuelve el perfil del usuario por id.
     */
    public function profile()
    {
        // Aceptar múltiples nombres de parámetro según el frontend/BD
        $userId = $this->request->getGet('user_id')
            ?? $this->request->getGet('idUsuarios')
            ?? $this->request->getGet('id');

        if (!$userId) {
            return $this->failValidationErrors('Parámetro requerido: idUsuarios|user_id|id');
        }

        $usuarios = new UsuariosModel();
        $user = $usuarios->find($userId);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        // No exponer hash de contraseña
        unset($user['Password_Usuarios']);

        return $this->respond([
            'success' => true,
            'data' => [
                'user' => $user,
            ],
            'message' => 'Perfil obtenido correctamente'
        ], ResponseInterface::HTTP_OK);
    }

    /**
     * GET /api/user/statistics?user_id=10
     * Devuelve estadísticas básicas del usuario.
     * Fallback inicial para la pantalla de estadísticas del frontend.
     */
    public function statistics()
    {
        $userId = $this->request->getGet('user_id')
            ?? $this->request->getGet('idUsuarios')
            ?? $this->request->getGet('id');

        if (!$userId) {
            return $this->failValidationErrors('Parámetro requerido: idUsuarios|user_id|id');
        }

        $usuarios = new UsuariosModel();
        $user = $usuarios->find($userId);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        $currentPoints = (int) ($user['Puntos_Usuarios'] ?? 0);

        $statistics = [
            'totalDonations'     => 0,
            'totalPointsEarned'  => 0,
            'totalPointsRedeemed'=> 0,
            'currentPoints'      => $currentPoints,
            'categoriesDonated'  => [],
            'monthlyStats'       => [],
        ];

        return $this->respond([
            'success'    => true,
            'statistics' => $statistics,
            'message'    => 'Estadísticas básicas del usuario'
        ], ResponseInterface::HTTP_OK);
    }

    /**
     * GET /api/user/points?user_id=10
     * Devuelve los puntos actuales del usuario.
     */
    public function points()
    {
        $userId = $this->request->getGet('user_id')
            ?? $this->request->getGet('idUsuarios')
            ?? $this->request->getGet('id');

        if (!$userId) {
            return $this->failValidationErrors('Parámetro requerido: idUsuarios|user_id|id');
        }

        $usuarios = new UsuariosModel();
        $user = $usuarios->find($userId);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        $points = (int) ($user['Puntos_Usuarios'] ?? 0);

        return $this->respond([
            'success' => true,
            'data' => [
                'currentPoints' => $points,
                'points'        => $points,
            ],
            'message' => 'Puntos actuales del usuario'
        ], ResponseInterface::HTTP_OK);
    }

    /**
     * GET /api/user/points/history?user_id=10
     * Devuelve historial de puntos (por ahora vacío como fallback).
     */
    public function pointsHistory()
    {
        $userId = $this->request->getGet('user_id')
            ?? $this->request->getGet('idUsuarios')
            ?? $this->request->getGet('id');

        if (!$userId) {
            return $this->failValidationErrors('Parámetro requerido: idUsuarios|user_id|id');
        }

        // TODO: Implementar lectura real de historial cuando exista la tabla
        $history = [];

        return $this->respond([
            'success' => true,
            'history' => $history,
            'message' => 'Historial de puntos (fallback)'
        ], ResponseInterface::HTTP_OK);
    }

    /**
     * GET /api/user/search-by-dni?dni=12345678
     * Busca un usuario por su DNI y devuelve sus datos básicos.
     * Endpoint específico para la funcionalidad de recepción.
     */
    public function searchByDni()
    {
        try {
            $dni = $this->request->getGet('dni');
            
            // Validar que se proporcione el DNI
            if (empty($dni)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'El DNI es requerido'
                ])->setStatusCode(400);
            }
            
            // Validar formato del DNI (8 dígitos)
            if (!preg_match('/^\d{8}$/', $dni)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'El DNI debe tener exactamente 8 dígitos'
                ])->setStatusCode(400);
            }
            
            $usuariosModel = new UsuariosModel();
            $user = $usuariosModel->findByDni($dni);
            
            if (!$user) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Usuario no encontrado con el DNI proporcionado'
                ])->setStatusCode(404);
            }
            
            // Verificar si el usuario está activo
            if ($user['Activo_Usuarios'] != 1) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'El usuario está inactivo y no puede realizar operaciones',
                    'data' => [
                        'user_status' => 'inactive',
                        'dni' => $dni,
                        'name' => $user['Nombres_Usuarios'] . ' ' . $user['Apellidos_Usuarios']
                    ]
                ])->setStatusCode(403);
            }
            
            // Remover la contraseña de la respuesta
            unset($user['Password_Usuarios']);
            
            // Obtener información adicional de dirección si existe
            $userWithAddress = $user;
            if (!empty($user['idDirecciones_Usuarios'])) {
                $db = \Config\Database::connect();
                $builder = $db->table('direcciones d');
                $builder->select([
                    'd.*',
                    'm.Nombres_Municipios',
                    'm.CodigoPostal_Municipios'
                ]);
                $builder->join('municipios m', 'd.idMunicipios_Direcciones = m.idMunicipios', 'left');
                $builder->where('d.idDirecciones', $user['idDirecciones_Usuarios']);
                
                $address = $builder->get()->getRowArray();
                if ($address) {
                    $userWithAddress['direccion'] = $address;
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Usuario encontrado exitosamente',
                'data' => $userWithAddress
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Error en searchByDni: ' . $e->getMessage());
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ])->setStatusCode(500);
        }
    }
}