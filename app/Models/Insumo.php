<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    protected $fillable = ['nombre', 'peso_medida', 'unidad_medida', 'stock_actual'];

    public function movimientos()
    {
        return $this->hasMany(InventarioMovimiento::class);
    }
}
