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
        Schema::create('grados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_del_grado')->nullable();
            $table->string('seccion')->nullable();
            $table->string('docente')->nullable();
            $table->string('code_qr')->nullable();
			$table->string('status')->default('Activo');
            $table->integer('limite_de_estudiantes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grados');
    }
};
