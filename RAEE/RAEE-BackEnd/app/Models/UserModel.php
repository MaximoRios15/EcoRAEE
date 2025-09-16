<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'dni',
        'nombre',
        'apellido',
        'email',
        'password',
        'telefono',
        'provincia',
        'municipio',
        'tipo_usuario',
        'puntos',
        'activo'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $deletedField = 'deleted_at';

    // Validation
    protected $validationRules = [
        'dni' => 'required|min_length[7]|max_length[20]|is_unique[users.dni,id,{id}]',
        'nombre' => 'required|min_length[2]|max_length[100]',
        'apellido' => 'required|min_length[2]|max_length[100]',
        'email' => 'required|valid_email|is_unique[users.email,id,{id}]',
        'password' => 'required|min_length[6]',
        'telefono' => 'permit_empty|min_length[7]|max_length[20]',
        'provincia' => 'permit_empty|max_length[100]',
        'municipio' => 'permit_empty|max_length[100]',
        'tipo_usuario' => 'required|in_list[ciudadano,institucion,tecnico]',
        'puntos' => 'permit_empty|integer|greater_than_equal_to[0]',
        'activo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'dni' => [
            'required' => 'El DNI es obligatorio',
            'min_length' => 'El DNI debe tener al menos 7 caracteres',
            'max_length' => 'El DNI no puede tener más de 20 caracteres',
            'is_unique' => 'Este DNI ya está registrado en el sistema'
        ],
        'nombre' => [
            'required' => 'El nombre es obligatorio',
            'min_length' => 'El nombre debe tener al menos 2 caracteres',
            'max_length' => 'El nombre no puede tener más de 100 caracteres'
        ],
        'apellido' => [
            'required' => 'El apellido es obligatorio',
            'min_length' => 'El apellido debe tener al menos 2 caracteres',
            'max_length' => 'El apellido no puede tener más de 100 caracteres'
        ],
        'email' => [
            'required' => 'El email es obligatorio',
            'valid_email' => 'Debe proporcionar un email válido',
            'is_unique' => 'Este email ya está registrado en el sistema'
        ],
        'password' => [
            'required' => 'La contraseña es obligatoria',
            'min_length' => 'La contraseña debe tener al menos 6 caracteres'
        ],
        'telefono' => [
            'min_length' => 'El teléfono debe tener al menos 7 caracteres',
            'max_length' => 'El teléfono no puede tener más de 20 caracteres'
        ],
        'tipo_usuario' => [
            'required' => 'El tipo de usuario es obligatorio',
            'in_list' => 'El tipo de usuario debe ser: ciudadano, institucion o tecnico'
        ],
        'puntos' => [
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
        if (isset($data['data']['password']) && !empty($data['data']['password'])) {
            $data['data']['password'] = password_hash($data['data']['password'], PASSWORD_DEFAULT);
        }
        return $data;
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email)
    {
        return $this->where('email', $email)->first();
    }

    /**
     * Find user by DNI
     */
    public function findByDni(string $dni)
    {
        return $this->where('dni', $dni)->first();
    }

    /**
     * Verify user password
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Get users by type
     */
    public function getUsersByType(string $type)
    {
        return $this->where('tipo_usuario', $type)->findAll();
    }

    /**
     * Update user points
     */
    public function updatePoints(int $userId, int $points): bool
    {
        return $this->update($userId, ['puntos' => $points]);
    }

    /**
     * Add points to user
     */
    public function addPoints(int $userId, int $pointsToAdd): bool
    {
        $user = $this->find($userId);
        if (!$user) {
            return false;
        }
        
        $newPoints = $user['puntos'] + $pointsToAdd;
        return $this->update($userId, ['puntos' => $newPoints]);
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
    public function searchUsers(string $search, string $type = null, int $limit = 20, int $offset = 0): array
    {
        $builder = $this->builder();
        
        $builder->groupStart()
                ->like('nombre', $search)
                ->orLike('apellido', $search)
                ->orLike('email', $search)
                ->orLike('dni', $search)
                ->groupEnd();
        
        if ($type) {
            $builder->where('tipo_usuario', $type);
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
        
        // Get additional data based on user type
        switch ($user['tipo_usuario']) {
            case 'institucion':
                $institutionBuilder = $db->table('institucions');
                $institution = $institutionBuilder->where('user_id', $userId)->get()->getRowArray();
                $user['institucion_data'] = $institution;
                break;
                
            case 'tecnico':
                $technicianBuilder = $db->table('tecnicos');
                $technician = $technicianBuilder->where('user_id', $userId)->get()->getRowArray();
                $user['tecnico_data'] = $technician;
                break;
        }
        
        // Get user statistics
        $user['estadisticas'] = $this->getUserStats($userId);
        
        // Remove password from response
        unset($user['password']);
        
        return $user;
    }

    /**
     * Check if email exists (excluding current user)
     */
    public function emailExists(string $email, int $excludeId = null): bool
    {
        $builder = $this->builder();
        $builder->where('email', $email);
        
        if ($excludeId) {
            $builder->where('id !=', $excludeId);
        }
        
        return $builder->countAllResults() > 0;
    }

    /**
     * Check if DNI exists (excluding current user)
     */
    public function dniExists(string $dni, int $excludeId = null): bool
    {
        $builder = $this->builder();
        $builder->where('dni', $dni);
        
        if ($excludeId) {
            $builder->where('id !=', $excludeId);
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
        if (!empty($filters['tipo_usuario'])) {
            $builder->where('tipo_usuario', $filters['tipo_usuario']);
        }
        
        if (!empty($filters['provincia'])) {
            $builder->where('provincia', $filters['provincia']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('nombre', $filters['search'])
                    ->orLike('apellido', $filters['search'])
                    ->orLike('email', $filters['search'])
                    ->groupEnd();
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $users = $builder->limit($perPage, $offset)
                        ->orderBy('created_at', 'DESC')
                        ->get()
                        ->getResultArray();
        
        // Remove passwords from results
        foreach ($users as &$user) {
            unset($user['password']);
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