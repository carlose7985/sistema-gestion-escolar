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
        Schema::create('cupo_estudiantes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cedula')->unique();
            $table->string('documento')->default('V');
            $table->string('sexo');
            $table->foreignId('grado_id')->constrained('grados')->onDelete('restrict');
            $table->string('institucion_procedencia');
            $table->string('periodo_escolar');
            $table->string('ciudad_procedencia');
            $table->string('status')->default('Pendiente');
            $table->date('fecha_registro')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cupo_estudiantes');
    }
};
