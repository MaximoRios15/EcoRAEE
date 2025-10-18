<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class StatesController extends ResourceController
{
    protected $format = 'json';

    /**
     * GET /api/states
     * Devuelve listado de estados desde la tabla `estados_equipos`.
     */
    public function index()
    {
        $db = \Config\Database::connect();

        $builder = $db->table('estados_equipos');
        $builder->select([
            'idEstadosEquipos',
            'Nombres_EstadosEquipos',
            'MultiplicadorPuntos_EstadosEquipos',
        ]);

        $rows = $builder->get()->getResultArray();

        return $this->respond([
            'message' => 'Listado de estados de equipos',
            'states'  => $rows,
        ], 200);
    }
}