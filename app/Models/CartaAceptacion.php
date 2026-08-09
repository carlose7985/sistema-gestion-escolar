<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartaAceptacion extends Model
{
    protected $table = 'carta_aceptacions';
    protected $fillable = ['nombres', 'apellidos', 'documento', 'cedula', 'sexo', 'tipo_de_personal', 'fecha_registro'];
}
