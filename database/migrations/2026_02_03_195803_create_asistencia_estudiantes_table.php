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
        Schema::create('asistencia_estudiantes', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->string('varones');
            $table->string('hembras');
            $table->string('total');
            $table->foreignId('grado_id')->constrained('grados')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencia_estudiantes');
    }
};
