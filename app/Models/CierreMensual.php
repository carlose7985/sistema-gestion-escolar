<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CierreMensual extends Model
{
    protected $table = 'cierres_mensuales';

    protected $fillable = [
        'mes',
        'anio',
        'fecha_cierre',
        'estado'
    ];

    protected $casts = [
        'fecha_cierre' => 'date',
    ];

    public static function estaCerrado($mes, $anio)
    {
        $cierre = self::where('mes', $mes)->where('anio', $anio)->first();
        return $cierre && $cierre->estado === 'Cerrado';
    }

    public static function estaAbierto($mes, $anio)
    {
        $cierre = self::where('mes', $mes)->where('anio', $anio)->first();
        return !$cierre || $cierre->estado === 'Abierto';
    }

    public static function cerrar($mes, $anio)
    {
        return self::updateOrCreate(
            ['mes' => $mes, 'anio' => $anio],
            ['estado' => 'Cerrado', 'fecha_cierre' => now()]
        );
    }

    public static function abrir($mes, $anio)
    {
        return self::updateOrCreate(
            ['mes' => $mes, 'anio' => $anio],
            ['estado' => 'Abierto', 'fecha_cierre' => null]
        );
    }
}
