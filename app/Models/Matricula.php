<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Matricula extends Model
{
    protected $table = 'matriculas';

    protected $fillable = [
        'estudiante_id',
        'grado_id',
        'periodo_escolar',
        'status_inscripcion', // 'activo', 'retirado', 'aprobado', 'nuevo_ingreso_p'
        'condicion',          // 'regular', 'nuevo'
        'apreciacion',
        'institucion_procedencia',
        'talla_camisa',
        'talla_pantalon',
        'talla_zapato',
        'fecha_registro'
    ];

    protected $casts = [
        'fecha_registro' => 'date',
        'estudiante_id' => 'integer',
        'grado_id' => 'integer',
    ];

    /**
     * RELACIONES
     */

    // A qué estudiante pertenece esta matrícula
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    // A qué grado pertenece en este periodo
    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }

    /**
     * SCOPES
     */

    // Filtrar rápidamente por periodo actual
    public function scopePeriodoActual($query)
    {
        // Supongamos que tienes una tabla o helper que te da el periodo activo
        $periodo = PeriodoEscolar::first()->periodo_actual;
        return $query->where('periodo_escolar', $periodo);
    }
}