<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class PuntosEntregaController extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $db = \Config\Database::connect();

        $builder = $db->table('punto_entrega pe');
        $builder->select([
            'pe.idPuntoEntrega',
            'pe.Nombre_PuntoEntrega',
            'dir.idDirecciones as idDirecciones_PuntoEntrega',
            'dir.Calle_Direcciones',
            'dir.Numero_Direcciones',
            'dir.Barrio_Direcciones',
            'dir.Latitud_Ubicaciones',
            'dir.Longitud_Ubicaciones',
            'mun.Nombres_Municipios as Municipio'
        ]);
        $builder->join('direcciones dir', 'pe.idDirecciones_PuntoEntrega = dir.idDirecciones', 'left');
        $builder->join('municipios mun', 'dir.idMunicipios_Direcciones = mun.idMunicipios', 'left');

        $rows = $builder->get()->getResultArray();

        return $this->respond([
            'message' => 'Listado de ecopuntos',
            'ecopoints' => $rows,
        ], 200);
    }
}