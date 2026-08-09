<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistorialEstadistica extends Model
{
    use HasFactory;
    protected $table = 'historial_estadisticas';
    protected $fillable = ['grado_id', 'contador', 'status_estadistica', 'fecha'];
}
