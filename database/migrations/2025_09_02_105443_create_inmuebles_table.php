<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inmuebles', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_de_inmueble');
            $table->string('largo')->nullable();
            $table->string('ancho')->nullable();
            $table->string('alto')->nullable();
            $table->string('color')->nullable();
            $table->string('costo_aproximado')->nullable();
            $table->string('ubicacion'); // Ejemplo: Aula 1, Biblioteca
            $table->integer('cantidad')->nullable();
            $table->string('condicion_legal')->nullable(); // Ejemplo: Propio, Prestado, Alquilado, Gestionado
            $table->text('id_scan')->nullable(); // Aquí se guarda el contenido del QR
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inmuebles');
    }
};
