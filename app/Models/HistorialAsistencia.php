<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistorialAsistencia extends Model
{
    use HasFactory;
	protected $table = "historial_asistencias";
    protected $fillable = ['nombres', 'apellidos', 'cedula', 'fecha_de_asistencia','status_de_asistencia','tipo_de_cargo'];
}
