<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class StateController extends ResourceController
{
    protected $format = 'json';

    /**
     * Get all equipment states
     */
    public function index()
    {
        try {
            $db = \Config\Database::connect();
            $builder = $db->table('estados');
            
            $states = $builder->select('idEstados, Descripcion_Estados')
                             ->where('Activo_Estados', 1)
                             ->orderBy('idEstados', 'ASC')
                             ->get()
                             ->getResultArray();

            return $this->respond([
                'success' => true,
                'data' => $states
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener estados: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}
