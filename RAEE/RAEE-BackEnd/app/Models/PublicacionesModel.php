<?php

namespace App\Models;

use CodeIgniter\Model;

class PublicacionesModel extends Model
{
    protected $table            = 'publicacion';
    protected $primaryKey       = 'idPublicacion';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'Titulo_Publicacion',
        'Descripcion_Publicacion',
        'PuntosDonados_Publicacion',
        'FechaIngreso_Publicacion',
        'idDonacion_Publicacion',
    ];
}