<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Institucion extends Model
{
    protected $table = 'institucions';

    protected $fillable = [
        'nombre_de_la_institucion',
        'direccion',
        'telefono',
        'email',
        'rif',
        'nif',
        'fecha_de_fundada',
        'circuito',
        'estado',
        'municipio',
        'parroquia',
        'dependencia',
        'codigo_de_dependencia',
        'codigo_dea',
        'codigo_estadistico',
        'codigo_cenae',
        'codigo_circuito',
        'codigo_primaria',
        'codigo_electoral',
        'comuna',
        'zona_educativa',
        'turno',
        'medio',
        'tipo_de_escuela',
        'numero_de_aulas',
        'numero_de_secciones',
        'otras_aulas',
    ];

    protected $appends = ['age'];
    public function getAgeAttribute()
    {
        return Carbon::parse($this->fecha_de_fundada)->age;
    }
    protected function nombreDeLaInstitucion(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function direccion(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

    protected function circuito(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function estado(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

    protected function municipio(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

    protected function parroquia(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

    protected function dependencia(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

    protected function comuna(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function zonaEducativa(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

}
