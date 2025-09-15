<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserModel;
use App\Models\DonationModel;
use App\Models\TecnicoModel;
use App\Models\InstitucionModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends BaseController
{
    protected $userModel;
    protected $donationModel;
    protected $tecnicoModel;
    protected $institucionModel;
    
    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->donationModel = new DonationModel();
        $this->tecnicoModel = new TecnicoModel();
        $this->institucionModel = new InstitucionModel();
    }

    public function register()
    {
        $json = $this->request->getJSON();
        
        // Log de datos recibidos
        error_log('Datos recibidos en registro: ' . json_encode($json));
        
        // Validación básica
        $validation = \Config\Services::validation();
        $validation->setRules([
            'dni' => 'required|min_length[7]|max_length[20]|is_unique[users.dni]',
            'nombre' => 'required|min_length[2]|max_length[100]',
            'apellido' => 'required|min_length[2]|max_length[100]',
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]',
            'telefono' => 'required|min_length[10]|max_length[20]',
            'provincia' => 'required|max_length[100]',
            'municipio' => 'required|max_length[100]',
            'tipo_usuario' => 'required|in_list[ciudadano,tecnico,institucion,administrador,desarrollador]'
        ]);
        
        if (!$validation->run((array)$json)) {
            error_log('Errores de validación: ' . json_encode($validation->getErrors()));
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validation->getErrors()
            ])->setStatusCode(400);
        }
        
        // Crear usuario base
        $userData = [
            'dni' => $json->dni,
            'nombre' => $json->nombre,
            'apellido' => $json->apellido,
            'email' => $json->email,
            'password' => password_hash($json->password, PASSWORD_DEFAULT),
            'telefono' => $json->telefono,
            'provincia' => $json->provincia,
            'municipio' => $json->municipio,
            'tipo_usuario' => $json->tipo_usuario === 'donante' ? 'ciudadano' : $json->tipo_usuario,
            'puntos' => 0
        ];
        
        // Crear usuario
        
        $db = \Config\Database::connect();
        $db->transStart();
        
        try {
            $userId = $this->userModel->insert($userData);
            
            // Crear registro específico según tipo de usuario
            switch ($json->tipo_usuario) {
                case 'donante':
                case 'ciudadano':
                    // Para donantes, crear registro en tabla RAEE si se proporcionan datos
                    if (isset($json->dispositivo)) {
                        $raeeData = [
                            'user_id' => $userId,
                            'tipo_dispositivo' => $json->dispositivo->tipo_dispositivo ?? '',
                            'marca' => $json->dispositivo->marca ?? '',
                            'modelo' => $json->dispositivo->modelo ?? '',
                            'estado_dispositivo' => $json->dispositivo->estado_dispositivo ?? 'funcional',
                            'descripcion' => $json->dispositivo->descripcion ?? '',
                            'ubicacion_donacion' => $json->dispositivo->ubicacion ?? ''
                        ];
                        $this->donationModel->insert($raeeData);
                    }
                    break;
                    
                case 'tecnico':
                    $tecnicoData = [
                        'user_id' => $userId,
                        'direccion_taller' => $json->direccion_taller ?? '',
                        'especialidades' => json_encode($json->especialidades ?? []),
                        'certificaciones' => json_encode($json->certificaciones ?? []),
                        'horario_atencion' => $json->horario_atencion ?? '',
                        'servicios_ofrecidos' => json_encode($json->servicios_ofrecidos ?? []),
                        'descripcion_servicios' => $json->descripcion_servicios ?? ''
                    ];
                    $this->tecnicoModel->insert($tecnicoData);
                    break;
                    
                case 'institucion':
                    $institucionData = [
                        'user_id' => $userId,
                        'nombre_institucion' => $json->nombre_institucion ?? '',
                        'tipo_institucion' => $json->tipo_institucion ?? '',
                        'direccion' => $json->direccion ?? '',
                        'codigo_postal' => $json->codigo_postal ?? '',
                        'telefono_contacto' => $json->telefono_contacto ?? '',
                        'email_contacto' => $json->email_contacto ?? '',
                        'nombre_responsable' => $json->nombre_responsable ?? '',
                        'descripcion_programas' => $json->descripcion_programas ?? ''
                    ];
                    $this->institucionModel->insert($institucionData);
                    break;
                    
                case 'administrador':
                case 'desarrollador':
                    // Los roles de administrador y desarrollador no requieren tablas específicas adicionales
                    break;
            }
            
            $db->transComplete();
            
            if ($db->transStatus() === false) {
                throw new \Exception('Error en la transacción de base de datos');
            }
            
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user_id' => $userId
            ]);
            
        } catch (\Exception $e) {
            $db->transRollback();
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Error al registrar usuario: ' . $e->getMessage()
            ])->setStatusCode(500);
        }
    }
    
    public function login()
    {
        $json = $this->request->getJSON();
        
        // Log de datos recibidos
        error_log('Datos recibidos en login: ' . json_encode($json));
        
        // Validar datos
        $validation = \Config\Services::validation();
        $validation->setRules([
            'dni' => 'required|min_length[7]|max_length[25]',
            'password' => 'required'
        ]);
        
        if (!$validation->run((array)$json)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'DNI y contraseña son requeridos',
                'errors' => $validation->getErrors()
            ])->setStatusCode(400);
        }
        
        // Buscar usuario
        $user = $this->userModel->where('dni', $json->dni)->first();
        
        if (!$user || !password_verify($json->password, $user['password'])) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ])->setStatusCode(401);
        }
        
        // Generar JWT token
        $key = getenv('JWT_SECRET') ?: 'your-secret-key';
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'tipo_usuario' => $user['tipo_usuario'],
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 horas
        ];
        
        $token = JWT::encode($payload, $key, 'HS256');
        
        // Remover password de la respuesta
        unset($user['password']);
        
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => $user
        ]);
    }
    
    public function profile()
    {
        $userId = $this->getUserIdFromToken();
        
        if (!$userId) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Token inválido'
            ])->setStatusCode(401);
        }
        
        $user = $this->userModel->find($userId);
        
        if (!$user) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ])->setStatusCode(404);
        }
        
        // Remover password
        unset($user['password']);
        
        return $this->response->setJSON([
            'success' => true,
            'user' => $user
        ]);
    }
    
    private function getUserIdFromToken()
    {
        $header = $this->request->getHeaderLine('Authorization');
        
        if (!$header || !preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        $key = getenv('JWT_SECRET') ?: 'your-secret-key';
        
        try {
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            return $decoded->user_id;
        } catch (\Exception $e) {
            return null;
        }
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
