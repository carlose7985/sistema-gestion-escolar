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
        Schema::create('periodo_escolars', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_periodo', 20)->comment('Ejemplo: 2026-2027');
            $table->enum('status_periodo', ['Abierto', 'Cerrado', 'Culminado'])->default('Abierto');
            $table->enum('inscribe', ['Si', 'No'])->default('No');
            $table->enum('status', ['Activo', 'Inactivo', 'Finalizado'])->default('Inactivo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periodo_escolars');
    }
};
