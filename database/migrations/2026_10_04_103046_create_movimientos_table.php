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
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();

            // Relaciones principales
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained('periodo_escolars')->onDelete('restrict');

            // Tipo de acción: Ingreso, Retiro, Cambio de Grado, Reingreso, egreso
            $table->string('tipo_de_movimiento');

            // Grados (para saber de dónde venía y a dónde fue en caso de cambios)
            $table->foreignId('grado_id_past')->nullable()->constrained('grados')->onDelete('set null');
            $table->foreignId('grado_id_new')->nullable()->constrained('grados')->onDelete('set null');

            // Detalles adicionales
            $table->string('status')->nullable();          // Activo, Retirado, etc.
            $table->string('matricula_sisge')->nullable()->default('No');  // Motivo del retiro o etiqueta (Escolarizado)
            $table->date('fecha_registro');                // Fecha en que ocurrió el hecho

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
