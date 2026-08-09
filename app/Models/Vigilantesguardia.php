<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VigilanteGuardia extends Model
{
    use HasFactory;

    protected $table = 'vigilante_guardias';

    protected $fillable = [
        'empleado_id',
        'tipo_de_personal',
        'dias_guardia'
    ];

    protected $casts = [
        'dias_guardia' => 'array'
    ];

    public function empleado()
    {
        return $this->belongsTo(EmpleadoActivo::class, 'empleado_id');
    }
}
