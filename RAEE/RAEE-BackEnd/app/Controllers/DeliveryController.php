<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\RaeeModel;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class DeliveryController extends BaseController
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
                'direccion' => 'required|max_length[255]',
                'ciudad' => 'required|max_length[100]',
                'codigoPostal' => 'required|max_length[20]',
                'telefono' => 'required|max_length[20]',
                'fechaEntrega' => 'required|valid_date',
                'horaEntrega' => 'required'
            ]);
            
            if (!$validation->run((array)$json)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validation->getErrors()
                ])->setStatusCode(400);
            }
            
            // Verificar que la fecha de entrega no sea en el pasado
            $fechaEntrega = date('Y-m-d', strtotime($json->fechaEntrega));
            $fechaActual = date('Y-m-d');
            
            if ($fechaEntrega < $fechaActual) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'La fecha de entrega no puede ser en el pasado'
                ])->setStatusCode(400);
            }
            
            // Preparar datos para insertar
            $data = [
                'usuario_id' => $decoded->data->id,
                'tipo_usuario' => $decoded->data->tipo,
                'tipo_dispositivo' => $json->tipoDispositivo ?? 'No especificado',
                'marca' => $json->marca ?? 'No especificada',
                'modelo' => $json->modelo ?? 'No especificado',
                'estado_dispositivo' => $json->estadoDispositivo ?? 'No especificado',
                'direccion_entrega' => $json->direccion,
                'ciudad_entrega' => $json->ciudad,
                'codigo_postal_entrega' => $json->codigoPostal,
                'telefono_entrega' => $json->telefono,
                'fecha_entrega_solicitada' => $fechaEntrega,
                'hora_entrega_solicitada' => $json->horaEntrega,
                'instrucciones_entrega' => $json->instruccionesEspeciales ?? null,
                'estado_entrega' => 'pendiente',
                'fecha_solicitud' => date('Y-m-d H:i:s'),
                'tipo_solicitud' => 'entrega'
            ];
            
            $entregaId = $this->raeeModel->insert($data);
            
            if ($entregaId) {
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Solicitud de entrega registrada exitosamente',
                    'data' => [
                        'id' => $entregaId,
                        'fecha_entrega' => $fechaEntrega,
                        'hora_entrega' => $json->horaEntrega,
                        'estado' => 'pendiente'
                    ]
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al registrar la solicitud de entrega'
                ])->setStatusCode(500);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    public function getUserDeliveries()
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
            
            $entregas = $this->raeeModel
                ->where('usuario_id', $decoded->data->id)
                ->where('tipo_usuario', $decoded->data->tipo)
                ->where('tipo_solicitud', 'entrega')
                ->orderBy('fecha_solicitud', 'DESC')
                ->findAll();
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $entregas
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    public function getAllDeliveries()
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
            
            // Solo técnicos e instituciones pueden ver todas las entregas
            if (!in_array($decoded->data->tipo, ['tecnico', 'institucion'])) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acción'
                ])->setStatusCode(403);
            }
            
            $entregas = $this->raeeModel
                ->select('raee.*, users.nombre as solicitante_nombre, users.email as solicitante_email')
                ->join('users', 'users.id = raee.usuario_id', 'left')
                ->where('tipo_solicitud', 'entrega')
                ->orderBy('fecha_solicitud', 'DESC')
                ->findAll();
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $entregas
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error al obtener entregas'
            ])->setStatusCode(500);
        }
    }

    public function updateDeliveryStatus($id)
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
            
            $validStates = ['pendiente', 'asignado', 'en_camino', 'entregado', 'cancelado'];
            
            if (!isset($json->estado) || !in_array($json->estado, $validStates)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Estado inválido'
                ])->setStatusCode(400);
            }
            
            $updateData = [
                'estado_entrega' => $json->estado,
                'procesado_por_id' => $decoded->data->id,
                'procesado_por_tipo' => $decoded->data->tipo,
                'fecha_procesamiento' => date('Y-m-d H:i:s')
            ];
            
            if (isset($json->notas)) {
                $updateData['notas_entrega'] = $json->notas;
            }
            
            if (isset($json->tecnicoAsignado)) {
                $updateData['tecnico_asignado_id'] = $json->tecnicoAsignado;
            }
            
            if ($json->estado === 'entregado' && isset($json->fechaEntregaReal)) {
                $updateData['fecha_entrega_real'] = $json->fechaEntregaReal;
            }
            
            $result = $this->raeeModel->update($id, $updateData);
            
            if ($result) {
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Estado de entrega actualizado exitosamente'
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al actualizar el estado de entrega'
                ])->setStatusCode(500);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ])->setStatusCode(500);
        }
    }

    public function getDelivery($id)
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
            
            $entrega = $this->raeeModel->find($id);
            
            if (!$entrega || $entrega['tipo_solicitud'] !== 'entrega') {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Entrega no encontrada'
                ])->setStatusCode(404);
            }
            
            // Verificar permisos: el solicitante solo puede ver sus propias entregas
            if ($decoded->data->tipo === 'donante' && 
                ($entrega['usuario_id'] != $decoded->data->id || $entrega['tipo_usuario'] !== 'donante')) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'No tienes permisos para ver esta entrega'
                ])->setStatusCode(403);
            }
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $entrega
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    public function getAvailableTimeSlots()
    {
        $date = $this->request->getGet('date');
        
        if (!$date) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Fecha requerida'
            ])->setStatusCode(400);
        }
        
        try {
            // Obtener entregas ya programadas para esa fecha
            $entregasProgramadas = $this->raeeModel
                ->where('fecha_entrega_solicitada', $date)
                ->where('tipo_solicitud', 'entrega')
                ->where('estado_entrega !=', 'cancelado')
                ->findAll();
            
            // Horarios disponibles (ejemplo: de 8:00 a 18:00)
            $horariosDisponibles = [
                '08:00', '09:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
            ];
            
            // Remover horarios ya ocupados
            $horariosOcupados = array_column($entregasProgramadas, 'hora_entrega_solicitada');
            $horariosLibres = array_diff($horariosDisponibles, $horariosOcupados);
            
            return $this->response->setJSON([
                'success' => true,
                'data' => [
                    'fecha' => $date,
                    'horarios_disponibles' => array_values($horariosLibres)
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error al obtener horarios disponibles'
            ])->setStatusCode(500);
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