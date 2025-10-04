<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $modelName = 'App\Models\CategoryModel';
    protected $format = 'json';
    
    protected $categoryModel;
    
    public function __construct()
    {
        $this->categoryModel = new CategoryModel();
    }

    /**
     * Get all categories
     */
    public function index()
    {
        try {
            $categories = $this->categoryModel->where('Activo_Categorias', 1)
                                            ->orderBy('Nombres_Categorias', 'ASC')
                                            ->findAll();

            return $this->respond([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener categorías: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get category by ID
     */
    public function show($id = null)
    {
        try {
            $category = $this->categoryModel->find($id);
            
            if (!$category) {
                return $this->fail('Categoría no encontrada', 404);
            }

            return $this->respond([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener categoría: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}