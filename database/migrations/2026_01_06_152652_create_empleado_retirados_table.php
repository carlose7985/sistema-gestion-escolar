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
        Schema::create('empleado_retirados', function (Blueprint $table) {
            $table->id();
            $table->string('nombres')->nullable();
            $table->string('apellidos')->nullable();
			$table->string('documento')->nullable()->default('V-');
            $table->string('cedula')->unique();
            $table->string('sexo')->nullable()->nullable();
            $table->date('fecha_de_nacimiento')->nullable()->nullable();
            $table->string('lugar_de_nacimiento')->nullable()->nullable();
            $table->string('direccion_de_habitacion')->nullable()->nullable();
            $table->string('parroquia')->nullable()->nullable();
            $table->string('telefono')->nullable()->nullable();
            $table->string('correo_electronico')->nullable()->nullable();
            $table->string('grado_de_intruccion')->nullable();
            $table->string('profesion')->nullable();
            $table->string('tipo_de_personal')->nullable();
            $table->string('cargo_en_el_perror')->nullable();
            $table->string('codigo_del_cargo')->nullable();
            $table->string('condicion_del_cargo')->nullable();
            $table->string('status_del_cargo')->nullable();
            $table->string('fecha_de_ingreso_al_cargo')->nullable();
            $table->string('carga_horaria')->nullable();
            $table->string('dependencia')->nullable();
            $table->string('codigo_de_dependencia')->nullable();
            $table->string('situacion_laboral')->nullable();
            $table->string('status_de_actualizacion')->nullable();
            $table->string('fecha_de_ingreso_al_plantel')->nullable();
            $table->string('funcion_en_el_plantel')->nullable();
            $table->string('area_de_trabajo')->nullable();
            $table->date('fecha_registro')->nullable();
            $table->string('destino')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleado_retirados');
    }
};
