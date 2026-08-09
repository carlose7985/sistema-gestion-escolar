<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apreciacion extends Model
{
    use HasFactory;

    protected $table = 'apreciacions';

    protected $fillable = [
        'literal',
        'numeral',
        'status',
    ];

    // Scope para obtener solo aprobados
    public function scopeAprobados($query)
    {
        return $query->where('status', 'Aprobado');
    }

    // Scope para obtener solo reprobados
    public function scopeReprobados($query)
    {
        return $query->where('status', 'Reprobado');
    }

    // Método para obtener el nombre completo (literal + numeral)
    public function getNombreCompletoAttribute()
    {
        return $this->numeral ? $this->literal . '-' . $this->numeral : $this->literal;
    }
}
