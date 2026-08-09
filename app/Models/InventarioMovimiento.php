<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventarioMovimiento extends Model
{
    protected $fillable = [
        'rubros_cantidad',
        'estudiantes',
        'cocineras',
        'personal',
        'tipo',
        'fecha',
        'descripcion'
    ];

    protected $casts = [
        'rubros_cantidad' => 'array', // Esto evita el error "Array to string conversion"
        'fecha' => 'date'
    ];
}
