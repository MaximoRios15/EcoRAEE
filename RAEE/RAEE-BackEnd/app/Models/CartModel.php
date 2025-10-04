<?php

namespace App\Models;

use CodeIgniter\Model;

class CartModel extends Model
{
    protected $table = 'carrito_compras';
    protected $primaryKey = 'idCarrito_Compras';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'usuarios_Carrito',
        'equipos_Carrito',
        'publicacion_Carrito',
        'Cantidad_Carrito',
        'FechaAgregado_Carrito',
        'Activo_Carrito'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat = 'datetime';
    protected $createdField = 'FechaAgregado_Carrito';
    protected $updatedField = '';
    protected $deletedField = '';

    // Validation
    protected $validationRules = [
        'usuarios_Carrito' => 'required|integer',
        'equipos_Carrito' => 'required|integer',
        'publicacion_Carrito' => 'required|integer',
        'Cantidad_Carrito' => 'required|integer|greater_than[0]',
        'Activo_Carrito' => 'permit_empty|integer'
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = [];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    /**
     * Get user's active cart items with equipment details
     */
    public function getUserCart($userId)
    {
        $builder = $this->db->table('carrito_compras c');
        $builder->select('
            c.*,
            e.Marca_Equipos,
            e.Modelo_Equipos,
            e.Descripcion_Equipos,
            e.PesoKG_Equipos,
            e.ImagenPrincipal_Equipos,
            cat.Nombres_Categorias,
            est.Nombres_Estados,
            p.Puntos_Publicacion
        ');
        $builder->join('equipos e', 'c.equipos_Carrito = e.idEquipos');
        $builder->join('categorias_equipos cat', 'e.idCategorias_Equipos = cat.idCategorias');
        $builder->join('estados est', 'e.idEstados_Equipos = est.idEstados');
        $builder->join('publicacion p', 'c.publicacion_Carrito = p.idPublicacion');
        $builder->where('c.usuarios_Carrito', $userId);
        $builder->where('c.Activo_Carrito', 1);
        $builder->orderBy('c.FechaAgregado_Carrito', 'DESC');

        return $builder->get()->getResultArray();
    }

    /**
     * Get cart item count for user
     */
    public function getCartItemCount($userId)
    {
        return $this->where('usuarios_Carrito', $userId)
                    ->where('Activo_Carrito', 1)
                    ->countAllResults();
    }

    /**
     * Get cart total points for user
     */
    public function getCartTotalPoints($userId)
    {
        $builder = $this->db->table('carrito_compras c');
        $builder->select('SUM(c.Cantidad_Carrito * p.Puntos_Publicacion) as total_points');
        $builder->join('publicacion p', 'c.publicacion_Carrito = p.idPublicacion');
        $builder->where('c.usuarios_Carrito', $userId);
        $builder->where('c.Activo_Carrito', 1);

        $result = $builder->get()->getRowArray();
        return $result['total_points'] ?? 0;
    }
}
