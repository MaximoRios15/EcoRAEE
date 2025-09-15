<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\RaeeModel;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class DonationController extends BaseController
{
    protected $raeeModel;
    protected $userModel;
    
    public function __construct()
    {
        $this->raeeModel = new RaeeModel();
        $this->userModel = new UserModel();
    }

    public function create()
    {
        $token = $this->getTokenFromHeader();
        $json = $this->request->getJSON();
        
        if (!$token) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token no proporcionado'
            ])->setStatusCode(401);
        }
        
        try {
            $key = getenv('JWT_SECRET') ?: 'your-secret-key';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Validación
            $validation = \Config\Services::validation();
            $validation->setRules([
                'tipoDispositivo' => 'required|max_length[100]',
                'marca' => 'required|max_length[100]',
                'modelo' => 'required|max_length[100]',
                'estadoDispositivo' => 'required|max_length[100]'
            ]);
            
            if (!$validation->run((array)$json)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validation->getErrors()
                ])->setStatusCode(400);
            }
            
            // Preparar datos para insertar
            $data = [
                'usuario_id' => $decoded->data->id,
                'tipo_usuario' => $decoded->data->tipo,
                'tipo_dispositivo' => $json->tipoDispositivo,
                'marca' => $json->marca,
                'modelo' => $json->modelo,
                'estado_dispositivo' => $json->estadoDispositivo,
                'fecha_compra' => $json->fechaCompra ?? null,
                'descripcion_adicional' => $json->descripcionAdicional ?? null,
                'preferencias' => $json->preferencias ?? null,
                'informacion_dispositivo' => $json->informacionDispositivo ?? null,
                'estado_donacion' => 'pendiente',
                'fecha_donacion' => date('Y-m-d H:i:s')
            ];
            
            $donacionId = $this->raeeModel->insert($data);
            
            if ($donacionId) {
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Donación registrada exitosamente',
                    'data' => [
                        'id' => $donacionId,
                        'tipo_dispositivo' => $json->tipoDispositivo,
                        'marca' => $json->marca,
                        'modelo' => $json->modelo,
                        'estado' => 'pendiente'
                    ]
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al registrar la donación'
                ])->setStatusCode(500);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    public function getUserDonations()
    {
        $token = $this->getTokenFromHeader();
        
        if (!$token) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token no proporcionado'
            ])->setStatusCode(401);
        }
        
        try {
            $key = getenv('JWT_SECRET') ?: 'your-secret-key';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            $donaciones = $this->raeeModel
                ->where('usuario_id', $decoded->data->id)
                ->where('tipo_usuario', $decoded->data->tipo)
                ->orderBy('fecha_donacion', 'DESC')
                ->findAll();
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $donaciones
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    public function getAllDonations()
    {
        try {
            $donaciones = $this->raeeModel
                ->select('raee.*, users.nombre as donante_nombre, users.email as donante_email')
                ->join('users', 'users.id = raee.usuario_id AND raee.tipo_usuario = "donante"', 'left')
                ->orderBy('fecha_donacion', 'DESC')
                ->findAll();
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $donaciones
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error al obtener donaciones'
            ])->setStatusCode(500);
        }
    }

    public function updateStatus($id)
    {
        $token = $this->getTokenFromHeader();
        $json = $this->request->getJSON();
        
        if (!$token) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token no proporcionado'
            ])->setStatusCode(401);
        }
        
        try {
            $key = getenv('JWT_SECRET') ?: 'your-secret-key';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Solo técnicos e instituciones pueden actualizar el estado
            if (!in_array($decoded->data->tipo, ['tecnico', 'institucion'])) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acción'
                ])->setStatusCode(403);
            }
            
            $validStates = ['pendiente', 'en_proceso', 'completado', 'rechazado'];
            
            if (!isset($json->estado) || !in_array($json->estado, $validStates)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Estado inválido'
                ])->setStatusCode(400);
            }
            
            $updateData = [
                'estado_donacion' => $json->estado,
                'procesado_por_id' => $decoded->data->id,
                'procesado_por_tipo' => $decoded->data->tipo,
                'fecha_procesamiento' => date('Y-m-d H:i:s')
            ];
            
            if (isset($json->notas)) {
                $updateData['notas_procesamiento'] = $json->notas;
            }
            
            $result = $this->raeeModel->update($id, $updateData);
            
            if ($result) {
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Estado actualizado exitosamente'
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al actualizar el estado'
                ])->setStatusCode(500);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ])->setStatusCode(500);
        }
    }

    public function getDonation($id)
    {
        $token = $this->getTokenFromHeader();
        
        if (!$token) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token no proporcionado'
            ])->setStatusCode(401);
        }
        
        try {
            $key = getenv('JWT_SECRET') ?: 'your-secret-key';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            $donacion = $this->raeeModel->find($id);
            
            if (!$donacion) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Donación no encontrada'
                ])->setStatusCode(404);
            }
            
            // Verificar permisos: el donante solo puede ver sus propias donaciones
            if ($decoded->data->tipo === 'donante' && 
                ($donacion['usuario_id'] != $decoded->data->id || $donacion['tipo_usuario'] !== 'donante')) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'No tienes permisos para ver esta donación'
                ])->setStatusCode(403);
            }
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $donacion
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    private function getTokenFromHeader()
    {
        $header = $this->request->getHeaderLine('Authorization');
        if ($header && strpos($header, 'Bearer ') === 0) {
            return substr($header, 7);
        }
        return null;
    }
    
    public function options()
    {
        return $this->response
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->setHeader('Access-Control-Max-Age', '86400')
            ->setStatusCode(200);
    }
}