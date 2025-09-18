<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'idUsuarios';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'DNI_Usuarios',
        'Nombres_Usuarios',
        'Apellidos_Usuarios',
        'Password_Usuarios',
        'Telefono_Usuarios',
        'Email_Usuarios',
        'Provincia_Usuarios',
        'Municipios_Usuarios',
        'Roles_Usuarios',
        'Puntos_Usuarios',
        'FechaRegistro_Usuarios',
        'Activo_Usuarios'
    ];

    // Dates
    protected $useTimestamps = false; // La tabla usa FechaRegistro_Usuarios
    protected $dateFormat = 'datetime';

    // Validation
    protected $validationRules = [
        'DNI_Usuarios' => 'required|min_length[7]|max_length[10]|is_unique[usuarios.DNI_Usuarios,idUsuarios,{idUsuarios}]',
        'Nombres_Usuarios' => 'required|min_length[2]|max_length[50]',
        'Apellidos_Usuarios' => 'required|min_length[2]|max_length[50]',
        'Email_Usuarios' => 'required|valid_email|is_unique[usuarios.Email_Usuarios,idUsuarios,{idUsuarios}]',
        'Password_Usuarios' => 'required|min_length[6]|max_length[255]',
        'Telefono_Usuarios' => 'required|min_length[7]|max_length[14]',
        'Provincia_Usuarios' => 'required|max_length[45]',
        'Municipios_Usuarios' => 'required|max_length[45]',
        'Roles_Usuarios' => 'required|integer',
        'Puntos_Usuarios' => 'permit_empty|integer|greater_than_equal_to[0]',
        'Activo_Usuarios' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'DNI_Usuarios' => [
            'required' => 'El DNI es obligatorio',
            'min_length' => 'El DNI debe tener al menos 7 caracteres',
            'max_length' => 'El DNI no puede tener más de 10 caracteres',
            'is_unique' => 'Este DNI ya está registrado en el sistema'
        ],
        'Nombres_Usuarios' => [
            'required' => 'El nombre es obligatorio',
            'min_length' => 'El nombre debe tener al menos 2 caracteres',
            'max_length' => 'El nombre no puede tener más de 50 caracteres'
        ],
        'Apellidos_Usuarios' => [
            'required' => 'El apellido es obligatorio',
            'min_length' => 'El apellido debe tener al menos 2 caracteres',
            'max_length' => 'El apellido no puede tener más de 50 caracteres'
        ],
        'Email_Usuarios' => [
            'required' => 'El email es obligatorio',
            'valid_email' => 'Debe proporcionar un email válido',
            'is_unique' => 'Este email ya está registrado en el sistema'
        ],
        'Password_Usuarios' => [
            'required' => 'La contraseña es obligatoria',
            'min_length' => 'La contraseña debe tener al menos 6 caracteres',
            'max_length' => 'La contraseña no puede tener más de 25 caracteres'
        ],
        'Telefono_Usuarios' => [
            'required' => 'El teléfono es obligatorio',
            'min_length' => 'El teléfono debe tener al menos 7 caracteres',
            'max_length' => 'El teléfono no puede tener más de 14 caracteres'
        ],
        'Provincia_Usuarios' => [
            'required' => 'La provincia es obligatoria',
            'max_length' => 'La provincia no puede tener más de 45 caracteres'
        ],
        'Municipios_Usuarios' => [
            'required' => 'El municipio es obligatorio',
            'max_length' => 'El municipio no puede tener más de 45 caracteres'
        ],
        'Roles_Usuarios' => [
            'required' => 'El rol es obligatorio',
            'integer' => 'El rol debe ser un número entero'
        ],
        'Puntos_Usuarios' => [
            'integer' => 'Los puntos deben ser un número entero',
            'greater_than_equal_to' => 'Los puntos no pueden ser negativos'
        ]
    ];

    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = ['hashPassword'];
    protected $beforeUpdate = ['hashPassword'];

    /**
     * Hash password before saving
     */
    protected function hashPassword(array $data)
    {
        // CodeIgniter 4 callbacks receive data in $data['data']
        if (isset($data['data']['Password_Usuarios']) && !empty($data['data']['Password_Usuarios'])) {
            $data['data']['Password_Usuarios'] = password_hash($data['data']['Password_Usuarios'], PASSWORD_DEFAULT);
        }
        return $data;
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email)
    {
        return $this->where('Email_Usuarios', $email)->first();
    }

    /**
     * Find user by DNI
     */
    public function findByDni(string $dni)
    {
        return $this->where('DNI_Usuarios', $dni)->first();
    }

    /**
     * Verify user password
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Get users by role
     */
    public function getUsersByRole(int $roleId)
    {
        return $this->where('Roles_Usuarios', $roleId)->findAll();
    }

    /**
     * Update user points
     */
    public function updatePoints(int $userId, int $points): bool
    {
        return $this->update($userId, ['Puntos_Usuarios' => $points]);
    }

    /**
     * Add points to user
     */
    public function addPoints(int $userId, int $pointsToAdd): bool
    {
        $user = $this->find($userId);
        if (!$user) {
            log_message('error', 'User not found for addPoints: ' . $userId);
            return false;
        }
        
        // Handle NULL points (treat as 0)
        $currentPoints = $user['Puntos_Usuarios'] ?? 0;
        $newPoints = $currentPoints + $pointsToAdd;
        
        log_message('debug', 'Adding points - User: ' . $userId . ', Current: ' . $currentPoints . ', Adding: ' . $pointsToAdd . ', New: ' . $newPoints);
        
        $result = $this->update($userId, ['Puntos_Usuarios' => $newPoints]);
        
        if (!$result) {
            log_message('error', 'Failed to update points for user: ' . $userId . ', Error: ' . json_encode($this->errors()));
        }
        
        return $result;
    }

    /**
     * Get user statistics
     */
    public function getUserStats(int $userId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('vista_estadisticas_usuario');
        return $builder->where('id', $userId)->get()->getRowArray() ?? [];
    }

    /**
     * Search users
     */
    public function searchUsers(string $search, int $roleId = null, int $limit = 20, int $offset = 0): array
    {
        $builder = $this->builder();
        
        $builder->groupStart()
                ->like('Nombres_Usuarios', $search)
                ->orLike('Apellidos_Usuarios', $search)
                ->orLike('Email_Usuarios', $search)
                ->orLike('DNI_Usuarios', $search)
                ->groupEnd();
        
        if ($roleId) {
            $builder->where('Roles_Usuarios', $roleId);
        }
        
        return $builder->limit($limit, $offset)->get()->getResultArray();
    }

    /**
     * Get user profile with related data
     */
    public function getUserProfile(int $userId): array
    {
        $user = $this->find($userId);
        if (!$user) {
            return [];
        }

        $db = \Config\Database::connect();
        
        // Get additional data based on user role
        // Assuming role 2 = institucion, role 3 = tecnico (you may need to adjust these)
        switch ($user['Roles_Usuarios']) {
            case 2: // institucion
                $institutionBuilder = $db->table('credenciales_institucion');
                $institution = $institutionBuilder->where('clientes_Institucion', $userId)->get()->getRowArray();
                $user['institucion_data'] = $institution;
                break;
                
            case 3: // tecnico
                $technicianBuilder = $db->table('credenciales_tecnico');
                $technician = $technicianBuilder->where('clientes_Tecnico', $userId)->get()->getRowArray();
                $user['tecnico_data'] = $technician;
                break;
        }
        
        // Get user statistics
        $user['estadisticas'] = $this->getUserStats($userId);
        
        // Remove password from response
        unset($user['Password_Usuarios']);
        
        return $user;
    }

    /**
     * Check if email exists (excluding current user)
     */
    public function emailExists(string $email, int $excludeId = null): bool
    {
        $builder = $this->builder();
        $builder->where('Email_Usuarios', $email);
        
        if ($excludeId) {
            $builder->where('idUsuarios !=', $excludeId);
        }
        
        return $builder->countAllResults() > 0;
    }

    /**
     * Check if DNI exists (excluding current user)
     */
    public function dniExists(string $dni, int $excludeId = null): bool
    {
        $builder = $this->builder();
        $builder->where('DNI_Usuarios', $dni);
        
        if ($excludeId) {
            $builder->where('idUsuarios !=', $excludeId);
        }
        
        return $builder->countAllResults() > 0;
    }

    /**
     * Get users with pagination
     */
    public function getUsersPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $builder = $this->builder();
        
        // Apply filters
        if (!empty($filters['Roles_Usuarios'])) {
            $builder->where('Roles_Usuarios', $filters['Roles_Usuarios']);
        }
        
        if (!empty($filters['Provincia_Usuarios'])) {
            $builder->where('Provincia_Usuarios', $filters['Provincia_Usuarios']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('Nombres_Usuarios', $filters['search'])
                    ->orLike('Apellidos_Usuarios', $filters['search'])
                    ->orLike('Email_Usuarios', $filters['search'])
                    ->groupEnd();
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $users = $builder->limit($perPage, $offset)
                        ->orderBy('FechaRegistro_Usuarios', 'DESC')
                        ->get()
                        ->getResultArray();
        
        // Remove passwords from results
        foreach ($users as &$user) {
            unset($user['Password_Usuarios']);
        }
        
        return [
            'data' => $users,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }
}