<?php

namespace App\Controllers;

use App\Models\CartModel;
use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

class CartController extends ResourceController
{
    protected $modelName = 'App\Models\CartModel';
    protected $format = 'json';
    
    protected $cartModel;
    protected $userModel;
    
    public function __construct()
    {
        $this->cartModel = new CartModel();
        $this->userModel = new UserModel();
    }

    /**
     * Get user's cart
     */
    public function index()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $cartItems = $this->cartModel->getUserCart($userId);

            return $this->respond([
                'success' => true,
                'data' => $cartItems
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener carrito: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Add item to cart
     */
    public function add()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data) {
                return $this->fail('No se recibieron datos válidos', 400);
            }

            // Validate required fields
            $requiredFields = ['equipos_Carrito', 'publicacion_Carrito', 'Cantidad_Carrito'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->fail("El campo {$field} es obligatorio", 400);
                }
            }

            // Check if item already exists in cart
            $existingItem = $this->cartModel->where('usuarios_Carrito', $userId)
                                          ->where('equipos_Carrito', $data['equipos_Carrito'])
                                          ->where('Activo_Carrito', 1)
                                          ->first();

            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem['Cantidad_Carrito'] + $data['Cantidad_Carrito'];
                $updated = $this->cartModel->update($existingItem['idCarrito_Compras'], [
                    'Cantidad_Carrito' => $newQuantity
                ]);
                
                if (!$updated) {
                    return $this->fail('Error al actualizar cantidad en carrito', 500);
                }
            } else {
                // Add new item
                $cartData = [
                    'usuarios_Carrito' => $userId,
                    'equipos_Carrito' => $data['equipos_Carrito'],
                    'publicacion_Carrito' => $data['publicacion_Carrito'],
                    'Cantidad_Carrito' => $data['Cantidad_Carrito'],
                    'Activo_Carrito' => 1
                ];

                $cartId = $this->cartModel->insert($cartData);
                
                if (!$cartId) {
                    $errors = $this->cartModel->errors();
                    return $this->fail('Error al agregar al carrito: ' . implode(', ', $errors), 400);
                }
            }

            return $this->respond([
                'success' => true,
                'message' => 'Item agregado al carrito exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al agregar al carrito: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function update($id = null)
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $data = $this->request->getJSON(true);
            
            if (!$data || empty($data['Cantidad_Carrito'])) {
                return $this->fail('Cantidad es obligatoria', 400);
            }

            // Verify item belongs to user
            $item = $this->cartModel->where('idCarrito_Compras', $id)
                                   ->where('usuarios_Carrito', $userId)
                                   ->first();

            if (!$item) {
                return $this->fail('Item no encontrado en carrito', 404);
            }

            $updated = $this->cartModel->update($id, [
                'Cantidad_Carrito' => $data['Cantidad_Carrito']
            ]);

            if (!$updated) {
                return $this->fail('Error al actualizar carrito', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Carrito actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al actualizar carrito: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function remove($id = null)
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            // Verify item belongs to user
            $item = $this->cartModel->where('idCarrito_Compras', $id)
                                   ->where('usuarios_Carrito', $userId)
                                   ->first();

            if (!$item) {
                return $this->fail('Item no encontrado en carrito', 404);
            }

            $deleted = $this->cartModel->update($id, [
                'Activo_Carrito' => 0
            ]);

            if (!$deleted) {
                return $this->fail('Error al remover del carrito', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Item removido del carrito exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al remover del carrito: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Clear user's cart
     */
    public function clear()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $updated = $this->cartModel->where('usuarios_Carrito', $userId)
                                      ->set(['Activo_Carrito' => 0])
                                      ->update();

            if (!$updated) {
                return $this->fail('Error al limpiar carrito', 500);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Carrito limpiado exitosamente'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al limpiar carrito: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

}
