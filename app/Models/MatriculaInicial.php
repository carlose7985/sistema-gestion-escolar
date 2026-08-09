<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MatriculaInicial extends Model
{
    use HasFactory;
    protected $table = 'matricula_inicials';
    protected $fillable = [
        'periodo_escolar',
        'total_varones',
        'total_hembras',
        'total_general',
        'nombre_grado_snapshot',
        'grado_id',
        'v_4',
        'h_4',
        'v_5',
        'h_5',
        'v_6',
        'h_6',
        'v_7',
        'h_7',
        'v_8',
        'h_8',
        'v_9',
        'h_9',
        'v_10',
        'h_10',
        'v_11',
        'h_11',
        'v_12',
        'h_12',
        'v_13',
        'h_13',
        'v_14',
        'h_14',
        'v_15',
        'h_15',
        'v_16',
        'h_16'
    ];

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }
}
