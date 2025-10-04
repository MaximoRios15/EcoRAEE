<?php

namespace App\Models;

use CodeIgniter\Model;

class PublicacionModel extends Model
{
    protected $table = 'publicacion';
    protected $primaryKey = 'idPublicacion';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'Titulo_Publicacion',
        'Descripcion_Publicacion',
        'Puntos_Publicacion',
        'Fecha_Publicacion',
        'clientes_Publicacion',
        'estados_Publicacion',
        'equipos_Publicacion'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = 'Fecha_Publicacion';
    protected $updatedField = '';
    protected $deletedField = '';

    // Validation
    protected $validationRules = [
        'Titulo_Publicacion' => 'permit_empty|max_length[100]',
        'Descripcion_Publicacion' => 'required|max_length[255]',
        'Puntos_Publicacion' => 'required|integer',
        'Fecha_Publicacion' => 'required|valid_date',
        'clientes_Publicacion' => 'required|integer',
        'estados_Publicacion' => 'required|integer',
        'equipos_Publicacion' => 'required|integer'
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = [];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    /**
     * Obtener publicaciones del usuario con información detallada
     */
    public function getUserPublications(int $userId, int $page = 1, int $perPage = 10): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('publicacion p');
        
        $builder->select('
            p.*,
            e.Marca_Equipos,
            e.Modelo_Equipos,
            e.Descripcion_Equipos,
            e.FechaIngreso_Equipos,
            c.Nombres_Categorias,
            est.Nombres_Estados,
            est.MultiplicadorPuntos_Estados
        ')
        ->join('equipos e', 'p.equipos_Publicacion = e.idEquipos', 'left')
        ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
        ->join('estados est', 'p.estados_Publicacion = est.idEstados', 'left')
        ->where('p.clientes_Publicacion', $userId)
        ->orderBy('p.Fecha_Publicacion', 'DESC');

        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $publications = $builder->limit($perPage, $offset)->get()->getResultArray();
        
        return [
            'data' => $publications,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }

    /**
     * Obtener una publicación específica con información detallada
     */
    public function getPublicationWithDetails(int $publicationId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('publicacion p');
        
        $builder->select('
            p.*,
            e.Marca_Equipos,
            e.Modelo_Equipos,
            e.Descripcion_Equipos,
            e.FechaIngreso_Equipos,
            e.PesoKG_Equipos,
            e.Cantidad_Equipos,
            c.Nombres_Categorias,
            est.Nombres_Estados,
            est.MultiplicadorPuntos_Estados,
            u.Nombres_Usuarios,
            u.Apellidos_Usuarios
        ')
        ->join('equipos e', 'p.equipos_Publicacion = e.idEquipos', 'left')
        ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
        ->join('estados est', 'p.estados_Publicacion = est.idEstados', 'left')
        ->join('usuarios u', 'p.clientes_Publicacion = u.idUsuarios', 'left')
        ->where('p.idPublicacion', $publicationId);
        
        return $builder->get()->getRowArray() ?? [];
    }

    /**
     * Obtener todas las publicaciones para la tienda de canjes
     */
    public function getAllPublications(int $page = 1, int $perPage = 20): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('publicacion p');
        
        $builder->select('
            p.*,
            e.Marca_Equipos,
            e.Modelo_Equipos,
            e.Descripcion_Equipos,
            e.FechaIngreso_Equipos,
            e.PesoKG_Equipos,
            e.Cantidad_Equipos,
            e.DimencionesCM_Equipos,
            e.Accesorios_Equipos,
            c.Nombres_Categorias,
            c.idCategorias,
            est.Nombres_Estados,
            est.idEstados,
            u.Nombres_Usuarios,
            u.Apellidos_Usuarios
        ')
        ->join('equipos e', 'p.equipos_Publicacion = e.idEquipos', 'left')
        ->join('categorias_equipos c', 'e.idCategorias_Equipos = c.idCategorias', 'left')
        ->join('estados est', 'p.estados_Publicacion = est.idEstados', 'left')
        ->join('usuarios u', 'p.clientes_Publicacion = u.idUsuarios', 'left')
        ->orderBy('p.Fecha_Publicacion', 'DESC');

        // Get total count
        $total = $builder->countAllResults(false);
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $publications = $builder->limit($perPage, $offset)->get()->getResultArray();
        
        return [
            'data' => $publications,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
    }

    /**
     * Crear una nueva publicación
     */
    public function createPublication(array $data): int
    {
        $publicationData = [
            'Titulo_Publicacion' => $data['titulo'] ?? null,
            'Descripcion_Publicacion' => $data['descripcion'] ?? '',
            'Puntos_Publicacion' => $data['puntos'] ?? 0,
            'Fecha_Publicacion' => date('Y-m-d H:i:s'),
            'clientes_Publicacion' => $data['cliente_id'] ?? 0,
            'estados_Publicacion' => $data['estado_id'] ?? 0,
            'equipos_Publicacion' => $data['equipo_id'] ?? 0
        ];

        if ($this->insert($publicationData)) {
            return $this->getInsertID();
        }
        
        return false;
    }
}
