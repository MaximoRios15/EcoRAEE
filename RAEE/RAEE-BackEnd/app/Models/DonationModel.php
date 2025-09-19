<?php

namespace App\Models;

use CodeIgniter\Model;

class DonationModel extends Model
{
    protected $table = 'equipos';
    protected $primaryKey = 'idEquipos';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    
    protected $allowedFields = [
        'idClientes_Equipos',
        'idCategorias_Equipos',
        'Marca_Equipos',
        'Modelo_Equipos',
        'idEstados_Equipos',
        'Cantidad_Equipos',
        'Descripcion_Equipos',
        'Fotos_Equipos',
        'PesoKG_Equipos',
        'DimencionesCM_Equipos',
        'FechaIngreso_Equipos',
        'Accesorios_Equipos'
    ];

    // Dates
    protected $useTimestamps = false; // Using custom timestamp field
    protected $dateFormat = 'datetime';

    // Validation
    protected $validationRules = [
        'idClientes_Equipos' => 'required|integer|is_not_unique[usuarios.idUsuarios]',
        'idCategorias_Equipos' => 'required|integer|is_not_unique[categorias_equipos.idCategorias]',
        'Marca_Equipos' => 'required|min_length[2]|max_length[50]',
        'Modelo_Equipos' => 'permit_empty|min_length[2]|max_length[100]',
        'idEstados_Equipos' => 'required|integer|is_not_unique[estados.idEstados]',
        'Cantidad_Equipos' => 'required|integer|greater_than[0]',
        'Descripcion_Equipos' => 'permit_empty|max_length[255]',
        'Fotos_Equipos' => 'permit_empty|max_length[255]',
        'PesoKG_Equipos' => 'required|decimal|greater_than[0]',
        'DimencionesCM_Equipos' => 'permit_empty|max_length[20]',
        'Accesorios_Equipos' => 'permit_empty|max_length[100]'
    ];

    protected $validationMessages = [
        'idClientes_Equipos' => [
            'required' => 'El ID del cliente es obligatorio',
            'integer' => 'El ID del cliente debe ser un número entero',
            'is_not_unique' => 'El cliente especificado no existe'
        ],
        'idCategorias_Equipos' => [
            'required' => 'La categoría del equipo es obligatoria',
            'integer' => 'La categoría debe ser un número entero',
            'is_not_unique' => 'La categoría especificada no existe'
        ],
        'Marca_Equipos' => [
            'required' => 'La marca del equipo es obligatoria',
            'min_length' => 'La marca debe tener al menos 2 caracteres',
            'max_length' => 'La marca no puede tener más de 50 caracteres'
        ],
        'Modelo_Equipos' => [
            'min_length' => 'El modelo debe tener al menos 2 caracteres',
            'max_length' => 'El modelo no puede tener más de 100 caracteres'
        ],
        'idEstados_Equipos' => [
            'required' => 'El estado del equipo es obligatorio',
            'integer' => 'El estado debe ser un número entero',
            'is_not_unique' => 'El estado especificado no existe'
        ],
        'Cantidad_Equipos' => [
            'required' => 'La cantidad es obligatoria',
            'integer' => 'La cantidad debe ser un número entero',
            'greater_than' => 'La cantidad debe ser mayor a 0'
        ],
        'PesoKG_Equipos' => [
            'required' => 'El peso es obligatorio',
            'decimal' => 'El peso debe ser un número decimal',
            'greater_than' => 'El peso debe ser mayor a 0'
        ],
        'DimencionesCM_Equipos' => [
            'max_length' => 'Las dimensiones no pueden tener más de 20 caracteres'
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
        if (!isset($data['data']['FechaIngreso_Equipos'])) {
            $data['data']['FechaIngreso_Equipos'] = date('Y-m-d H:i:s');
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
        $db = \Config\Database::connect();
        $builder = $db->table('equipos e');
        
        $builder->select('e.*, c.Nombres_Categorias, est.Descripcion_Estados, p.id_Publicacion, p.Descripcion_Publicacion, p.Puntos_Publicacion, p.Fecha_Publicacion, p.estados_idEstados as estado_publicacion')
                ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
                ->join('estados est', 'e.idEstados_Equipos = est.idEstados', 'left')
                ->join('publicacion p', 'e.idEquipos = p.equipos_idEquipos', 'left')
                ->where('e.idClientes_Equipos', $userId);
        
        // Apply filters
        if (!empty($filters['categoria'])) {
            $builder->where('e.idCategorias_Equipos', $filters['categoria']);
        }
        
        if (!empty($filters['estado'])) {
            $builder->where('e.idEstados_Equipos', $filters['estado']);
        }
        
        if (!empty($filters['fecha_desde'])) {
            $builder->where('e.FechaIngreso_Equipos >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('e.FechaIngreso_Equipos <=', $filters['fecha_hasta']);
        }
        
        return $builder->orderBy('e.FechaIngreso_Equipos', 'DESC')->get()->getResultArray();
    }

    /**
     * Get donation with user information
     */
    public function getDonationWithUser(int $donationId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('equipos e');
        
        $builder->select('e.*, c.Nombres_Categorias, est.Descripcion_Estados, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, u.Telefono_Usuarios, p.id_Publicacion, p.Descripcion_Publicacion, p.Puntos_Publicacion, p.Fecha_Publicacion, p.estados_idEstados as estado_publicacion')
                ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
                ->join('estados est', 'e.idEstados_Equipos = est.idEstados', 'left')
                ->join('usuarios u', 'e.idClientes_Equipos = u.idUsuarios', 'left')
                ->join('publicacion p', 'e.idEquipos = p.equipos_idEquipos', 'left')
                ->where('e.idEquipos', $donationId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Get all donations with pagination and filters
     */
    public function getDonationsPaginated(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('equipos e');
        
        $builder->select('e.*, c.Nombres_Categorias, est.Descripcion_Estados, u.Nombres_Usuarios, u.Apellidos_Usuarios, u.Email_Usuarios, p.id_Publicacion, p.Descripcion_Publicacion, p.Puntos_Publicacion, p.Fecha_Publicacion, p.estados_idEstados as estado_publicacion')
                ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
                ->join('estados est', 'e.idEstados_Equipos = est.idEstados', 'left')
                ->join('usuarios u', 'e.idClientes_Equipos = u.idUsuarios', 'left')
                ->join('publicacion p', 'e.idEquipos = p.equipos_idEquipos', 'left');
        
        // Apply filters
        if (!empty($filters['categoria'])) {
            $builder->where('e.idCategorias_Equipos', $filters['categoria']);
        }
        
        if (!empty($filters['estado'])) {
            $builder->where('e.idEstados_Equipos', $filters['estado']);
        }
        
        if (!empty($filters['estado_publicacion'])) {
            $builder->where('p.estados_idEstados', $filters['estado_publicacion']);
        }
        
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('e.Modelo_Equipos', $filters['search'])
                    ->orLike('e.Descripcion_Equipos', $filters['search'])
                    ->orLike('u.Nombres_Usuarios', $filters['search'])
                    ->orLike('u.Apellidos_Usuarios', $filters['search'])
                    ->groupEnd();
        }
        
        if (!empty($filters['fecha_desde'])) {
            $builder->where('e.FechaIngreso_Equipos >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('e.FechaIngreso_Equipos <=', $filters['fecha_hasta']);
        }
        
        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $donations = $builder->limit($perPage, $offset)
                           ->orderBy('e.FechaIngreso_Equipos', 'DESC')
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
     * Update equipment status
     */
    public function updateEquipmentStatus(int $equipmentId, int $newStatusId): bool
    {
        return $this->update($equipmentId, [
            'idEstados_Equipos' => $newStatusId
        ]);
    }

    /**
     * Create publication for equipment
     */
    public function createPublication(int $equipmentId, int $userId, string $description, int $points): bool
    {
        $db = \Config\Database::connect();
        $builder = $db->table('publicacion');
        
        $data = [
            'Descripcion_Publicacion' => $description,
            'Puntos_Publicacion' => $points,
            'Fecha_Publicacion' => date('Y-m-d H:i:s'),
            'clientes_idClientes' => $userId,
            'estados_idEstados' => 1, // Assuming 1 = active/pending
            'equipos_idEquipos' => $equipmentId
        ];
        
        return $builder->insert($data);
    }

    /**
     * Get equipment by technician (through reservations)
     */
    public function getEquipmentByTechnician(int $technicianId, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('reserva_producto r');
        
        $builder->select('r.*, e.*, c.Nombres_Categorias, est.Descripcion_Estados, u.Nombres_Usuarios, u.Apellidos_Usuarios')
                ->join('equipos e', 'r.equipos_idEquipos = e.idEquipos')
                ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
                ->join('estados est', 'e.idEstados_Equipos = est.idEstados', 'left')
                ->join('usuarios u', 'e.idClientes_Equipos = u.idUsuarios', 'left')
                ->where('r.clientes_idClientes', $technicianId);
        
        // Apply filters
        if (!empty($filters['estado'])) {
            $builder->where('r.estados_idEstados', $filters['estado']);
        }
        
        return $builder->orderBy('r.Fecha_Reserva', 'DESC')->get()->getResultArray();
    }

    /**
     * Get equipment statistics
     */
    public function getEquipmentStats(array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table);
        
        // Apply date filters if provided
        if (!empty($filters['fecha_desde'])) {
            $builder->where('FechaIngreso_Equipos >=', $filters['fecha_desde']);
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('FechaIngreso_Equipos <=', $filters['fecha_hasta']);
        }
        
        // Get basic stats
        $stats = [
            'total_equipos' => $builder->countAllResults(false),
            'total_cantidad' => $builder->selectSum('Cantidad_Equipos')->get()->getRow()->Cantidad_Equipos ?? 0
        ];
        
        // Get stats by category
        $builder = $db->table($this->table);
        if (!empty($filters['fecha_desde'])) {
            $builder->where('FechaIngreso_Equipos >=', $filters['fecha_desde']);
        }
        if (!empty($filters['fecha_hasta'])) {
            $builder->where('FechaIngreso_Equipos <=', $filters['fecha_hasta']);
        }
        
        $categoryStats = $builder->select('idCategorias_Equipos, COUNT(*) as total, SUM(Cantidad_Equipos) as cantidad_total')
                                ->groupBy('idCategorias_Equipos')
                                ->orderBy('total', 'DESC')
                                ->get()
                                ->getResultArray();
        
        $stats['por_categoria'] = $categoryStats;
        
        return $stats;
    }

    /**
     * Search equipment
     */
    public function searchEquipment(string $search, array $filters = []): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('equipos e');
        
        $builder->select('e.*, c.Nombres_Categorias, est.Descripcion_Estados, u.Nombres_Usuarios, u.Apellidos_Usuarios')
                ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
                ->join('estados est', 'e.idEstados_Equipos = est.idEstados', 'left')
                ->join('usuarios u', 'e.idClientes_Equipos = u.idUsuarios', 'left')
                ->groupStart()
                ->like('e.Modelo_Equipos', $search)
                ->orLike('e.Descripcion_Equipos', $search)
                ->orLike('u.Nombres_Usuarios', $search)
                ->orLike('u.Apellidos_Usuarios', $search)
                ->groupEnd();
        
        // Apply additional filters
        if (!empty($filters['categoria'])) {
            $builder->where('e.idCategorias_Equipos', $filters['categoria']);
        }
        
        if (!empty($filters['estado'])) {
            $builder->where('e.idEstados_Equipos', $filters['estado']);
        }
        
        return $builder->orderBy('e.FechaIngreso_Equipos', 'DESC')
                      ->limit(50)
                      ->get()
                      ->getResultArray();
    }

    /**
     * Get monthly equipment trends
     */
    public function getMonthlyTrends(int $months = 12): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table($this->table);
        
        $startDate = date('Y-m-d', strtotime("-{$months} months"));
        
        $trends = $builder->select("DATE_FORMAT(FechaIngreso_Equipos, '%Y-%m') as mes, COUNT(*) as total, SUM(Cantidad_Equipos) as cantidad")
                         ->where('FechaIngreso_Equipos >=', $startDate)
                         ->groupBy("DATE_FORMAT(FechaIngreso_Equipos, '%Y-%m')")
                         ->orderBy('mes', 'ASC')
                         ->get()
                         ->getResultArray();
        
        return $trends;
    }
}