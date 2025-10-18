<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class PublicationsController extends ResourceController
{
    protected $format = 'json';

    /**
     * GET /api/publications
     * Devuelve listado de publicaciones desde la tabla `publicacion`.
     */
    public function index()
    {
        $db = \Config\Database::connect();

        $builder = $db->table('publicacion');
        $builder->select([
            'idPublicacion',
            'Titulo_Publicacion',
            'Descripcion_Publicacion',
            'PuntosDonados_Publicacion',
            'FechaIngreso_Publicacion',
            'idDonacion_Publicacion',
        ]);

        $rows = $builder->get()->getResultArray();

        return $this->respond([
            'message' => 'Listado de publicaciones',
            'publications' => $rows,
        ], 200);
    }
}