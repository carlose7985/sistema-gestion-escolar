<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WifiAfiliado extends Model
{
    protected $table = 'wifi_afiliados';

    // IMPORTANTE: Asegúrate que 'telefono_afiliado' esté aquí
    protected $fillable = [
        'empleado_id',
        'identificador_dispositivo',
        'status'
    ];

    public function empleados()
    {
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }

    public function pagos()
    {
        return $this->hasMany(WifiPago::class, 'wifi_afiliado_id');
    }
}
