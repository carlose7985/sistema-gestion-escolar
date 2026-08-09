<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TotalEmpleado extends Model
{
    protected $table = 'total_empleados';
    protected $fillable = [
        'varones_existentes',
        'hembras_existentes',
        'total_existentes',
        'varones_asistentes',
        'hembras_asistentes',
        'total_asistentes',
        'tipo_de_personal',
        'fecha_registro',
    ];
}
