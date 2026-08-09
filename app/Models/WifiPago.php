<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WifiPago extends Model
{
    protected $table = 'wifi_pagos';
    protected $fillable = ['wifi_afiliado_id', 'fecha_pago', 'periodo_pagado', 'estado'];

    protected $casts = [
        'fecha_pago' => 'datetime',
        'periodo_pagado' => 'date:Y-m-d',
        'estado' => 'string',
    ];

    public function afiliado()
    {
        return $this->belongsTo(WifiAfiliado::class, 'wifi_afiliado_id');
    }
}
