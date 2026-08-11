<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    protected $fillable = [
        'name',
        'apellido',
        'cedula',
        'documento',
        'sexo',
        'fecha_de_nacimiento',
        'lugar_de_nacimiento',
        'entidad_federal',
        'etnia',
        'representante_id',
        'padre_id',
        'parentesco',
        'enfermedades',
        'tratamiento_medico',
        'alergico',
        'condicion_especial',
        'problemas_fisicos',
        'cedulado'
    ];

    // Relación con EstudiantePeriodo
    public function estudiantePeriodos()
    {
        return $this->hasMany(EstudiantePeriodo::class, 'estudiante_id');
    }

    // Relación con periodos a través de estudiante_periodos
    public function periodos()
    {
        return $this->hasManyThrough(
            PeriodoEscolar::class,
            EstudiantePeriodo::class,
            'estudiante_id', // Foreign key on estudiante_periodos table
            'id', // Foreign key on periodo_escolars table
            'id', // Local key on estudiantes table
            'periodo_id' // Local key on estudiante_periodos table
        );
    }

    // Relación con grados a través de estudiante_periodos
    public function grados()
    {
        return $this->hasManyThrough(
            Grado::class,
            EstudiantePeriodo::class,
            'estudiante_id', // Foreign key on estudiante_periodos table
            'id', // Foreign key on grados table
            'id', // Local key on estudiantes table
            'grado_id' // Local key on estudiante_periodos table
        );
    }

    public function representante()
    {
        return $this->belongsTo(Responsable::class, 'representante_id');
    }

    public function padre()
    {
        return $this->belongsTo(Responsable::class, 'padre_id');
    }
}
