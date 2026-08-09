<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuardiaFormacion extends Model
{
    use HasFactory;

    protected $table = 'guardia_formacions';

    protected $fillable = [
        'empleado_id',
        'mes',
        'anio',
        'dia_semana',
        'item',
    ];

    public function empleado()
    {
        // Asegúrate de que este modelo exista y apunte a tu tabla 'empleadosactivo'
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }
}
