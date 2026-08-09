<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpleadoRetirado extends Model
{
    protected $table = 'empleado_retirados';
    protected $guarded = ['id'];
    protected $casts = [
        'area_de_trabajo' => 'array',
    ];
}
