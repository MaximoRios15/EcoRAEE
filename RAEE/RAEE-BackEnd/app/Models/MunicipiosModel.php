<?php

namespace App\Models;

use CodeIgniter\Model;

class MunicipiosModel extends Model
{
    protected $table            = 'municipios';
    protected $primaryKey       = 'idMunicipios';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'Nombres_Municipios',
        'CodigoPostal_Municipios',
        'idProvincias_Municipios',
    ];

    public function listByProvince(?int $provinceId = null): array
    {
        if ($provinceId) {
            return $this->where('idProvincias_Municipios', $provinceId)
                        ->orderBy('Nombres_Municipios', 'ASC')
                        ->findAll();
        }
        return $this->orderBy('Nombres_Municipios', 'ASC')->findAll();
    }
}


