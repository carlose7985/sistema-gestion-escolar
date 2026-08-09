<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    protected $fillable = [
        'empleado_id',
        'tipo',
        'fecha_de_inicio',
        'fecha_final',
        'dia',
        'descripcion',
        'status',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_de_inicio' => 'date',
        'fecha_final' => 'date',
        'fecha_registro' => 'date',
    ];

    public function empleado()
    {
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }

    // Scope para filtrar rápido
    public function scopeTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
}
