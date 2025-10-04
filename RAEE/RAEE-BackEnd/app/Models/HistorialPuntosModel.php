<?php

namespace App\Models;

use CodeIgniter\Model;

class HistorialPuntosModel extends Model
{
    protected $table = 'historial_puntos';
    protected $primaryKey = 'idHistorialPuntos';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'PuntosInicial_Puntos',
        'PuntosCambiados_Puntos',
        'PuntosTotales_Puntos',
        'equipos_idEquipos',
        'usuarios_idUsuarios',
        'Estado_Puntos',
        'FechaMovimiento_Puntos'
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
     * Get puntos by equipment ID
     */
    public function getPuntosByEquipoId($equipoId)
    {
        return $this->where('equipos_idEquipos', $equipoId)
                   ->where('Estado_Puntos', 1) // Assuming 1 = active/valid
                   ->orderBy('FechaMovimiento_Puntos', 'DESC')
                   ->first();
    }

    /**
     * Get puntos by user ID
     */
    public function getPuntosByUserId($userId)
    {
        return $this->where('usuarios_idUsuarios', $userId)
                   ->where('Estado_Puntos', 1) // Assuming 1 = active/valid
                   ->orderBy('FechaMovimiento_Puntos', 'DESC')
                   ->findAll();
    }

    /**
     * Get total points earned by user
     */
    public function getTotalPointsEarned($userId)
    {
        $db = \Config\Database::connect();
        
        $query = $db->query("
            SELECT SUM(PuntosCambiados_Puntos) as total_points
            FROM historial_puntos 
            WHERE usuarios_idUsuarios = ? 
            AND Estado_Puntos = 1
            AND PuntosCambiados_Puntos > 0
        ", [$userId]);

        $result = $query->getRow();
        return $result ? (int)$result->total_points : 0;
    }
}