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
        Schema::create('institucions', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_de_la_institucion');
            $table->string('direccion');
            $table->string('email');
            $table->string('telefono');
            $table->string('rif');
            $table->string('nif');
            $table->string('zona_educativa');
            $table->string('codigo_dea');
            $table->string('dependencia');
            $table->string('codigo_de_dependencia');
            $table->string('codigo_estadistico');
            $table->string('codigo_cenae');
            $table->string('codigo_primaria');
            $table->string('circuito');
            $table->string('codigo_circuito');
            $table->date('fecha_de_fundada');
            $table->string('estado');
            $table->string('municipio');
            $table->string('parroquia');           
            $table->string('comuna');
            $table->string('codigo_electoral');
            $table->string('turno');
            $table->string('medio');
            $table->string('tipo_de_escuela');
            $table->string('numero_de_aulas');
            $table->string('numero_de_secciones');
            $table->string('otras_aulas');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institucions');
    }
};
