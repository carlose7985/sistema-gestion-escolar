<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
class Inmueble extends Model
{
    protected $table = 'inmuebles';

    protected $fillable = [
        'tipo_de_inmueble',
        'largo',
        'ancho',
        'alto',
        'color',
        'costo_aproximado',
        'ubicacion',
        'id_scan',
        'cantidad',
        'condicion_legal',
    ];

    protected function tipoDeInmueble(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }
    protected function color(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return ucwords($value);
            }
        );
    }

}
