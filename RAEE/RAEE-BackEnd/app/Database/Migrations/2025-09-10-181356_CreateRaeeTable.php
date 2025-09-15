<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRaeeTable extends Migration
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
            'tipo_dispositivo' => [
                'type' => 'ENUM',
                'constraint' => ['electrodomestico', 'computadora', 'celular', 'tablet', 'televisor', 'otro'],
            ],
            'marca' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'modelo' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'estado_dispositivo' => [
                'type' => 'ENUM',
                'constraint' => ['funcionando', 'dañado', 'para_partes'],
            ],
            'descripcion' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'fotos' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'peso_estimado' => [
                'type' => 'DECIMAL',
                'constraint' => '5,2',
                'null' => true,
            ],
            'puntos_valor' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'estado_publicacion' => [
                'type' => 'ENUM',
                'constraint' => ['disponible', 'reservado', 'retirado', 'reutilizado'],
                'default' => 'disponible',
            ],
            'metodo_entrega' => [
                'type' => 'ENUM',
                'constraint' => ['punto_recoleccion', 'domicilio'],
                'default' => 'punto_recoleccion',
            ],
            'direccion_entrega' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'fecha_preferida' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'franja_horaria' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
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
        $this->forge->createTable('raee');
    }

    public function down()
    {
        $this->forge->dropTable('raee');
    }
}
