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
        Schema::create('cierres_mensuales', function (Blueprint $table) {
            $table->id();
            $table->integer('mes');
            $table->integer('anio');
            $table->date('fecha_cierre')->nullable();
            $table->enum('estado', ['Abierto', 'Cerrado'])->default('Abierto');
            $table->timestamps();
            $table->unique(['mes', 'anio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cierres_mensuales');
    }
};
