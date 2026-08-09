<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialCierre extends Model
{
    protected $fillable = ['fecha_cierre', 'detalle_stock', 'motivo_cierre'];

    
}
