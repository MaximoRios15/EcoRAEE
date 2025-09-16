<?php

namespace App\Models;

use CodeIgniter\Model;

class InstitucionModel extends Model
{
    protected $table = 'institucions';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'user_id',
        'nombre_institucion',
        'tipo_institucion',
        'direccion',
        'codigo_postal',
        'telefono_contacto',
        'email_contacto',
        'nombre_responsable',
        'descripcion_programas'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [
        'user_id' => 'required|integer|is_not_unique[users.id]|is_unique[institucions.user_id,id,{id}]',
        'nombre_institucion' => 'required|min_length[3]|max_length[200]',
        'tipo_institucion' => 'permit_empty|max_length[100]',
        'direccion' => 'permit_empty|max_length[255]',
        'codigo_postal' => 'permit_empty|max_length[10]',
        'telefono_contacto' => 'permit_empty|min_length[7]|max_length[20]',
        'email_contacto' => 'permit_empty|valid_email|max_length[150]',
        'nombre_responsable' => 'permit_empty|max_length[150]',
        'descripcion_programas' => 'permit_empty'
    ];

    protected $validationMessages = [
        'user_id' => [
            'required' => 'El ID del usuario es obligatorio',
            'integer' => 'El ID del usuario debe ser un número entero',
            'is_not_unique' => 'El usuario especificado no existe',
            'is_unique' => 'Este usuario ya tiene una institución registrada'
        ],
        'nombre_institucion' => [
            'required' => 'El nombre de la institución es obligatorio',
            'min_length' => 'El nombre de la institución debe tener al menos 3 caracteres',
            'max_length' => 'El nombre de la institución no puede tener más de 200 caracteres'
        ],
        'tipo_institucion' => [
            'max_length' => 'El tipo de institución no puede tener más de 100 caracteres'
        ],
        'direccion' => [
            'max_length' => 'La dirección no puede tener más de 255 caracteres'
        ],
        'codigo_postal' => [
            'max_length' => 'El código postal no puede tener más de 10 caracteres'
        ],
        'telefono_contacto' => [
            'min_length' => 'El teléfono debe tener al menos 7 caracteres',
            'max_length' => 'El teléfono no puede tener más de 20 caracteres'
        ],
        'email_contacto' => [
            'valid_email' => 'Debe proporcionar un email válido',
            'max_length' => 'El email no puede tener más de 150 caracteres'
        ],
        'nombre_responsable' => [
            'max_length' => 'El nombre del responsable no puede tener más de 150 caracteres'
        ]
    ];

    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get institution by user ID
     */
    public function getByUserId(int $userId): ?array
    {
        return $this->where('user_id', $userId)->first();
    }

    /**
     * Get institution with user data
     */
    public function getInstitutionWithUser(int $institutionId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio, u.puntos, u.created_at as user_created_at')
                ->join('users u', 'i.user_id = u.id')
                ->where('i.id', $institutionId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get institution profile by user ID
     */
    public function getProfileByUserId(int $userId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio, u.puntos, u.created_at as user_created_at')
                ->join('users u', 'i.user_id = u.id')
                ->where('i.user_id', $userId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get all institutions with pagination
     */
    public function getInstitutionsPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio, u.puntos')
                ->join('users u', 'i.user_id = u.id');
        
        // Apply filters
        if (!empty($filters['tipo_institucion'])) {
            $builder->where('i.tipo_institucion', $filters['tipo_institucion']);
        }
        
        if (!empty($filters['provincia'])) {
            $builder->where('u.provincia', $filters['provincia']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('i.nombre_institucion', $filters['search'])
                    ->orLike('u.nombre', $filters['search'])
                    ->orLike('u.apellido', $filters['search'])
                    ->orLike('i.nombre_responsable', $filters['search'])
                    ->groupEnd();
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $institutions = $builder->limit($perPage, $offset)
                              ->orderBy('i.created_at', 'DESC')
                              ->get()
                              ->getResultArray();
        
        return [
            'data' => $institutions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }

    /**
     * Search institutions
     */
    public function searchInstitutions(string $search, int $limit = 20): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 'i.user_id = u.id')
                ->groupStart()
                ->like('i.nombre_institucion', $search)
                ->orLike('u.nombre', $search)
                ->orLike('u.apellido', $search)
                ->orLike('i.nombre_responsable', $search)
                ->orLike('i.tipo_institucion', $search)
                ->groupEnd()
                ->limit($limit)
                ->orderBy('i.nombre_institucion', 'ASC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get institutions by type
     */
    public function getByType(string $type): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 'i.user_id = u.id')
                ->where('i.tipo_institucion', $type)
                ->orderBy('i.nombre_institucion', 'ASC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get institution statistics
     */
    public function getInstitutionStats(int $institutionId): array
    {
        $institution = $this->find($institutionId);
        if (!$institution) {
            return [];
        }
        
        $db = \Config\Database::connect();
        
        // Get donation statistics for this institution
        $donationBuilder = $db->table('raee r');
        $donationBuilder->where('r.usuario_id', $institution['user_id']);
        
        $stats = [
            'total_donaciones' => $donationBuilder->countAllResults(false),
            'donaciones_pendientes' => $donationBuilder->where('estado_donacion', 'pendiente')->countAllResults(false),
            'donaciones_completadas' => $donationBuilder->where('estado_donacion', 'completada')->countAllResults(false)
        ];
        
        // Get user points
        $userBuilder = $db->table('users');
        $user = $userBuilder->select('puntos')->where('id', $institution['user_id'])->get()->getRowArray();
        $stats['puntos_acumulados'] = $user['puntos'] ?? 0;
        
        // Get donation types
        $donationBuilder = $db->table('raee r');
        $deviceTypes = $donationBuilder->select('tipo_dispositivo, COUNT(*) as total')
                                     ->where('usuario_id', $institution['user_id'])
                                     ->groupBy('tipo_dispositivo')
                                     ->orderBy('total', 'DESC')
                                     ->get()
                                     ->getResultArray();
        
        $stats['tipos_dispositivos'] = $deviceTypes;
        
        return $stats;
    }

    /**
     * Get institution types summary
     */
    public function getInstitutionTypesSummary(): array
    {
        $builder = $this->builder();
        
        $summary = $builder->select('tipo_institucion, COUNT(*) as total')
                          ->where('tipo_institucion IS NOT NULL')
                          ->where('tipo_institucion !=', '')
                          ->groupBy('tipo_institucion')
                          ->orderBy('total', 'DESC')
                          ->get()
                          ->getResultArray();
        
        return $summary;
    }

    /**
     * Update institution profile
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $institution = $this->getByUserId($userId);
        if (!$institution) {
            return false;
        }
        
        return $this->update($institution['id'], $data);
    }

    /**
     * Check if user has institution profile
     */
    public function hasProfile(int $userId): bool
    {
        return $this->where('user_id', $userId)->countAllResults() > 0;
    }

    /**
     * Get institutions with recent activity
     */
    public function getInstitutionsWithRecentActivity(int $days = 30): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        
        $builder->select('i.*, u.nombre, u.apellido, u.email, COUNT(r.id) as donaciones_recientes')
                ->join('users u', 'i.user_id = u.id')
                ->join('raee r', 'u.id = r.usuario_id AND r.fecha_solicitud >= "' . $cutoffDate . '"', 'left')
                ->groupBy('i.id')
                ->having('donaciones_recientes > 0')
                ->orderBy('donaciones_recientes', 'DESC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get top institutions by donations
     */
    public function getTopInstitutionsByDonations(int $limit = 10): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.nombre, u.apellido, u.puntos, COUNT(r.id) as total_donaciones')
                ->join('users u', 'i.user_id = u.id')
                ->join('raee r', 'u.id = r.usuario_id', 'left')
                ->groupBy('i.id')
                ->orderBy('total_donaciones', 'DESC')
                ->limit($limit);
        
        return $builder->get()->getResultArray();
    }

    /**
     * Validate institution data before save
     */
    public function validateInstitutionData(array $data, int $excludeId = null): array
    {
        $errors = [];
        
        // Check if user already has an institution (for new registrations)
        if (!$excludeId && isset($data['user_id'])) {
            if ($this->hasProfile($data['user_id'])) {
                $errors[] = 'Este usuario ya tiene una institución registrada';
            }
        }
        
        // Validate email format if provided
        if (!empty($data['email_contacto'])) {
            if (!filter_var($data['email_contacto'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'El email de contacto no tiene un formato válido';
            }
        }
        
        // Validate phone format if provided
        if (!empty($data['telefono_contacto'])) {
            if (!preg_match('/^[0-9+\-\s()]+$/', $data['telefono_contacto'])) {
                $errors[] = 'El teléfono de contacto contiene caracteres no válidos';
            }
        }
        
        return $errors;
    }
}