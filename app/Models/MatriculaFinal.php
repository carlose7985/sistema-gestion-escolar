<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MatriculaFinal extends Model
{
    use HasFactory;
    protected $table = 'matricula_finals';
    protected $fillable = [
        'periodo_escolar',
        'total_varones',
        'total_hembras',
        'total_general',
        'nombre_grado_snapshot',
        'grado_id',
    ];

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }
}
