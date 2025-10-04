<?php

namespace App\Models;

use CodeIgniter\Model;

class StateModel extends Model
{
    protected $table = 'estados';
    protected $primaryKey = 'idEstados';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'Nombres_Estados',
        'MultiplicadorPuntos_Estados',
        'Activo_Estados'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = '';
    protected $updatedField = '';
    protected $deletedField = '';

    // Validation
    protected $validationRules = [
        'Nombres_Estados' => 'required|max_length[50]|is_unique[estados.Nombres_Estados,idEstados,{idEstados}]',
        'MultiplicadorPuntos_Estados' => 'required|decimal|greater_than[0]',
        'Activo_Estados' => 'permit_empty|integer'
    ];
    protected $validationMessages = [
        'Nombres_Estados' => [
            'required' => 'El nombre del estado es obligatorio',
            'max_length' => 'El nombre no puede exceder 50 caracteres',
            'is_unique' => 'Ya existe un estado con este nombre'
        ],
        'MultiplicadorPuntos_Estados' => [
            'required' => 'El multiplicador de puntos es obligatorio',
            'decimal' => 'El multiplicador debe ser un número decimal',
            'greater_than' => 'El multiplicador debe ser mayor a 0'
        ]
    ];
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
     * Get active states
     */
    public function getActiveStates()
    {
        return $this->where('Activo_Estados', 1)
                    ->orderBy('Nombres_Estados', 'ASC')
                    ->findAll();
    }

    /**
     * Get state by name
     */
    public function getStateByName($name)
    {
        return $this->where('Nombres_Estados', $name)
                    ->where('Activo_Estados', 1)
                    ->first();
    }
}
