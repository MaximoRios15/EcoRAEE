<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Database\BaseBuilder;

class CategoryController extends ResourceController
{
    protected $format = 'json';

    /**
     * Get all equipment categories
     */
    public function index()
    {
        try {
            $db = \Config\Database::connect();
            $builder = $db->table('categorias_equipos');
            
            $categories = $builder->select('idCategorias, Nombres_Categorias')
                                 ->where('Activo_Categorias', 1)
                                 ->orderBy('Nombres_Categorias', 'ASC')
                                 ->get()
                                 ->getResultArray();

            return $this->respond([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener categorías: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}
