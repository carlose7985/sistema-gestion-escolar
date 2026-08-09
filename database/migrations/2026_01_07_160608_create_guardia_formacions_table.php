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
        Schema::create('guardia_formacions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')
                ->nullable()
                ->constrained('empleado_activos')
                ->onDelete('cascade');

            $table->integer('mes');
            $table->integer('anio');
            $table->string('dia_semana');
            $table->string('item');

            // 2. Mantenemos el índice único para evitar duplicados exactos
            $table->unique(['mes', 'anio', 'dia_semana', 'item'], 'guardia_unica_celda');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardia_formacions');
    }
};
