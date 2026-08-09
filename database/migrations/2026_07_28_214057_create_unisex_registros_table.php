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
        Schema::create('unisex_registros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('grado_id')->nullable()->constrained('grados')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->date('fecha_registro')->nullable();
            $table->timestamps();

            // Índice para evitar duplicados
            $table->unique('estudiante_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unisex_registros');
    }
};
