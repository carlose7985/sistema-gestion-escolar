<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plantel extends Model
{
    use HasFactory;

    protected $table = 'plantels'; // Definimos el nombre de la tabla explícitamente

    protected $fillable = [
        'nombre',
        'director',
       
    ];

    // Un plantel tiene muchos estudiantes zonificados hacia él
    public function zonificaciones()
    {
        return $this->hasMany(Zonificacion::class, 'plantel_id');
    }
}
