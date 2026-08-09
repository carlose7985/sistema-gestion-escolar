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
        Schema::create('wifi_pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wifi_afiliado_id')->constrained('wifi_afiliados')->onDelete('cascade');
            $table->date('periodo_pagado');
            $table->dateTime('fecha_pago')->nullable(); // Cuándo hizo el click
            $table->string('estado')->default('Pendiente'); // 'Pendiente' o 'Pagado'
            $table->timestamps();
            $table->unique(['wifi_afiliado_id', 'periodo_pagado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_pagos');
    }
};
