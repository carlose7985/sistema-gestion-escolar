<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Responsable extends Model
{
    protected $table = 'responsables';
    protected $fillable = [
        'name_r',
        'fecha_de_nacimiento_r',
        'sexo_r',
        'telefono_r',
        'documento_r',
        'cedula_r',
        'direccion_r',
        'ocupacion_r',
        'status_r'
    ];

  

    public function representadosDirectos()
    {
        // Relación con EstudianteActivo mediante padre_id
        return $this->hasMany(Estudiante::class, 'padre_id');
    }

    public function representadosAsociados()
    {
        // Relación con EstudianteActivo mediante representante_id
        return $this->hasMany(Estudiante::class, 'representante_id');
    }

    public function estudiantesActivos()
    {
        return $this->hasMany(Estudiante::class, 'representante_id');
    }
    public function getAgeresAttribute()
    {
        return Carbon::parse($this->attributes['fecha_de_nacimiento_r'])->age;
    }

    protected function nameR(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function direccionR(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function ocupacionR(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
}
