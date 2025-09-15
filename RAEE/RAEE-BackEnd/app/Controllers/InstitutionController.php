<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\InstitucionModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class InstitutionController extends BaseController
{
    protected $institucionModel;
    
    public function __construct()
    {
        $this->institucionModel = new InstitucionModel();
    }

    public function register()
    {
        $json = $this->request->getJSON();
        
        // Validación
        $validation = \Config\Services::validation();
        $validation->setRules([
            'nombreInstitucion' => 'required|min_length[2]|max_length[200]',
            'tipoInstitucion' => 'required|max_length[100]',
            'nit' => 'required|is_unique[instituciones.nit]',
            'correoElectronico' => 'required|valid_email|is_unique[instituciones.correo_electronico]',
            'telefono' => 'required|min_length[10]|max_length[15]',
            'nombreResponsable' => 'required|min_length[2]|max_length[100]',
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
                'nombre_institucion' => $json->nombreInstitucion,
                'tipo_institucion' => $json->tipoInstitucion,
                'nit' => $json->nit,
                'codigo_postal' => $json->codigoPostal ?? null,
                'telefono' => $json->telefono,
                'telefono_contacto' => $json->telefonoContacto ?? null,
                'correo_electronico' => $json->correoElectronico,
                'nombre_responsable' => $json->nombreResponsable,
                'descripcion_actividades' => $json->descripcionActividades ?? null,
                'razon_social' => $json->razonSocial ?? null,
                'descripcion_institucion' => $json->descripcionInstitucion ?? null,
                'logo_institucion' => $json->logoInstitucion ?? null,
                'password' => password_hash($json->password, PASSWORD_DEFAULT),
                'estado' => 'activo',
                'fecha_registro' => date('Y-m-d H:i:s')
            ];
            
            $institucionId = $this->institucionModel->insert($data);
            
            if ($institucionId) {
                // Generar JWT token
                $key = getenv('JWT_SECRET') ?: 'your-secret-key';
                $payload = [
                    'iss' => 'raee-app',
                    'aud' => 'raee-users',
                    'iat' => time(),
                    'exp' => time() + (24 * 60 * 60), // 24 horas
                    'data' => [
                        'id' => $institucionId,
                        'email' => $json->correoElectronico,
                        'tipo' => 'institucion'
                    ]
                ];
                
                $token = JWT::encode($payload, $key, 'HS256');
                
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Institución registrada exitosamente',
                    'data' => [
                        'id' => $institucionId,
                        'nombre' => $json->nombreInstitucion,
                        'email' => $json->correoElectronico,
                        'tipo' => 'institucion'
                    ],
                    'token' => $token
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Error al registrar la institución'
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
            
            if ($decoded->data->tipo !== 'institucion') {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Acceso no autorizado'
                ])->setStatusCode(403);
            }
            
            $institucion = $this->institucionModel->find($decoded->data->id);
            
            if ($institucion) {
                unset($institucion['password']);
                return $this->response->setJSON([
                    'success' => true,
                    'data' => $institucion
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Institución no encontrada'
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
            
            if ($decoded->data->tipo !== 'institucion') {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Acceso no autorizado'
                ])->setStatusCode(403);
            }
            
            $updateData = [];
            
            if (isset($json->nombreInstitucion)) $updateData['nombre_institucion'] = $json->nombreInstitucion;
            if (isset($json->tipoInstitucion)) $updateData['tipo_institucion'] = $json->tipoInstitucion;
            if (isset($json->telefono)) $updateData['telefono'] = $json->telefono;
            if (isset($json->descripcionActividades)) $updateData['descripcion_actividades'] = $json->descripcionActividades;
            if (isset($json->descripcionInstitucion)) $updateData['descripcion_institucion'] = $json->descripcionInstitucion;
            
            if (!empty($updateData)) {
                $this->institucionModel->update($decoded->data->id, $updateData);
                
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