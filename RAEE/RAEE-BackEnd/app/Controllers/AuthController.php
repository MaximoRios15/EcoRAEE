<?php

namespace App\Controllers;

use App\Models\UsuariosModel;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class AuthController extends BaseController
{
    use ResponseTrait;

    public function health()
    {
        return $this->respond(['status' => 'ok'], 200);
    }

    public function register()
    {
        $usuarios = new UsuariosModel();
        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        if (!$data) {
            return $this->failValidationErrors('No data provided');
        }

        // Required minimal fields
        $required = ['DNI_Usuarios', 'Nombres_Usuarios', 'Apellidos_Usuarios', 'Roles_Usuarios', 'Password_Usuarios'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return $this->failValidationErrors("Campo requerido faltante: {$field}");
            }
        }

        // Unique checks
        if ($usuarios->findByDni($data['DNI_Usuarios'])) {
            return $this->failResourceExists('El DNI ya está registrado');
        }
        if (!empty($data['Email_Usuarios']) && $usuarios->findByEmail($data['Email_Usuarios'])) {
            return $this->failResourceExists('El email ya está registrado');
        }

        // Eliminada verificación de correo: no se requiere correo verificado en esta etapa

        $db = \Config\Database::connect();
        $db->transStart();

        // Si viene dirección anidada, insertarla primero y vincular al usuario
        if (!empty($data['direccion']) && is_array($data['direccion'])) {
            $direccionRaw = $data['direccion'];

            // Normalizar y filtrar campos de direcciones permitidos
            $direccionData = [
                'Calle_Direcciones'        => $direccionRaw['Calle_Direcciones']        ?? null,
                'Numero_Direcciones'       => $direccionRaw['Numero_Direcciones']       ?? null,
                'Piso_Direcciones'         => $direccionRaw['Piso_Direcciones']         ?? null,
                'Departamento_Direcciones' => $direccionRaw['Departamento_Direcciones'] ?? null,
                'Barrio_Direcciones'       => $direccionRaw['Barrio_Direcciones']       ?? null,
                'Longitud_Ubicaciones'     => $direccionRaw['Longitud_Ubicaciones']     ?? null,
                'Latitud_Ubicaciones'      => $direccionRaw['Latitud_Ubicaciones']      ?? null,
                'idMunicipios_Direcciones' => isset($direccionRaw['idMunicipios_Direcciones']) ? (int) $direccionRaw['idMunicipios_Direcciones'] : null,
            ];

            if (empty($direccionData['idMunicipios_Direcciones'])) {
                $db->transRollback();
                return $this->failValidationErrors('idMunicipios_Direcciones es requerido en direccion');
            }

            $direcciones = new \App\Models\DireccionesModel();
            if (!$direcciones->insert($direccionData, true)) {
                $db->transRollback();
                return $this->failValidationErrors($direcciones->errors());
            }

            $idDireccion = $direcciones->getInsertID();
            $data['idDirecciones_Usuarios'] = $idDireccion;
            unset($data['direccion']);
        }

        // Hash password
        $data['Password_Usuarios'] = password_hash($data['Password_Usuarios'], PASSWORD_BCRYPT);

        // Defaults para columnas existentes en la tabla usuarios
        if (!isset($data['Puntos_Usuarios'])) {
            $data['Puntos_Usuarios'] = 0;
        }
        if (!isset($data['Activo_Usuarios'])) {
            $data['Activo_Usuarios'] = 1;
        }
        if (!isset($data['FechaRegistro_Usuarios'])) {
            $data['FechaRegistro_Usuarios'] = date('Y-m-d H:i:s');
        }
        // Imagen de perfil aleatoria si no viene definida
        if (empty($data['ImagenPerfil_Usuarios'])) {
            $profileImages = [
                'perfil1animal.png',
                'perfil1flores.png',
                'perfil2animal.png',
                'perfil2flores.png',
                'perfil3animal.png',
                'perfil3flores.png',
                'perfil4animal.png',
                'perfil4flores.png',
                'perfil5animal.png',
                'perfil5flores.png',
            ];
            $data['ImagenPerfil_Usuarios'] = 'profile/' . $profileImages[array_rand($profileImages)];
        }

        if (!$usuarios->insert($data, true)) {
            $db->transRollback();
            return $this->failValidationErrors($usuarios->errors());
        }

        $db->transComplete();

        $insertedId = $usuarios->getInsertID();
        $user       = $usuarios->find($insertedId);
        unset($user['Password_Usuarios']);

        return $this->respondCreated([
            'message' => 'Usuario creado correctamente',
            'user'    => $user,
        ]);
    }

    public function login()
    {
        $usuarios = new UsuariosModel();
        $data = $this->request->getJSON(true) ?: $this->request->getPost();

        $dni = $data['DNI_Usuarios'] ?? null;
        $password = $data['Password_Usuarios'] ?? null;

        if (!$dni || !$password) {
            return $this->failValidationErrors('DNI y contraseña son requeridos');
        }

        $user = $usuarios->findByDni($dni);
        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        if (!password_verify($password, $user['Password_Usuarios'])) {
            return $this->fail('Credenciales inválidas', ResponseInterface::HTTP_UNAUTHORIZED);
        }

        unset($user['Password_Usuarios']);

        return $this->respond(['message' => 'Inicio de sesión exitoso', 'user' => $user]);
    }

    public function validateDni()
    {
        $usuarios = new UsuariosModel();
        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        $dni = $data['dni'] ?? null;
        if (!$dni) {
            return $this->failValidationErrors('dni requerido');
        }
        $exists = (bool) $usuarios->findByDni($dni);
        return $this->respond(['exists' => $exists]);
    }
}


