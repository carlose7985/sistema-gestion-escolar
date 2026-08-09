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
        Schema::create('total_estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_id')->constrained('periodo_escolars')->onDelete('restrict');
            $table->string('varones_existentes');
            $table->string('hembras_existentes');
            $table->string('total_existentes');
            $table->string('varones_asistentes');
            $table->string('hembras_asistentes');
            $table->string('total_asistentes');
            $table->date('fecha_registro');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('total_estudiantes');
    }
};
