<?php

namespace App\Models;

use CodeIgniter\Model;

class InstitucionModel extends Model
{
    protected $table = 'credenciales_institucion';
    protected $primaryKey = 'id_Institucion';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'clientes_Institucion',
        'NroLegajo_Institucion',
        'Tipo_Institucion',
        'Contacto_Institucion',
        'RegistroTitulo_Institucion',
        'estados_Institucion'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';

    // Validation
    protected $validationRules = [
        'clientes_Institucion' => 'required|integer|is_not_unique[usuarios.idUsuarios]',
        'NroLegajo_Institucion' => 'required|min_length[3]|max_length[45]',
        'Tipo_Institucion' => 'required|integer|in_list[1,2]',
        'Contacto_Institucion' => 'required|min_length[7]|max_length[45]',
        'RegistroTitulo_Institucion' => 'required|min_length[3]|max_length[45]',
        'estados_Institucion' => 'required|integer|is_not_unique[estados.idEstados]'
    ];

    protected $validationMessages = [
        'clientes_Institucion' => [
            'required' => 'El ID del usuario es obligatorio',
            'integer' => 'El ID del usuario debe ser un número entero',
            'is_not_unique' => 'El usuario especificado no existe'
        ],
        'NroLegajo_Institucion' => [
            'required' => 'El número de legajo es obligatorio',
            'min_length' => 'El número de legajo debe tener al menos 3 caracteres',
            'max_length' => 'El número de legajo no puede tener más de 45 caracteres'
        ],
        'Tipo_Institucion' => [
            'required' => 'El tipo de institución es obligatorio',
            'integer' => 'El tipo de institución debe ser un número entero',
            'in_list' => 'El tipo de institución debe ser 1 (Educativa) o 2 (Gubernamental)'
        ],
        'Contacto_Institucion' => [
            'required' => 'El contacto es obligatorio',
            'min_length' => 'El contacto debe tener al menos 7 caracteres',
            'max_length' => 'El contacto no puede tener más de 45 caracteres'
        ],
        'RegistroTitulo_Institucion' => [
            'required' => 'El registro/título es obligatorio',
            'min_length' => 'El registro/título debe tener al menos 3 caracteres',
            'max_length' => 'El registro/título no puede tener más de 45 caracteres'
        ],
        'estados_Institucion' => [
            'required' => 'El estado es obligatorio',
            'integer' => 'El estado debe ser un número entero',
            'is_not_unique' => 'El estado especificado no existe'
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
        return $this->where('clientes_Institucion', $userId)->first();
    }

    /**
     * Get institution with user data
     */
    public function getInstitutionWithUser(int $institutionId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, u.Provincia_Usuarios, u.Municipios_Usuarios, u.Puntos_Usuarios, u.FechaRegistro_Usuarios as user_created_at')
                ->join('usuarios u', 'i.clientes_Institucion = u.idUsuarios')
                ->where('i.id_Institucion', $institutionId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get institution profile by user ID
     */
    public function getProfileByUserId(int $userId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, u.Provincia_Usuarios, u.Municipios_Usuarios, u.Puntos_Usuarios, u.FechaRegistro_Usuarios as user_created_at')
                ->join('usuarios u', 'i.clientes_Institucion = u.idUsuarios')
                ->where('i.clientes_Institucion', $userId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get all institutions with pagination
     */
    public function getInstitutionsPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' i');
        
        $builder->select('i.*, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, u.Provincia_Usuarios, u.Municipios_Usuarios, u.Puntos_Usuarios')
                ->join('usuarios u', 'i.clientes_Institucion = u.idUsuarios');
        
        // Apply filters
        if (!empty($filters['tipo_institucion'])) {
            $builder->where('i.Tipo_Institucion', $filters['tipo_institucion']);
        }
        
        if (!empty($filters['provincia'])) {
            $builder->where('u.Provincia_Usuarios', $filters['provincia']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('i.NroLegajo_Institucion', $filters['search'])
                    ->orLike('u.Nombres_Usuarios', $filters['search'])
                    ->orLike('u.Apellidos_Usuarios', $filters['search'])
                    ->orLike('i.Contacto_Institucion', $filters['search'])
                    ->groupEnd();
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $institutions = $builder->limit($perPage, $offset)
                              ->orderBy('i.id_Institucion', 'DESC')
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