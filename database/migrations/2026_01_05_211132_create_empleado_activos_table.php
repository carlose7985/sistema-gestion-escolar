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
        Schema::create('empleado_activos', function (Blueprint $table) {
            $table->id();
            $table->string('nombres')->nullable();
            $table->string('apellidos')->nullable();
            $table->string('documento')->nullable()->default('V-');
            $table->string('cedula')->unique();
            $table->string('sexo')->nullable();
            $table->string('foto')->nullable();
            $table->string('codigo_qr')->nullable();
            $table->json('rostro_data')->nullable();
            $table->string('huella_id')->nullable()->unique();
            $table->date('fecha_de_nacimiento')->nullable();
            $table->string('lugar_de_nacimiento')->nullable();
            $table->string('direccion_de_habitacion')->nullable();
            $table->string('parroquia')->nullable();
            $table->string('telefono')->nullable();
            $table->string('correo_electronico')->nullable();
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
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleado_activos');
    }
};
