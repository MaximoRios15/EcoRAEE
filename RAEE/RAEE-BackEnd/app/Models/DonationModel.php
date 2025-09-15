<?php

namespace App\Models;

use CodeIgniter\Model;

class DonationModel extends Model
{
    protected $table            = 'raee';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'usuario_id', 'tipo_usuario', 'tipo_dispositivo', 'marca', 'modelo', 'estado_dispositivo', 
        'descripcion', 'descripcion_adicional', 'ubicacion_donacion', 'fecha_estimada_donacion', 
        'estado_donacion', 'fecha_donacion', 'fecha_compra', 'preferencias', 'informacion_dispositivo',
        'procesado_por_id', 'procesado_por_tipo', 'fecha_procesamiento', 'notas_procesamiento',
        // Campos para entregas
        'direccion_entrega', 'ciudad_entrega', 'codigo_postal_entrega', 'telefono_entrega',
        'fecha_entrega_solicitada', 'hora_entrega_solicitada', 'instrucciones_entrega',
        'estado_entrega', 'fecha_solicitud', 'tipo_solicitud', 'notas_entrega',
        'tecnico_asignado_id', 'fecha_entrega_real'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}
