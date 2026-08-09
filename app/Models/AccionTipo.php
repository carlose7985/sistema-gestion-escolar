<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccionTipo extends Model
{
    protected $fillable = ['nombre', 'costo_base', 'costo_transporte', 'activo'];

    protected $casts = [
        'costo_base' => 'decimal:2',
        'status' => 'boolean',
        'activo' => 'boolean'
    ];

    public function pagos()
    {
        return $this->hasMany(AccionPago::class);
    }
}
