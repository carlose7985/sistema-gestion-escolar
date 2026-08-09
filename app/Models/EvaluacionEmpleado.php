<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluacionEmpleado extends Model
{
    use HasFactory;

    protected $table = 'evaluacion_empleados'; // Nombre de tu tabla corregido

    protected $fillable = [
        'empleado_id',
        'puntuacion',
        'periodo_evaluacion',
        'fecha_evaluacion',
        'periodo_actual'
    ];

    protected $casts = [
        'puntuacion' => 'integer',
        'fecha_evaluacion' => 'date',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }
    
}
