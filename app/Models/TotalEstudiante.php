<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TotalEstudiante extends Model
{
    protected $table = 'total_estudiantes';
    protected $fillable = [
        'periodo_id',
        'varones_existentes',
        'hembras_existentes',
        'total_existentes',
        'varones_asistentes',
        'hembras_asistentes',
        'total_asistentes',
        'fecha_registro',
    ];
    // Relación con PeriodoEscolar
    public function periodo()
    {
        return $this->belongsTo(PeriodoEscolar::class, 'periodo_id');
    }
}
