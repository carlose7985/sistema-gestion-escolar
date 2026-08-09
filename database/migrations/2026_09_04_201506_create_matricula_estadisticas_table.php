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
        Schema::create('matricula_estadisticas', function (Blueprint $table) {
            $table->id();
            $table->string('sexo')->nullable();
            $table->string('edad')->nullable();
            $table->string('cantidad')->nullable()->default('V');
            $table->foreignId('grado_id')->constrained('grados')->onDelete('cascade');
            $table->foreignId('estadistica_id')->nullable()->constrained('estadisticas')->onDelete('cascade');
            $table->string('periodo_escolar')->nullable();
            $table->string('fecha_registro')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matricula_estadisticas');
    }
};
