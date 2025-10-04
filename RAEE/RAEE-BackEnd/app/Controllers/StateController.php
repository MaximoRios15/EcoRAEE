<?php

namespace App\Controllers;

use App\Models\StateModel;
use CodeIgniter\RESTful\ResourceController;

class StateController extends ResourceController
{
    protected $modelName = 'App\Models\StateModel';
    protected $format = 'json';
    
    protected $stateModel;
    
    public function __construct()
    {
        $this->stateModel = new StateModel();
    }

    /**
     * Get all states
     */
    public function index()
    {
        try {
            $states = $this->stateModel->where('Activo_Estados', 1)
                                      ->orderBy('Nombres_Estados', 'ASC')
                                      ->findAll();

            return $this->respond([
                'success' => true,
                'data' => $states
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener estados: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get state by ID
     */
    public function show($id = null)
    {
        try {
            $state = $this->stateModel->find($id);
            
            if (!$state) {
                return $this->fail('Estado no encontrado', 404);
            }

            return $this->respond([
                'success' => true,
                'data' => $state
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener estado: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}