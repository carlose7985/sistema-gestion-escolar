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
        Schema::create('asistencia_empleados', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->nullable();
            $table->string('mes')->nullable();
            $table->string('tipo_de_cargo')->nullable();
            $table->time('hora_entrada')->nullable();
            $table->time('hora_salida')->nullable();
            $table->string('status')->nullable();
            $table->string('metodo')->nullable();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencia_empleados');
    }
};
