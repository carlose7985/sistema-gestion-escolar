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
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');

            // Campo clave: Eventual, Vacacion, Permanente
            $table->string('tipo');

            // Campos de rango (Usados por Eventual y Vacación)
            $table->date('fecha_de_inicio')->nullable();
            $table->date('fecha_final')->nullable();

            // Campo específico (Usado por Permanente)
            $table->string('dia')->nullable();

            // Campos comunes
            $table->text('descripcion')->nullable();
            $table->string('status')->default('Activo');
            $table->date('fecha_registro')->nullable(); // Lo que antes llamabas 'fecha'

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permisos');
    }
};
