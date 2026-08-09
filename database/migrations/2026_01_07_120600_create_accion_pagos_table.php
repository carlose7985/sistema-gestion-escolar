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
        Schema::create('accion_pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->foreignId('accion_tipo_id')->constrained();

            // Pago del Item/Combo
            $table->decimal('monto_item', 10, 2);
            $table->string('metodo_item'); // Efectivo, Transferencia...
            $table->string('ref_item')->nullable(); // Código de transferencia

            $table->date('fecha_pago');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accion_pagos');
    }
};
