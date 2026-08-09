<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class DiaFestivo extends Model
{

    protected $table = 'dia_festivos'; // Forzamos el nombre de tu esquema
    protected $fillable = [
        'fecha',
        'descripcion',
    ];

    protected $casts = [
        'fecha' => 'date', // O 'datetime'
    ];
}
