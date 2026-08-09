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
        Schema::create('inventario_movimientos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->enum('tipo', ['entrada', 'salida']);
            // Aquí guardamos el JSON: {"Arroz": "15", "Pasta": "10"}
            $table->json('rubros_cantidad');
            // Datos de comensales (Nullables para cuando sea entrada)
            $table->integer('estudiantes')->nullable();
            $table->integer('cocineras')->nullable();
            $table->integer('personal')->nullable();
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventario_movimientos');
    }
};
