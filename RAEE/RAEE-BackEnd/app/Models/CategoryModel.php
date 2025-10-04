<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categorias_equipos';
    protected $primaryKey = 'idCategorias';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'Nombres_Categorias',
        'PuntosBase_Categorias',
        'Activo_Categorias'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = '';
    protected $updatedField = '';
    protected $deletedField = '';

    // Validation
    protected $validationRules = [
        'Nombres_Categorias' => 'required|max_length[50]|is_unique[categorias_equipos.Nombres_Categorias,idCategorias,{idCategorias}]',
        'PuntosBase_Categorias' => 'required|integer|greater_than[0]',
        'Activo_Categorias' => 'permit_empty|integer'
    ];
    protected $validationMessages = [
        'Nombres_Categorias' => [
            'required' => 'El nombre de la categoría es obligatorio',
            'max_length' => 'El nombre no puede exceder 50 caracteres',
            'is_unique' => 'Ya existe una categoría con este nombre'
        ],
        'PuntosBase_Categorias' => [
            'required' => 'Los puntos base son obligatorios',
            'integer' => 'Los puntos base deben ser un número entero',
            'greater_than' => 'Los puntos base deben ser mayores a 0'
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
     * Get active categories
     */
    public function getActiveCategories()
    {
        return $this->where('Activo_Categorias', 1)
                    ->orderBy('Nombres_Categorias', 'ASC')
                    ->findAll();
    }

    /**
     * Get category by name
     */
    public function getCategoryByName($name)
    {
        return $this->where('Nombres_Categorias', $name)
                    ->where('Activo_Categorias', 1)
                    ->first();
    }
}
