<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CupoEstudiante extends Model
{
    protected $table = 'cupo_estudiantes';
    protected $fillable = [
        'name',
        'sexo',
        'documento',
        'cedula',
        'grado_id',
        'status',
        'institucion_procedencia',
        'fecha_registro',
        'ciudad_procedencia',
        'periodo_escolar'
    ];

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }
}
