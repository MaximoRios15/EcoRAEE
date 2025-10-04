<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;

class ImageController extends ResourceController
{
    protected $format = 'json';

    /**
     * Upload images for equipment
     */
    public function uploadEquipmentImages()
    {
        try {
            $files = $this->request->getFiles();
            
            if (empty($files['images'])) {
                return $this->fail('No se proporcionaron imágenes', 400);
            }

            $uploadedImages = [];
            $uploadPath = WRITEPATH . 'uploads/equipment/';
            
            // Crear directorio si no existe
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }

            foreach ($files['images'] as $file) {
                if ($file->isValid() && !$file->hasMoved()) {
                    $newName = $file->getRandomName();
                    $file->move($uploadPath, $newName);
                    
                    $uploadedImages[] = [
                        'filename' => $newName,
                        'original_name' => $file->getClientName(),
                        'path' => 'uploads/equipment/' . $newName,
                        'size' => $file->getSize(),
                        'type' => $file->getClientMimeType()
                    ];
                }
            }

            if (empty($uploadedImages)) {
                return $this->fail('No se pudieron subir las imágenes', 400);
            }

            return $this->respond([
                'success' => true,
                'message' => 'Imágenes subidas correctamente',
                'data' => $uploadedImages
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error al subir imágenes: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Get image by filename
     */
    public function getImage($filename)
    {
        try {
            $imagePath = WRITEPATH . 'uploads/equipment/' . $filename;
            
            if (!file_exists($imagePath)) {
                return $this->fail('Imagen no encontrada', 404);
            }

            $mimeType = mime_content_type($imagePath);
            $imageData = file_get_contents($imagePath);

            return $this->response
                ->setHeader('Content-Type', $mimeType)
                ->setBody($imageData);

        } catch (\Exception $e) {
            log_message('error', 'Error al obtener imagen: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }

    /**
     * Delete image
     */
    public function deleteImage($filename)
    {
        try {
            $imagePath = WRITEPATH . 'uploads/equipment/' . $filename;
            
            if (!file_exists($imagePath)) {
                return $this->fail('Imagen no encontrada', 404);
            }

            if (unlink($imagePath)) {
                return $this->respond([
                    'success' => true,
                    'message' => 'Imagen eliminada correctamente'
                ]);
            } else {
                return $this->fail('No se pudo eliminar la imagen', 500);
            }

        } catch (\Exception $e) {
            log_message('error', 'Error al eliminar imagen: ' . $e->getMessage());
            return $this->fail('Error interno del servidor', 500);
        }
    }
}
