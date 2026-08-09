<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpleadoRecaudo extends Model
{
    protected $fillable = ['empleado_id', 'profesion','etiqueta', 'talla', 'cargo_entrega'];

    public function empleado()
    {
        return $this->belongsTo(EmpleadoActivo::class);
    }
}
