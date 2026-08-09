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
        Schema::create('accion_tipos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Combo Marzo 2025
            $table->decimal('costo_base', 10, 2); // Ej: 6000
            $table->boolean('status')->default(1);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accion_tipos');
    }
};
