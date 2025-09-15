<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTecnicosTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'direccion_taller' => [
                'type' => 'TEXT',
            ],
            'especialidades' => [
                'type' => 'JSON',
                'comment' => 'Array de especialidades: computadoras, celulares, electrodomesticos, televisores',
            ],
            'servicios_ofrecidos' => [
                'type' => 'JSON',
                'comment' => 'Array de servicios: reparacion_equipos, recuperacion_partes, reciclaje_componentes, adquisicion_puntos',
            ],
            'horario_atencion' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => true,
            ],
            'descripcion_adicional' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'certificaciones' => [
                'type' => 'JSON',
                'null' => true,
                'comment' => 'Array de rutas de archivos de certificaciones',
            ],
            'verificado' => [
                'type' => 'BOOLEAN',
                'default' => false,
            ],
            'calificacion_promedio' => [
                'type' => 'DECIMAL',
                'constraint' => '3,2',
                'default' => 0.00,
            ],
            'total_servicios' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('tecnicos');
    }

    public function down()
    {
        $this->forge->dropTable('tecnicos');
    }
}
