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
        Schema::create('wifi_afiliados', function (Blueprint $table) {
            $table->id();
            // Relación con tu tabla existente
            $table->foreignId('empleado_id')->constrained('empleado_activos')->onDelete('cascade');
            $table->string('identificador_dispositivo')->nullable(); // Aquí va el IMEI o IP
            $table->string('status')->default('Activo'); // activo, suspendido
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_afiliados');
    }
};
