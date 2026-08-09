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
        Schema::create('matricula_finals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grado_id')->constrained('grados')->onDelete('cascade');
            $table->string('periodo_escolar')->nullable();
            $table->string('nombre_grado_snapshot')->nullable();
            $table->integer('total_varones')->nullable();
            $table->integer('total_hembras')->nullable();
            $table->integer('total_general')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matricula_finals');
    }
};
