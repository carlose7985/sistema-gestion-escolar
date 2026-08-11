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
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('apellido');
            $table->string('cedula')->unique();
            $table->string('documento')->nullable()->default('V');
            $table->string('sexo');
            $table->date('fecha_de_nacimiento');
            $table->string('lugar_de_nacimiento');
            $table->string('entidad_federal');
            $table->string('etnia');
            // Relaciones familiares fijas
            $table->foreignId('representante_id')->constrained('responsables');
            $table->foreignId('padre_id')->constrained('responsables');
            $table->string('parentesco')->nullable();
            // Salud (Suele mantenerse, se puede actualizar aquí mismo)
            $table->string('enfermedades');
            $table->string('tratamiento_medico');
            $table->string('alergico');
            $table->string('condicion_especial');
            $table->string('problemas_fisicos');
            $table->string('cedulado')->nullable()->default('No');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};
