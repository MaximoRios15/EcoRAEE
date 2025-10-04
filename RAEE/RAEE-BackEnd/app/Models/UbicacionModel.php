<?php

namespace App\Models;

use CodeIgniter\Model;

class UbicacionModel extends Model
{
    protected $table = 'ubicaciones';
    protected $primaryKey = 'idUbicaciones';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'Direccion_Ubicaciones',
        'NroCalle_Ubicaciones',
        'Provincia_Ubicaciones',
        'Municipios_Ubicaciones',
        'Latitud_Ubicaciones',
        'Longitud_Ubicaciones',
        'Estado_Ubicaciones'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = '';
    protected $updatedField = '';
    protected $deletedField = '';

    // Validation
    protected $validationRules = [
        'Direccion_Ubicaciones' => 'required|max_length[255]',
        'NroCalle_Ubicaciones' => 'permit_empty|max_length[20]',
        'Provincia_Ubicaciones' => 'required|max_length[100]',
        'Municipios_Ubicaciones' => 'required|max_length[100]',
        'Latitud_Ubicaciones' => 'permit_empty|decimal',
        'Longitud_Ubicaciones' => 'permit_empty|decimal',
        'Estado_Ubicaciones' => 'required|integer|in_list[0,1]'
    ];
    protected $validationMessages = [
        'Direccion_Ubicaciones' => [
            'required' => 'La dirección es obligatoria',
            'max_length' => 'La dirección no puede exceder 255 caracteres'
        ],
        'Provincia_Ubicaciones' => [
            'required' => 'La provincia es obligatoria',
            'max_length' => 'La provincia no puede exceder 100 caracteres'
        ],
        'Municipios_Ubicaciones' => [
            'required' => 'El municipio es obligatorio',
            'max_length' => 'El municipio no puede exceder 100 caracteres'
        ],
        'Estado_Ubicaciones' => [
            'required' => 'El estado es obligatorio',
            'integer' => 'El estado debe ser un número entero',
            'in_list' => 'El estado debe ser 0 o 1'
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
     * Get active municipal locations (Estado_Ubicaciones = 1)
     */
    public function getActiveMunicipalLocations()
    {
        return $this->where('Estado_Ubicaciones', 1)
                    ->orderBy('Municipios_Ubicaciones', 'ASC')
                    ->orderBy('Direccion_Ubicaciones', 'ASC')
                    ->findAll();
    }

    /**
     * Get location by ID
     */
    public function getLocationById($id)
    {
        return $this->where('idUbicaciones', $id)
                    ->where('Estado_Ubicaciones', 1)
                    ->first();
    }

    /**
     * Get locations by municipality
     */
    public function getLocationsByMunicipality($municipality)
    {
        return $this->where('Municipios_Ubicaciones', $municipality)
                    ->where('Estado_Ubicaciones', 1)
                    ->orderBy('Direccion_Ubicaciones', 'ASC')
                    ->findAll();
    }
}