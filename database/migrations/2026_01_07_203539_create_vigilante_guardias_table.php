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
        Schema::create('vigilante_guardias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->string('tipo_de_personal');
            $table->json('dias_guardia'); // Almacena los días como array JSON
			$table->string('status')->nullable()->default('Asistio');
            $table->unique(['empleado_id']); // Un empleado solo puede estar una vez
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vigilante_guardias');
    }
};
