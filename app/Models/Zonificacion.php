<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Zonificacion extends Model
{
    use HasFactory;

    protected $table = 'zonificacions';

    protected $fillable = [
        'estudiante_id',
        'periodo_id',
        'grado_id',
        'plantel_id',
        'asiste',
        'fecha_registro',
    ];

    // Relación con Estudiante
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    // Relación con PeriodoEscolar
    public function periodo()
    {
        return $this->belongsTo(PeriodoEscolar::class, 'periodo_id');
    }

    // Relación con el grado de origen
    public function grado()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }

    // Relación con el plantel de destino
    public function plantel()
    {
        return $this->belongsTo(Plantel::class, 'plantel_id');
    }

    // Atributo para calcular la edad automáticamente
    public function getAgeAttribute()
    {
        return Carbon::parse($this->fecha_de_nacimiento)->age;
    }
}
