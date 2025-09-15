<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\TecnicoModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class TechnicianController extends BaseController
{
    protected $tecnicoModel;
    
    public function __construct()
    {
        $this->tecnicoModel = new TecnicoModel();
    }

    public function register()
    {
        $json = $this->request->getJSON();
        
        // Validación
        $validation = \Config\Services::validation();
        $validation->setRules([
            'nombre' => 'required|min_length[2]|max_length[100]',
            'apellido' => 'required|min_length[2]|max_length[100]',
            'correoElectronico' => 'required|valid_email|is_unique[tecnicos.correo_electronico]',
            'telefono' => 'required|min_length[10]|max_length[15]',
            'password' => 'required|min_length[6]'
        ]);
        
        if (!$validation->run((array)$json)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validation->getErrors()
            ])->setStatusCode(400);
        }
        
        try {
            // Preparar datos para insertar
            $data = [
                'nombre' => $json->nombre,
                'apellido' => $json->apellido,
                'correo_electronico' => $json->correoElectronico,
                'telefono' => $json->telefono,
                'descripcion_taller' => $json->descripcionTaller ?? null,
                'especialidades' => isset($json->especialidades) ? json_encode($json->especialidades) : null,
                'servicios_ofrecidos' => isset($json->serviciosOfrecidos) ? json_encode($json->serviciosOfrecidos) : null,
                'horarios_atencion' => $json->horariosAtencion ?? null,
                'descripcion_adicional' => $json->descripcionAdicional ?? null,
                'password' => password_hash($json->password, PASSWORD_DEFAULT),
                'estado' => 'activo',
                'fecha_registro' => date('Y-m-d H:i:s')
            ];
            
            $tecnicoId = $this->tecnicoModel->insert($data);
            
            if ($tecnicoId) {
                // Generar JWT token
                $key = getenv('JWT_SECRET') ?: 'your-secret-key';
                $payload = [
                    'iss' => 'raee-app',
                    'aud' => 'raee-users',
                    'iat' => time(),
                    'exp' => time() + (24 * 60 * 60), // 24 horas
                    'data' => [
                        'id' => $tecnicoId,
                        'email' => $json->correoElectronico,
                        'tipo' => 'tecnico'
                    ]
                ];
                
                $token = JWT::encode($payload, $key, 'HS256');
                
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Técnico registrado exitosamente',
                    'data' => [
                        'id' => $tecnicoId,
                        'nombre' => $json->nombre . ' ' . $json->apellido,
                        'email' => $json->correoElectronico,
                        'tipo' => 'tecnico'
                    ],
                    'token' => $token
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al registrar el técnico'
                ])->setStatusCode(500);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    public function getProfile()
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
            
            if ($decoded->data->tipo !== 'tecnico') {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Acceso no autorizado'
                ])->setStatusCode(403);
            }
            
            $tecnico = $this->tecnicoModel->find($decoded->data->id);
            
            if ($tecnico) {
                unset($tecnico['password']);
                // Decodificar arrays JSON
                if ($tecnico['especialidades']) {
                    $tecnico['especialidades'] = json_decode($tecnico['especialidades']);
                }
                if ($tecnico['servicios_ofrecidos']) {
                    $tecnico['servicios_ofrecidos'] = json_decode($tecnico['servicios_ofrecidos']);
                }
                
                return $this->response->setJSON([
                    'success' => true,
                    'data' => $tecnico
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Técnico no encontrado'
                ])->setStatusCode(404);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
    }

    public function updateProfile()
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
            
            if ($decoded->data->tipo !== 'tecnico') {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Acceso no autorizado'
                ])->setStatusCode(403);
            }
            
            $updateData = [];
            
            if (isset($json->nombre)) $updateData['nombre'] = $json->nombre;
            if (isset($json->apellido)) $updateData['apellido'] = $json->apellido;
            if (isset($json->telefono)) $updateData['telefono'] = $json->telefono;
            if (isset($json->descripcionTaller)) $updateData['descripcion_taller'] = $json->descripcionTaller;
            if (isset($json->especialidades)) $updateData['especialidades'] = json_encode($json->especialidades);
            if (isset($json->serviciosOfrecidos)) $updateData['servicios_ofrecidos'] = json_encode($json->serviciosOfrecidos);
            if (isset($json->horariosAtencion)) $updateData['horarios_atencion'] = $json->horariosAtencion;
            if (isset($json->descripcionAdicional)) $updateData['descripcion_adicional'] = $json->descripcionAdicional;
            
            if (!empty($updateData)) {
                $this->tecnicoModel->update($decoded->data->id, $updateData);
                
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Perfil actualizado exitosamente'
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'No hay datos para actualizar'
                ])->setStatusCode(400);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ])->setStatusCode(500);
        }
    }

    public function getAllTechnicians()
    {
        try {
            $tecnicos = $this->tecnicoModel->where('estado', 'activo')->findAll();
            
            // Limpiar datos sensibles y decodificar JSON
            foreach ($tecnicos as &$tecnico) {
                unset($tecnico['password']);
                if ($tecnico['especialidades']) {
                    $tecnico['especialidades'] = json_decode($tecnico['especialidades']);
                }
                if ($tecnico['servicios_ofrecidos']) {
                    $tecnico['servicios_ofrecidos'] = json_decode($tecnico['servicios_ofrecidos']);
                }
            }
            
            return $this->response->setJSON([
                'success' => true,
                'data' => $tecnicos
            ]);
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error al obtener técnicos'
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