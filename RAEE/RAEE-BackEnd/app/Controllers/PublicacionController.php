<?php

namespace App\Controllers;

use App\Models\PublicacionModel;
use CodeIgniter\RESTful\ResourceController;

class PublicacionController extends ResourceController
{
    protected $modelName = 'App\Models\PublicacionModel';
    protected $format = 'json';
    
    protected $publicacionModel;
    
    public function __construct()
    {
        $this->publicacionModel = new PublicacionModel();
    }

    /**
     * Obtener publicaciones del usuario autenticado
     */
    public function getUserPublications()
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 10;
            
            $result = $this->publicacionModel->getUserPublications($userId, $page, $perPage);

            return $this->respond([
                'success' => true,
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener publicaciones del usuario: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Obtener todas las publicaciones para la tienda de canjes
     */
    public function getAllPublications()
    {
        try {
            $page = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            
            // Consulta directa para debugging
            $db = \Config\Database::connect();
            $query = $db->query("
                SELECT p.*, 
                       e.Marca_Equipos, e.Modelo_Equipos, e.Descripcion_Equipos, e.FechaIngreso_Equipos,
                       e.PesoKG_Equipos, e.Cantidad_Equipos, e.DimencionesCM_Equipos, e.Accesorios_Equipos,
                       c.Nombres_Categorias, c.idCategorias,
                       est.Nombres_Estados, est.idEstados,
                       u.Nombres_Usuarios, u.Apellidos_Usuarios,
                       ub.Direccion_Ubicaciones, ub.Municipios_Ubicaciones, ub.Provincia_Ubicaciones
                FROM publicacion p
                LEFT JOIN equipos e ON p.equipos_Publicacion = e.idEquipos
                LEFT JOIN categorias_equipos c ON e.idCategorias_Equipos = c.idCategorias
                LEFT JOIN estados est ON p.estados_Publicacion = est.idEstados
                LEFT JOIN usuarios u ON p.clientes_Publicacion = u.idUsuarios
                LEFT JOIN ubicaciones_recoleccion ur ON p.idPublicacion = ur.publicacion_Recoleccion
                LEFT JOIN ubicaciones ub ON ur.ubicaciones_Recoleccion = ub.idUbicaciones
                ORDER BY p.Fecha_Publicacion DESC
            ");
            
            $publications = $query->getResultArray();
            
            // Aplicar incremento del 15% a los puntos y redondear a números enteros simples
            foreach ($publications as &$publication) {
                if (isset($publication['Puntos_Publicacion']) && $publication['Puntos_Publicacion'] > 0) {
                    $originalPoints = $publication['Puntos_Publicacion'];
                    $increasedPoints = $originalPoints * 1.15; // Incremento del 15%
                    
                    // Redondear a múltiplos de 5 para números enteros más simples
                    $roundedPoints = round($increasedPoints / 5) * 5;
                    $publication['Puntos_Publicacion'] = $roundedPoints;
                    
                    log_message('info', "Puntos actualizados - Original: {$originalPoints}, Incremento: {$increasedPoints}, Redondeado: {$publication['Puntos_Publicacion']}");
                }
            }
            
            log_message('info', 'Total publicaciones encontradas: ' . count($publications));
            
            // Aplicar paginación manualmente
            $total = count($publications);
            $offset = ($page - 1) * $perPage;
            $paginatedData = array_slice($publications, $offset, $perPage);

            return $this->respond([
                'success' => true,
                'data' => $paginatedData,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => ceil($total / $perPage)
                ]
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener todas las publicaciones: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Obtener una publicación específica
     */
    public function show($id = null)
    {
        try {
            // Obtener ID del usuario desde los parámetros de la URL
            $userId = $this->request->getGet('user_id');
            
            if (!$userId) {
                return $this->fail('ID de usuario requerido', 400);
            }

            if (!$id) {
                return $this->fail('ID de publicación requerido', 400);
            }

            $publication = $this->publicacionModel->getPublicationWithDetails($id);
            
            if (!$publication) {
                return $this->fail('Publicación no encontrada', 404);
            }

            // Verificar que la publicación pertenece al usuario
            if ($publication['clientes_Publicacion'] != $userId) {
                return $this->fail('No tienes permisos para ver esta publicación', 403);
            }

            return $this->respond([
                'success' => true,
                'data' => $publication
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener publicación: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

}
