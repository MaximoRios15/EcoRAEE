<?php

namespace App\Models;

use CodeIgniter\Model;

class DonationModel extends Model
{
    protected $table = 'raee';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'usuario_id',
        'tipo_usuario',
        'tipo_dispositivo',
        'marca',
        'modelo',
        'estado_dispositivo',
        'descripcion',
        'descripcion_adicional',
        'ubicacion_donacion',
        'fecha_estimada_donacion',
        'estado_donacion',
        'fecha_donacion',
        'fecha_compra',
        'preferencias',
        'informacion_dispositivo',
        'procesado_por_id',
        'procesado_por_tipo',
        'fecha_procesamiento',
        'notas_procesamiento',
        'direccion_entrega',
        'ciudad_entrega',
        'codigo_postal_entrega',
        'telefono_entrega',
        'fecha_entrega_solicitada',
        'hora_entrega_solicitada',
        'instrucciones_entrega',
        'estado_entrega',
        'tipo_solicitud',
        'notas_entrega',
        'tecnico_asignado_id',
        'fecha_entrega_real'
    ];

    // Dates
    protected $useTimestamps = false; // Using custom timestamp field
    protected $dateFormat = 'datetime';

    // Validation
    protected $validationRules = [
        'usuario_id' => 'required|integer|is_not_unique[users.id]',
        'tipo_dispositivo' => 'required|min_length[2]|max_length[100]',
        'estado_dispositivo' => 'permit_empty|max_length[50]',
        'descripcion' => 'permit_empty',
        'ubicacion_donacion' => 'permit_empty|max_length[255]',
        'fecha_estimada_donacion' => 'permit_empty|valid_date',
        'estado_donacion' => 'permit_empty|in_list[pendiente,procesada,en_transito,completada,cancelada]',
        'direccion_entrega' => 'permit_empty|max_length[255]',
        'ciudad_entrega' => 'permit_empty|max_length[100]',
        'telefono_entrega' => 'permit_empty|max_length[20]'
    ];

    protected $validationMessages = [
        'usuario_id' => [
            'required' => 'El ID del usuario es obligatorio',
            'integer' => 'El ID del usuario debe ser un número entero',
            'is_not_unique' => 'El usuario especificado no existe'
        ],
        'tipo_dispositivo' => [
            'required' => 'El tipo de dispositivo es obligatorio',
            'min_length' => 'El tipo de dispositivo debe tener al menos 2 caracteres',
            'max_length' => 'El tipo de dispositivo no puede tener más de 100 caracteres'
        ],
        'estado_donacion' => [
            'in_list' => 'El estado de donación debe ser: pendiente, procesada, en_transito, completada o cancelada'
        ],
        'fecha_estimada_donacion' => [
            'valid_date' => 'La fecha estimada debe ser una fecha válida'
        ]
    ];

    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = ['setDefaultValues'];
    protected $beforeUpdate = ['updateTimestamps'];

    /**
     * Set default values before insert
     */
    protected function setDefaultValues(array $data)
    {
        if (!isset($data['data']['estado_donacion'])) {
            $data['data']['estado_donacion'] = 'pendiente';
        }
        
        if (!isset($data['data']['fecha_solicitud'])) {
            $data['data']['fecha_solicitud'] = date('Y-m-d H:i:s');
        }
        
        return $data;
    }

    /**
     * Update timestamps before update
     */
    protected function updateTimestamps(array $data)
    {
        // Add any timestamp logic if needed
        return $data;
    }

    /**
     * Get donations by user ID
     */
    public function getDonationsByUser(int $userId, array $filters = []): array
    {
        $builder = $this->builder();
        $builder->where('usuario_id', $userId);
        
        // Apply filters
        if (!empty($filters['estado_donacion'])) {
            $builder->where('estado_donacion', $filters['estado_donacion']);
        }
        
        if (!empty($filters['tipo_dispositivo'])) {
            $builder->where('tipo_dispositivo', $filters['tipo_dispositivo']);
        }
        
        if (!empty($filters['fecha_desde'])) {
            $builder->where('fecha_solicitud >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('fecha_solicitud <=', $filters['fecha_hasta']);
        }
        
        return $builder->orderBy('fecha_solicitud', 'DESC')->get()->getResultArray();
    }

    /**
     * Get donation with user information
     */
    public function getDonationWithUser(int $donationId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('vista_donaciones_completa');
        return $builder->where('id', $donationId)->get()->getRowArray() ?? [];
    }

    /**
     * Get all donations with pagination and filters
     */
    public function getDonationsPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('vista_donaciones_completa');
        
        // Apply filters
        if (!empty($filters['estado_donacion'])) {
            $builder->where('estado_donacion', $filters['estado_donacion']);
        }
        
        if (!empty($filters['tipo_dispositivo'])) {
            $builder->where('tipo_dispositivo', $filters['tipo_dispositivo']);
        }
        
        if (!empty($filters['tipo_usuario'])) {
            $builder->where('tipo_usuario', $filters['tipo_usuario']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('marca', $filters['search'])
                    ->orLike('modelo', $filters['search'])
                    ->orLike('nombre', $filters['search'])
                    ->orLike('apellido', $filters['search'])
                    ->groupEnd();
        }
        
        if (!empty($filters['fecha_desde'])) {
            $builder->where('fecha_solicitud >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('fecha_solicitud <=', $filters['fecha_hasta']);
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $donations = $builder->limit($perPage, $offset)
                           ->orderBy('fecha_solicitud', 'DESC')
                           ->get()
                           ->getResultArray();
        
        return [
            'data' => $donations,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }

    /**
     * Update donation status
     */
    public function updateDonationStatus(int $donationId, string $newStatus, int $processedBy = null, string $notes = null): bool
    {
        $updateData = [
            'estado_donacion' => $newStatus
        ];
        
        if ($processedBy) {
            $updateData['procesado_por_id'] = $processedBy;
            $updateData['fecha_procesamiento'] = date('Y-m-d H:i:s');
        }
        
        if ($notes) {
            $updateData['notas_procesamiento'] = $notes;
        }
        
        // Set completion date if status is completed
        if ($newStatus === 'completada') {
            $updateData['fecha_donacion'] = date('Y-m-d H:i:s');
        }
        
        return $this->update($donationId, $updateData);
    }

    /**
     * Assign technician to donation
     */
    public function assignTechnician(int $donationId, int $technicianId): bool
    {
        return $this->update($donationId, [
            'tecnico_asignado_id' => $technicianId,
            'estado_donacion' => 'procesada'
        ]);
    }

    /**
     * Get donations by technician
     */
    public function getDonationsByTechnician(int $technicianId, array $filters = []): array
    {
        $builder = $this->builder();
        $builder->where('tecnico_asignado_id', $technicianId);
        
        // Apply filters
        if (!empty($filters['estado_donacion'])) {
            $builder->where('estado_donacion', $filters['estado_donacion']);
        }
        
        return $builder->orderBy('fecha_solicitud', 'DESC')->get()->getResultArray();
    }

    /**
     * Get donation statistics
     */
    public function getDonationStats(array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table);
        
        // Apply date filters if provided
        if (!empty($filters['fecha_desde'])) {
            $builder->where('fecha_solicitud >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('fecha_solicitud <=', $filters['fecha_hasta']);
        }
        
        // Get basic stats
        $stats = [
            'total_donaciones' => $builder->countAllResults(false),
            'pendientes' => $builder->where('estado_donacion', 'pendiente')->countAllResults(false),
            'procesadas' => $builder->where('estado_donacion', 'procesada')->countAllResults(false),
            'completadas' => $builder->where('estado_donacion', 'completada')->countAllResults(false),
            'canceladas' => $builder->where('estado_donacion', 'cancelada')->countAllResults(false)
        ];
        
        // Get stats by device type
        $builder = $db->table($this->table);
        if (!empty($filters['fecha_desde'])) {
            $builder->where('fecha_solicitud >=', $filters['fecha_desde']);
        }
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('fecha_solicitud <=', $filters['fecha_hasta']);
        }
        
        $deviceStats = $builder->select('tipo_dispositivo, COUNT(*) as total')
                              ->groupBy('tipo_dispositivo')
                              ->orderBy('total', 'DESC')
                              ->get()
                              ->getResultArray();
        
        $stats['por_tipo_dispositivo'] = $deviceStats;
        
        return $stats;
    }

    /**
     * Get donations requiring attention (pending or overdue)
     */
    public function getDonationsRequiringAttention(): array
    {
        $builder = $this->builder();
        
        $builder->groupStart()
                ->where('estado_donacion', 'pendiente')
                ->orWhere('fecha_estimada_donacion <', date('Y-m-d'))
                ->groupEnd();
        
        return $builder->orderBy('fecha_solicitud', 'ASC')->get()->getResultArray();
    }

    /**
     * Search donations
     */
    public function searchDonations(string $search, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('vista_donaciones_completa');
        
        $builder->groupStart()
                ->like('tipo_dispositivo', $search)
                ->orLike('marca', $search)
                ->orLike('modelo', $search)
                ->orLike('nombre', $search)
                ->orLike('apellido', $search)
                ->orLike('email', $search)
                ->groupEnd();
        
        // Apply additional filters
        if (!empty($filters['estado_donacion'])) {
            $builder->where('estado_donacion', $filters['estado_donacion']);
        }
        
        if (!empty($filters['tipo_usuario'])) {
            $builder->where('tipo_usuario', $filters['tipo_usuario']);
        }
        
        return $builder->orderBy('fecha_solicitud', 'DESC')
                      ->limit(50)
                      ->get()
                      ->getResultArray();
    }

    /**
     * Get monthly donation trends
     */
    public function getMonthlyTrends(int $months = 12): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table);
        
        $startDate = date('Y-m-d', strtotime("-{$months} months"));
        
        $trends = $builder->select("DATE_FORMAT(fecha_solicitud, '%Y-%m') as mes, COUNT(*) as total")
                         ->where('fecha_solicitud >=', $startDate)
                         ->groupBy("DATE_FORMAT(fecha_solicitud, '%Y-%m')")
                         ->orderBy('mes', 'ASC')
                         ->get()
                         ->getResultArray();
        
        return $trends;
    }

    /**
     * Get donation history for a specific donation
     */
    public function getDonationHistory(int $donationId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('donacion_historial h');
        
        $builder->select('h.*, u.nombre, u.apellido')
                ->join('users u', 'h.usuario_cambio_id = u.id', 'left')
                ->where('h.donacion_id', $donationId)
                ->orderBy('h.fecha_cambio', 'DESC');
        
        return $builder->get()->getResultArray();
    }
}