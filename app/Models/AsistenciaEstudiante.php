<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AsistenciaEstudiante extends Model
{
    use HasFactory;
    protected $table = 'asistencia_estudiantes';
    protected $fillable = [
        'fecha',
        'varones',
        'hembras',
        'total',
        'grado_id',
    ];

    public function grados()
    {

        return $this->belongsTo(Grado::class);
    }
}
