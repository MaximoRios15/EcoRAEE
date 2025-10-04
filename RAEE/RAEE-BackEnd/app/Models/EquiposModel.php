<?php

namespace App\Models;

use CodeIgniter\Model;

class EquiposModel extends Model
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
        'Accesorios_Equipos',
        'FechaIngreso_Equipos',
        'ImagenPrincipal_Equipos'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $deletedField = 'deleted_at';

    // Validation
    protected $validationRules = [];
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
     * Get equipos by user ID
     */
    public function getEquiposByUserId($userId)
    {
        return $this->where('idClientes_Equipos', $userId)
                   ->orderBy('FechaIngreso_Equipos', 'DESC')
                   ->findAll();
    }

    /**
     * Get equipos with category, state and points information from historial_puntos
     */
    public function getEquiposWithDetails($userId)
    {
        try {
            $db = \Config\Database::connect();
            
            // Query con JOIN a historial_puntos para obtener puntos reales
            $query = $db->query("
                SELECT e.*, 
                       c.Nombres_Categorias, 
                       est.Nombres_Estados,
                       COALESCE(hp.PuntosCambiados_Puntos, 0) as Puntos_Equipos,
                       hp.FechaMovimiento_Puntos
                FROM equipos e
                LEFT JOIN categorias_equipos c ON e.idCategorias_Equipos = c.idCategorias
                LEFT JOIN estados est ON e.idEstados_Equipos = est.idEstados
                LEFT JOIN (
                    SELECT equipos_idEquipos, usuarios_idUsuarios, 
                           PuntosCambiados_Puntos, FechaMovimiento_Puntos,
                           ROW_NUMBER() OVER (PARTITION BY equipos_idEquipos ORDER BY FechaMovimiento_Puntos DESC) as rn
                    FROM historial_puntos 
                    WHERE Estado_Puntos = 1
                ) hp ON e.idEquipos = hp.equipos_idEquipos 
                    AND hp.usuarios_idUsuarios = e.idClientes_Equipos 
                    AND hp.rn = 1
                WHERE e.idClientes_Equipos = ? 
                AND c.Activo_Categorias = 1
                ORDER BY e.FechaIngreso_Equipos DESC
            ", [$userId]);

            $result = $query->getResultArray();
            log_message('info', 'Query con historial_puntos ejecutada, equipos encontrados: ' . count($result));
            
            return $result;
        } catch (\Exception $e) {
            log_message('error', 'Error en getEquiposWithDetails: ' . $e->getMessage());
            return [];
        }
    }
}
