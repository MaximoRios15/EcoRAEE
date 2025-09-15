<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateInstitucionesTable extends Migration
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
            'nombre_institucion' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'tipo_institucion' => [
                'type' => 'ENUM',
                'constraint' => ['escuela_tecnica', 'universidad', 'instituto'],
            ],
            'codigo_postal' => [
                'type' => 'VARCHAR',
                'constraint' => 10,
                'null' => true,
            ],
            'provincia' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'nombre_responsable' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'servicios_ofrecidos' => [
                'type' => 'JSON',
                'comment' => 'Array de servicios: reparacion_equipos, reciclaje_componentes, educacion_tecnica',
            ],
            'descripcion_institucion' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'logo_institucion' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'verificada' => [
                'type' => 'BOOLEAN',
                'default' => false,
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
        $this->forge->createTable('instituciones');
    }

    public function down()
    {
        $this->forge->dropTable('instituciones');
    }
}
