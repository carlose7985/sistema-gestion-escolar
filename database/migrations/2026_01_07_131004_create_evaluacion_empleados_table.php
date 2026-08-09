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
        Schema::create('evaluacion_empleados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->decimal('puntuacion', 5, 2); // Puntuación del 0 al 100
            $table->string('periodo_evaluacion'); // Ej: "Enero-Marzo 2024"
            $table->date('fecha_evaluacion')->default(now());
            $table->string('periodo_actual')->nullable(); // Criterios de evaluación en JSON
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluacion_empleados');
    }
};
