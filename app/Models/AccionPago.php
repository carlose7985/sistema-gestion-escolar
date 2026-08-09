<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccionPago extends Model
{
    protected $fillable = [
        'empleado_id',
        'accion_tipo_id',
        'monto_item',
        'metodo_item',
        'ref_item',
        'fecha_pago',
    
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto_item' => 'decimal:2',
    ];

    public function empleado()
    {
        return $this->belongsTo(EmpleadoActivo::class);
    }

    public function tipo()
    {
        return $this->belongsTo(AccionTipo::class, 'accion_tipo_id');
    }
}
