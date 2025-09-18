<?php

namespace App\Models;

use CodeIgniter\Model;

class TecnicoModel extends Model
{
    protected $table = 'credenciales_tecnico';
    protected $primaryKey = 'id_Credenciales';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'clientes_Tecnico',
        'Certificado_Tecnico',
        'estados_Tecnico'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';

    // Validation
    protected $validationRules = [
        'clientes_Tecnico' => 'required|integer|is_not_unique[usuarios.idUsuarios]',
        'Certificado_Tecnico' => 'required|min_length[3]|max_length[255]',
        'estados_Tecnico' => 'required|integer|is_not_unique[estados.idEstados]'
    ];

    protected $validationMessages = [
        'clientes_Tecnico' => [
            'required' => 'El ID del usuario es obligatorio',
            'integer' => 'El ID del usuario debe ser un número entero',
            'is_not_unique' => 'El usuario especificado no existe'
        ],
        'Certificado_Tecnico' => [
            'required' => 'El certificado técnico es obligatorio',
            'min_length' => 'El certificado debe tener al menos 3 caracteres',
            'max_length' => 'El certificado no puede tener más de 255 caracteres'
        ],
        'estados_Tecnico' => [
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
     * Get technician by user ID
     */
    public function getByUserId(int $userId): ?array
    {
        return $this->where('clientes_Tecnico', $userId)->first();
    }

    /**
     * Get technician with user data
     */
    public function getTechnicianWithUser(int $technicianId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, u.Provincia_Usuarios, u.Municipios_Usuarios, u.Puntos_Usuarios, u.FechaRegistro_Usuarios as user_created_at')
                ->join('usuarios u', 't.clientes_Tecnico = u.idUsuarios')
                ->where('t.id_Credenciales', $technicianId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get technician profile by user ID
     */
    public function getProfileByUserId(int $userId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, u.Provincia_Usuarios, u.Municipios_Usuarios, u.Puntos_Usuarios, u.FechaRegistro_Usuarios as user_created_at')
                ->join('usuarios u', 't.clientes_Tecnico = u.idUsuarios')
                ->where('t.clientes_Tecnico', $userId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get all technicians with pagination
     */
    public function getTechniciansPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio, u.puntos')
                ->join('users u', 't.user_id = u.id');
        
        // Apply filters
        if (!empty($filters['especialidad'])) {
            $builder->where('t.especialidad', $filters['especialidad']);
        }
        
        if (!empty($filters['disponibilidad'])) {
            $builder->where('t.disponibilidad', $filters['disponibilidad']);
        }
        
        if (!empty($filters['provincia'])) {
            $builder->where('u.provincia', $filters['provincia']);
        }
        
        if (!empty($filters['zona_cobertura'])) {
            $builder->like('t.zona_cobertura', $filters['zona_cobertura']);
        }
        
        if (!empty($filters['min_calificacion'])) {
            $builder->where('t.calificacion_promedio >=', $filters['min_calificacion']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('u.nombre', $filters['search'])
                    ->orLike('u.apellido', $filters['search'])
                    ->orLike('t.especialidad', $filters['search'])
                    ->orLike('t.zona_cobertura', $filters['search'])
                    ->groupEnd();
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $technicians = $builder->limit($perPage, $offset)
                              ->orderBy('t.calificacion_promedio', 'DESC')
                              ->orderBy('t.total_trabajos', 'DESC')
                              ->get()
                              ->getResultArray();
        
        return [
            'data' => $technicians,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }

    /**
     * Search technicians
     */
    public function searchTechnicians(string $search, int $limit = 20): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 't.user_id = u.id')
                ->groupStart()
                ->like('u.nombre', $search)
                ->orLike('u.apellido', $search)
                ->orLike('t.especialidad', $search)
                ->orLike('t.zona_cobertura', $search)
                ->groupEnd()
                ->limit($limit)
                ->orderBy('t.calificacion_promedio', 'DESC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get available technicians by location
     */
    public function getAvailableByLocation(string $provincia, string $municipio = null): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 't.user_id = u.id')
                ->where('t.disponibilidad', 'disponible')
                ->where('u.provincia', $provincia);
        
        if ($municipio) {
            $builder->groupStart()
                    ->where('u.municipio', $municipio)
                    ->orLike('t.zona_cobertura', $municipio)
                    ->groupEnd();
        }
        
        $builder->orderBy('t.calificacion_promedio', 'DESC')
                ->orderBy('t.total_trabajos', 'DESC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get technicians by specialty
     */
    public function getBySpecialty(string $specialty): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 't.user_id = u.id')
                ->where('t.especialidad', $specialty)
                ->orderBy('t.calificacion_promedio', 'DESC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get top rated technicians
     */
    public function getTopRated(int $limit = 10): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 't.user_id = u.id')
                ->where('t.calificacion_promedio >', 0)
                ->orderBy('t.calificacion_promedio', 'DESC')
                ->orderBy('t.total_trabajos', 'DESC')
                ->limit($limit);
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get technician statistics
     */
    public function getTechnicianStats(int $technicianId): array
    {
        $technician = $this->find($technicianId);
        if (!$technician) {
            return [];
        }
        
        $db = \Config\Database::connect();
        
        // Get work statistics for this technician
        $workBuilder = $db->table('raee r');
        $workBuilder->where('r.tecnico_asignado_id', $technician['user_id']);
        
        $stats = [
            'total_trabajos_asignados' => $workBuilder->countAllResults(false),
            'trabajos_pendientes' => $workBuilder->where('estado_donacion', 'asignada')->countAllResults(false),
            'trabajos_completados' => $workBuilder->where('estado_donacion', 'completada')->countAllResults(false),
            'trabajos_en_proceso' => $workBuilder->where('estado_donacion', 'en_proceso')->countAllResults(false)
        ];
        
        // Get user points
        $userBuilder = $db->table('users');
        $user = $userBuilder->select('puntos')->where('id', $technician['user_id'])->get()->getRowArray();
        $stats['puntos_acumulados'] = $user['puntos'] ?? 0;
        
        // Get device types worked on
        $workBuilder = $db->table('raee r');
        $deviceTypes = $workBuilder->select('tipo_dispositivo, COUNT(*) as total')
                                 ->where('tecnico_asignado_id', $technician['user_id'])
                                 ->groupBy('tipo_dispositivo')
                                 ->orderBy('total', 'DESC')
                                 ->get()
                                 ->getResultArray();
        
        $stats['tipos_dispositivos_trabajados'] = $deviceTypes;
        
        // Calculate completion rate
        if ($stats['total_trabajos_asignados'] > 0) {
            $stats['tasa_completacion'] = round(($stats['trabajos_completados'] / $stats['total_trabajos_asignados']) * 100, 2);
        } else {
            $stats['tasa_completacion'] = 0;
        }
        
        return $stats;
    }

    /**
     * Update technician availability
     */
    public function updateAvailability(int $userId, string $availability): bool
    {
        $technician = $this->getByUserId($userId);
        if (!$technician) {
            return false;
        }
        
        return $this->update($technician['id'], ['disponibilidad' => $availability]);
    }

    /**
     * Update technician rating
     */
    public function updateRating(int $technicianId, float $newRating): bool
    {
        $technician = $this->find($technicianId);
        if (!$technician) {
            return false;
        }
        
        $currentRating = $technician['calificacion_promedio'] ?? 0;
        $totalJobs = $technician['total_trabajos'] ?? 0;
        
        // Calculate new average rating
        if ($totalJobs > 0) {
            $newAverage = (($currentRating * $totalJobs) + $newRating) / ($totalJobs + 1);
        } else {
            $newAverage = $newRating;
        }
        
        return $this->update($technicianId, [
            'calificacion_promedio' => round($newAverage, 2),
            'total_trabajos' => $totalJobs + 1
        ]);
    }

    /**
     * Get specialties summary
     */
    public function getSpecialtiesSummary(): array
    {
        $builder = $this->builder();
        
        $summary = $builder->select('especialidad, COUNT(*) as total')
                          ->where('especialidad IS NOT NULL')
                          ->where('especialidad !=', '')
                          ->groupBy('especialidad')
                          ->orderBy('total', 'DESC')
                          ->get()
                          ->getResultArray();
        
        return $summary;
    }

    /**
     * Get availability summary
     */
    public function getAvailabilitySummary(): array
    {
        $builder = $this->builder();
        
        $summary = $builder->select('disponibilidad, COUNT(*) as total')
                          ->groupBy('disponibilidad')
                          ->orderBy('total', 'DESC')
                          ->get()
                          ->getResultArray();
        
        return $summary;
    }

    /**
     * Update technician profile
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $technician = $this->getByUserId($userId);
        if (!$technician) {
            return false;
        }
        
        return $this->update($technician['id'], $data);
    }

    /**
     * Check if user has technician profile
     */
    public function hasProfile(int $userId): bool
    {
        return $this->where('user_id', $userId)->countAllResults() > 0;
    }

    /**
     * Get technicians with recent activity
     */
    public function getTechniciansWithRecentActivity(int $days = 30): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, COUNT(r.id) as trabajos_recientes')
                ->join('users u', 't.user_id = u.id')
                ->join('raee r', 'u.id = r.tecnico_asignado_id AND r.fecha_asignacion >= "' . $cutoffDate . '"', 'left')
                ->groupBy('t.id')
                ->having('trabajos_recientes > 0')
                ->orderBy('trabajos_recientes', 'DESC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Validate technician data before save
     */
    public function validateTechnicianData(array $data, int $excludeId = null): array
    {
        $errors = [];
        
        // Check if user already has a technician profile (for new registrations)
        if (!$excludeId && isset($data['user_id'])) {
            if ($this->hasProfile($data['user_id'])) {
                $errors[] = 'Este usuario ya tiene un perfil de técnico registrado';
            }
        }
        
        // Validate tarifa_hora format if provided
        if (!empty($data['tarifa_hora'])) {
            if (!is_numeric($data['tarifa_hora']) || $data['tarifa_hora'] < 0) {
                $errors[] = 'La tarifa por hora debe ser un número positivo';
            }
        }
        
        // Validate experiencia_anos if provided
        if (!empty($data['experiencia_anos'])) {
            if (!is_numeric($data['experiencia_anos']) || $data['experiencia_anos'] < 0) {
                $errors[] = 'Los años de experiencia deben ser un número positivo';
            }
        }
        
        return $errors;
    }

    /**
     * Get technicians by coverage area
     */
    public function getByCoverageArea(string $area): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table . ' t');
        
        $builder->select('t.*, u.nombre, u.apellido, u.email, u.telefono, u.provincia, u.municipio')
                ->join('users u', 't.user_id = u.id')
                ->like('t.zona_cobertura', $area)
                ->orderBy('t.calificacion_promedio', 'DESC');
        
        return $builder->get()->getResultArray();
    }
}