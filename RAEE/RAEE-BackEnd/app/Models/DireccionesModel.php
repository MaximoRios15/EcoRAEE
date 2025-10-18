<?php

namespace App\Models;

use CodeIgniter\Model;

class DireccionesModel extends Model
{
    protected $table            = 'direcciones';
    protected $primaryKey       = 'idDirecciones';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'Calle_Direcciones',
        'Numero_Direcciones',
        'Piso_Direcciones',
        'Departamento_Direcciones',
        'Barrio_Direcciones',
        'Longitud_Ubicaciones',
        'Latitud_Ubicaciones',
        'idMunicipios_Direcciones',
    ];
}