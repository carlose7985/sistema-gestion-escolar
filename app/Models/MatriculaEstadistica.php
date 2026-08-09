<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MatriculaEstadistica extends Model
{
    use HasFactory;
    protected $table = 'matricula_estadisticas';
    protected $guarded = ['id', 'created_at'];

    public function grados()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }

    public function estadisticas()
    {
        return $this->belongsTo(Estadistica::class, 'estadistica_id');
    }
}
