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
        Schema::create('zonificacions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('restrict');
            $table->foreignId('periodo_id')->constrained('periodo_escolars')->onDelete('restrict');
            $table->foreignId('grado_id')->constrained('grados')->onDelete('restrict');
            $table->foreignId('plantel_id')->nullable()->constrained('plantels')->onDelete('set null');
            $table->string('asiste')->nullable()->default('Si');
            $table->date('fecha_registro')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zonificacions');
    }
};
