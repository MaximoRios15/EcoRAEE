<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class CategoriesController extends ResourceController
{
    protected $format = 'json';

    /**
     * GET /api/categories
     * Devuelve listado de categorías desde la tabla `categorias_equipos`.
     */
    public function index()
    {
        $db = \Config\Database::connect();

        $builder = $db->table('categorias_equipos');
        $builder->select([
            'idCategorias',
            'Nombres_Categorias',
            'PuntosBase_Categorias',
        ]);

        $rows = $builder->get()->getResultArray();

        return $this->respond([
            'message'    => 'Listado de categorías',
            'categories' => $rows,
        ], 200);
    }
}