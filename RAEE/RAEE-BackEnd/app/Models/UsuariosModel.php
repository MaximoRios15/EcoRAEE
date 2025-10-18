<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuariosModel extends Model
{
    protected $table            = 'usuarios';
    protected $primaryKey       = 'idUsuarios';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'DNI_Usuarios',
        'Nombres_Usuarios',
        'Apellidos_Usuarios',
        'Roles_Usuarios',
        'Email_Usuarios',
        'Telefono_Usuarios',
        'Password_Usuarios',
        'Puntos_Usuarios',
        'idDirecciones_Usuarios',
        'ImagenPerfil_Usuarios',
        'FechaRegistro_Usuarios',
        'Activo_Usuarios',
    ];
    
    protected $useTimestamps = false;

    protected $validationRules = [
        'DNI_Usuarios'           => 'required|min_length[7]|max_length[8]|is_natural',
        'Nombres_Usuarios'       => 'required|min_length[2]',
        'Apellidos_Usuarios'     => 'required|min_length[2]',
        'Roles_Usuarios'         => 'required|in_list[1,2,3]',
        'Email_Usuarios'         => 'permit_empty|valid_email',
        'Telefono_Usuarios'      => 'permit_empty|min_length[6]',
        'Password_Usuarios'      => 'required|min_length[6]',
        'idDirecciones_Usuarios' => 'permit_empty|is_natural',
        'Puntos_Usuarios'        => 'permit_empty|is_natural',
        'ImagenPerfil_Usuarios'  => 'permit_empty',
        'FechaRegistro_Usuarios' => 'permit_empty',
        'Activo_Usuarios'        => 'permit_empty|in_list[0,1]',
    ];

    protected $validationMessages = [];
    protected $skipValidation     = false;

    public function findByDni(string $dni): ?array
    {
        $user = $this->where('DNI_Usuarios', $dni)->first();
        return $user ?: null;
    }

    public function findByEmail(?string $email): ?array
    {
        if (!$email) {
            return null;
        }
        $user = $this->where('Email_Usuarios', $email)->first();
        return $user ?: null;
    }
}


