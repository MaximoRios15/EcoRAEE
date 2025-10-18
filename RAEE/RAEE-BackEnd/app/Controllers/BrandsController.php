<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class BrandsController extends ResourceController
{
    protected $format = 'json';

    /**
     * GET /api/brands
     * Devuelve listado de marcas desde la tabla `marcas_equipos`.
     */
    public function index()
    {
        $db = \Config\Database::connect();

        $builder = $db->table('marcas_equipos');
        $builder->select([
            'idMarcas',
            'idCategorias_Marcas',
            'Nombres_Marcas',
            'PuntosBase_Marcas',
        ]);

        $rows = $builder->get()->getResultArray();

        return $this->respond([
            'message' => 'Listado de marcas de equipos',
            'brands'  => $rows,
        ], 200);
    }
}