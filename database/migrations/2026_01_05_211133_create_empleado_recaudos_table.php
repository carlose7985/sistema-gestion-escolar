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
        Schema::create('empleado_recaudos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->string('profesion')->nullable();
            $table->string('etiqueta')->nullable();
            $table->string('talla')->nullable(); // Ej: S, M, L, XL o numerica
            $table->string('cargo_entrega')->nullable(); // El cargo al momento del registro
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleado_recaudos');
    }
};
