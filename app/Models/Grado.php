<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grado extends Model
{
    use HasFactory;
    protected $table = 'grados';

    protected $fillable = ['nombre_del_grado', 'seccion', 'docente', 'code_qr','status','limite_de_estudiantes'];
    
    public function estudiantesreprobados()
    {
        return $this->hasMany(EstudianteReprobado::class, 'grado_id');
    }

    public function estudiantesaprobados()
    {
        return $this->hasMany(EstudianteAprobado::class, 'grado_id', 'id');
    }

    public function estudiantesnuevoingreso()
    {
        // Asumiendo que EstudianteNuevoIngreso tiene una columna 'grado_id'
        return $this->hasMany(EstudianteNuevoIngreso::class, 'grado_id');
    }

    public function estudiantesactivos()
    {
        return $this->hasMany(Estudiante::class, 'grado_id');
    }
   
    public function estudiantesrepitientes()
    {
        return $this->hasMany(EstudianteRepitiente::class, 'grado_id');
    }

    public function estudiantesretirados()
    {
        return $this->hasMany(EstudianteRetirado::class, 'grado_id');
    }

    public function asistencias()
    {
        return $this->hasMany(AsistenciaEstudiante::class);
    }


    // Relación con EstudiantePeriodo
    public function estudiantePeriodos()
    {
        return $this->hasMany(EstudiantePeriodo::class, 'grado_id');
    }

    // Relación con estudiantes a través de estudiante_periodos
    public function estudiantes()
    {
        return $this->hasManyThrough(
            Estudiante::class,
            EstudiantePeriodo::class,
            'grado_id', // Foreign key on estudiante_periodos table
            'id', // Foreign key on estudiantes table
            'id', // Local key on grados table
            'estudiante_id' // Local key on estudiante_periodos table
        );
    }
}
