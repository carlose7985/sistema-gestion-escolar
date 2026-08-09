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
        Schema::create('estudiante_periodos', function (Blueprint $table) {
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('restrict');
            $table->foreignId('periodo_id')->constrained('periodo_escolars')->onDelete('restrict');
            $table->foreignId('grado_id')->constrained('grados')->onDelete('restrict');

            // Datos que cambian por año (Crecimiento y ubicación)
            $table->string('direccion');
            $table->string('instituto_de_procedencia');
            $table->string('lateralidad');
            $table->string('talla_de_camisa');
            $table->string('talla_de_pantalon');
            $table->string('talla_de_zapato');

            // Control de Estado (Lo que definía tus tablas anteriores)
            $table->string('condicion');        // Ejemplo: Nuevo, Regular, Repitiente
            $table->string('status');           // Ejemplo: Activo, Retirado, Egresado
            $table->string('status_escolar');   // Ejemplo: Aprobado, Reprobado, Pendiente

            // Otros campos de control
            $table->string('matricula_sisge')->nullable();
            $table->string('status_sisge')->nullable();
            $table->string('apreciacion');
            $table->string('actualizado')->nullable();
            $table->string('contador_impresiones')->nullable()->default('0');

            $table->string('calificado')->nullable();
            $table->date('fecha_registro')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiante_periodos');
    }
};
