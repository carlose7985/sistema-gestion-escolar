<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodoEscolar extends Model
{
    protected $table = 'periodo_escolars';
    protected $fillable = ['nombre_periodo', 'status_periodo', 'status','inscribe'];

    // Relación con EstudiantePeriodo
    public function estudiantePeriodos()
    {
        return $this->hasMany(EstudiantePeriodo::class, 'periodo_id');
    }

    // Relación con estudiantes a través de estudiante_periodos
    public function estudiantes()
    {
        return $this->hasManyThrough(
            Estudiante::class,
            EstudiantePeriodo::class,
            'periodo_id', // Foreign key on estudiante_periodos table
            'id', // Foreign key on estudiantes table
            'id', // Local key on periodo_escolars table
            'estudiante_id' // Local key on estudiante_periodos table
        );
    }

    // Scopes opcionales para usar directo en Eloquent
    public function scopeActivo($query)
    {
        return $query->where('status', 'Activo');
    }

    public function scopeInactivo($query)
    {
        return $query->where('status', 'Inactivo');
    }

    public function TotalEstudiantes()
    {
        return $this->hasMany(TotalEstudiante::class, 'periodo_id');
    }
}
