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
        Schema::create('responsables', function (Blueprint $table) {
            $table->id();
            $table->string('name_r')->nullable();
            $table->string('cedula_r')->unique()->nullable();
            $table->string('documento_r')->default('V-')->nullable();
            $table->string('sexo_r')->nullable();
            $table->date('fecha_de_nacimiento_r')->nullable();
            $table->string('direccion_r')->nullable();
            $table->string('telefono_r')->nullable();
            $table->string('ocupacion_r')->nullable();
            $table->string('status_r')->default('Activo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responsables');
    }
};
