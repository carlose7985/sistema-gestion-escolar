<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsistenciaEmpleado extends Model
{
    protected $table = "asistencia_empleados";
    protected $fillable = [
        'fecha',
        'mes',
        'tipo_de_cargo',
        'empleado_id',
        'hora_entrada',
        'hora_salida',
        'status',
        'metodo',
        
    ];

    public function empleados()
    {
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }

    protected $casts = [
        'fecha' => 'date:Y-m-d',  // Forzar formato específico
        'hora_entrada' => 'datetime:H:i:s',
        'hora_salida' => 'datetime:H:i:s',
    ];
}
