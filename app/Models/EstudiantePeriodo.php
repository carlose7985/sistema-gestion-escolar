<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstudiantePeriodo extends Model
{
    use HasFactory;

    protected $table = 'estudiante_periodos';

    // IMPORTANTE: Decirle a Laravel que NO use 'id' como primary key
    protected $primaryKey = null;

    // Decirle que NO es auto-incrementable
    public $incrementing = false;

    protected $fillable = [
        'estudiante_id',
        'periodo_id',
        'grado_id',
        'direccion',
        'instituto_de_procedencia',
        'lateralidad',
        'talla_de_camisa',
        'talla_de_pantalon',
        'talla_de_zapato',
        'condicion',
        'status',
        'status_escolar',
        'matricula_sisge',
        'status_sisge',
        'apreciacion',
        'actualizado',
        'contador_impresiones',
        'calificado',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_registro' => 'date',
    ];

    // Relación con Estudiante
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    // Relación con PeriodoEscolar
    public function periodo()
    {
        return $this->belongsTo(PeriodoEscolar::class, 'periodo_id');
    }

    // Relación con Grado
    public function grado()
    {
        return $this->belongsTo(Grado::class, 'grado_id');
    }

    // Método para encontrar por clave compuesta
    public static function findByCompositeKey($estudianteId, $periodoId, $gradoId)
    {
        return self::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->first();
    }

    // Método para encontrar o fallar por clave compuesta
    public static function findOrFailByCompositeKey($estudianteId, $periodoId, $gradoId)
    {
        $record = self::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->first();

        if (!$record) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }

        return $record;
    }

    // Sobrescribir el método find para que no use 'id'
    public static function find($id, $columns = ['*'])
    {
        // Si es un array con 3 elementos, buscar por clave compuesta
        if (is_array($id) && count($id) === 3) {
            return self::where('estudiante_id', $id[0])
                ->where('periodo_id', $id[1])
                ->where('grado_id', $id[2])
                ->first($columns);
        }

        return null;
    }

    // Sobrescribir el método findOrFail
    public static function findOrFail($id, $columns = ['*'])
    {
        $result = self::find($id, $columns);

        if ($result) {
            return $result;
        }

        throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
    }

    // Método para obtener el ID compuesto como string
    public function getCompositeId()
    {
        return $this->estudiante_id . '-' . $this->periodo_id . '-' . $this->grado_id;
    }
}
