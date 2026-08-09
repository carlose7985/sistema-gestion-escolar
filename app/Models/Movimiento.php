<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
// use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movimiento extends Model
{
    use HasFactory;
    protected $table = 'movimientos';

    protected $fillable = [
        'estudiante_id',
        'periodo_id',
        'tipo_de_movimiento',
        'grado_id_past',
        'grado_id_new',
        'status',
        'matricula_sisge',
        'fecha_registro'
    ];

    // Relación con el Estudiante (Para obtener nombre, cédula, etc.)
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class);
    }

    // Relación con el Periodo Escolar
    public function periodo(): BelongsTo
    {
        return $this->belongsTo(PeriodoEscolar::class, 'periodo_id');
    }

    // Relación con el Grado Anterior
    public function gradoAnterior(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'grado_id_past');
    }

    // Relación con el Grado Nuevo
    public function gradoNuevo(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'grado_id_new');
    }

    
}
