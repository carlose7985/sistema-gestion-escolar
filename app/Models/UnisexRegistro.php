<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnisexRegistro extends Model
{
    protected $fillable = [
        'estudiante_nombres',
        'estudiante_apellidos',
        'estudiante_fecha_nacimiento',
        'responsable_id',
        'alterno_id',
        'grado_id',
        'status',
        'fecha_registro'
    ];

    public function responsable()
    {
        return $this->belongsTo(Responsable::class, 'responsable_id');
    }
    public function alterno()
    {
        return $this->belongsTo(Responsable::class, 'alterno_id');
    }
    public function grado()
    {
        return $this->belongsTo(Grado::class);
    }

    // Relación con Estudiante
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}
