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
        Schema::create('historial_cierres', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_cierre');
            $table->json('detalle_stock'); // Guardaremos una "foto" de todo lo que había: {arroz: 7, pollo: 5}
            $table->string('motivo_cierre');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_cierres');
    }
};
