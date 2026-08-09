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
        Schema::create('matricula_inicials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grado_id')->constrained('grados')->onDelete('cascade');
            $table->string('periodo_escolar')->nullable();
            $table->string('nombre_grado_snapshot')->nullable();

            // Campos de totales
            $table->integer('total_varones')->nullable();
            $table->integer('total_hembras')->nullable();
            $table->integer('total_general')->nullable();

            // Campos para edades 4-16 (varones y hembras)
            for ($i = 4; $i <= 16; $i++) {
                $table->integer("v_$i")->default(0); // Varones de X años
                $table->integer("h_$i")->default(0); // Hembras de X años
            }

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matricula_inicials');
    }
};
