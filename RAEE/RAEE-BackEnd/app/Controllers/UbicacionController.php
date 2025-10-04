<?php

namespace App\Controllers;

use App\Models\UbicacionModel;
use CodeIgniter\RESTful\ResourceController;

class UbicacionController extends ResourceController
{
    protected $modelName = 'App\Models\UbicacionModel';
    protected $format = 'json';
    
    protected $ubicacionModel;
    
    public function __construct()
    {
        $this->ubicacionModel = new UbicacionModel();
    }

    /**
     * Get all active municipal locations
     */
    public function index()
    {
        try {
            $ubicaciones = $this->ubicacionModel->getActiveMunicipalLocations();

            return $this->respond([
                'success' => true,
                'data' => $ubicaciones
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener ubicaciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get location by ID
     */
    public function show($id = null)
    {
        try {
            $ubicacion = $this->ubicacionModel->getLocationById($id);
            
            if (!$ubicacion) {
                return $this->fail('Ubicación no encontrada', 404);
            }

            return $this->respond([
                'success' => true,
                'data' => $ubicacion
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener ubicación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get locations by municipality
     */
    public function getByMunicipality($municipality = null)
    {
        try {
            if (!$municipality) {
                return $this->fail('Municipio requerido', 400);
            }

            $ubicaciones = $this->ubicacionModel->getLocationsByMunicipality($municipality);

            return $this->respond([
                'success' => true,
                'data' => $ubicaciones
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener ubicaciones por municipio: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}